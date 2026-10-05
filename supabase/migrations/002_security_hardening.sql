-- ====================================================================
-- AuraStudio - Security Hardening Migration (002)
-- Enforces Database-Level Profile Security, Credit Balance Invariants,
-- RLS Policy Restrictions, and RPC Execution Permissions
-- ====================================================================

-- 1. PROFILE SECURITY TRIGGER
-- Strictly prevents unauthorized modification of role, credit_balance, email, and id.
CREATE OR REPLACE FUNCTION public.enforce_profile_security()
RETURNS TRIGGER AS $$
DECLARE
  v_is_service_role BOOLEAN;
  v_is_internal_credit_op BOOLEAN;
  v_is_internal_role_op BOOLEAN;
  v_is_internal_email_op BOOLEAN;
BEGIN
  -- Determine execution context
  -- When running with SUPABASE_SECRET_KEY, current_user = 'service_role' or request.jwt.claim.role = 'service_role'
  v_is_service_role := (
    current_user = 'service_role'
    OR current_setting('request.jwt.claim.role', true) = 'service_role'
    OR auth.role() = 'service_role'
  );

  IF v_is_service_role THEN
    RETURN NEW;
  END IF;

  v_is_internal_credit_op := (current_setting('app.internal_credit_op', true) = 'true');
  v_is_internal_role_op := (current_setting('app.internal_role_op', true) = 'true');
  v_is_internal_email_op := (current_setting('app.internal_email_op', true) = 'true');

  -- 1. Strictly forbid direct modification of role by users or client queries
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT v_is_internal_role_op THEN
    RAISE EXCEPTION 'SECURITY_VIOLATION: Direct modification of profile role is strictly prohibited. Admin promotion can only be performed via protected server procedure.';
  END IF;

  -- 2. Strictly forbid direct modification of credit_balance by users or client queries
  IF NEW.credit_balance IS DISTINCT FROM OLD.credit_balance AND NOT v_is_internal_credit_op THEN
    RAISE EXCEPTION 'SECURITY_VIOLATION: Direct modification of credit_balance is strictly prohibited. Credits must be managed through designated server procedures.';
  END IF;

  -- 3. Strictly forbid direct modification of email
  IF NEW.email IS DISTINCT FROM OLD.email AND NOT v_is_internal_email_op THEN
    RAISE EXCEPTION 'SECURITY_VIOLATION: Direct modification of email is strictly prohibited. Email changes must go through Supabase Auth.';
  END IF;

  -- 4. Strictly forbid modifying profile ID or created_at
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'SECURITY_VIOLATION: Changing profile ID is strictly prohibited.';
  END IF;

  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'SECURITY_VIOLATION: Changing profile creation timestamp is strictly prohibited.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_profile_security ON public.profiles;
CREATE TRIGGER trg_enforce_profile_security
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_security();

-- 2. HARDENED STORED PROCEDURES WITH INTERNAL CONTEXT AUTHORIZATION

-- ATOMIC DEDUCTION FOR GENERATION
CREATE OR REPLACE FUNCTION public.deduct_credits_for_generation(
  p_user_id UUID,
  p_amount INTEGER,
  p_template_id TEXT,
  p_template_name TEXT,
  p_job_id TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Authorize internal credit operation for profile security trigger
  PERFORM set_config('app.internal_credit_op', 'true', true);

  -- Strict row-level lock on profile to prevent race conditions
  SELECT credit_balance INTO v_current_balance
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'USER_NOT_FOUND';
  END IF;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
  END IF;

  v_new_balance := v_current_balance - p_amount;

  UPDATE public.profiles
  SET credit_balance = v_new_balance
  WHERE id = p_user_id;

  INSERT INTO public.credit_transactions (
    user_id,
    type,
    amount,
    balance_after,
    description,
    reference_id
  ) VALUES (
    p_user_id,
    'generation_spend',
    -p_amount,
    v_new_balance,
    'Generare foto: ' || p_template_name,
    p_job_id
  );

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ATOMIC REFUND FOR FAILED JOB (PREVENTS DOUBLE-REFUND)
CREATE OR REPLACE FUNCTION public.refund_credits_for_failed_job(
  p_job_id UUID,
  p_error_message TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_user_id UUID;
  v_credit_cost INTEGER;
  v_status TEXT;
  v_template_name TEXT;
  v_already_refunded BOOLEAN;
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Authorize internal credit operation for profile security trigger
  PERFORM set_config('app.internal_credit_op', 'true', true);

  -- Check if job exists
  SELECT j.user_id, j.credit_cost, j.status, COALESCE(t.name_ro, 'Șablon')
  INTO v_user_id, v_credit_cost, v_status, v_template_name
  FROM public.generation_jobs j
  LEFT JOIN public.templates t ON t.id = j.template_id
  WHERE j.id = p_job_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'JOB_NOT_FOUND';
  END IF;

  -- Ensure not already refunded
  SELECT EXISTS (
    SELECT 1 FROM public.credit_transactions
    WHERE reference_id = p_job_id::TEXT AND type = 'generation_refund'
  ) INTO v_already_refunded;

  IF v_already_refunded THEN
    RAISE EXCEPTION 'JOB_ALREADY_REFUNDED';
  END IF;

  -- Lock and update user profile
  SELECT credit_balance INTO v_current_balance
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  v_new_balance := v_current_balance + v_credit_cost;

  UPDATE public.profiles
  SET credit_balance = v_new_balance
  WHERE id = v_user_id;

  -- Update job status to failed
  UPDATE public.generation_jobs
  SET status = 'failed',
      progress = 0,
      current_step_message = 'Generare eșuată (credite restituite)',
      error_message = COALESCE(p_error_message, error_message, 'Generare eșuată'),
      completed_at = now()
  WHERE id = p_job_id;

  -- Insert refund transaction
  INSERT INTO public.credit_transactions (
    user_id,
    type,
    amount,
    balance_after,
    description,
    reference_id
  ) VALUES (
    v_user_id,
    'generation_refund',
    v_credit_cost,
    v_new_balance,
    'Restituire credite (eroare generare): ' || v_template_name,
    p_job_id::TEXT
  );

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ADMIN MANUAL CREDIT ADJUSTMENT
CREATE OR REPLACE FUNCTION public.admin_adjust_credits(
  p_admin_id UUID,
  p_target_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_admin_role TEXT;
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_tx_type TEXT;
BEGIN
  -- Authorize internal credit operation for profile security trigger
  PERFORM set_config('app.internal_credit_op', 'true', true);

  -- Verify admin role
  SELECT role INTO v_admin_role
  FROM public.profiles
  WHERE id = p_admin_id;

  IF v_admin_role <> 'admin' THEN
    RAISE EXCEPTION 'UNAUTHORIZED_NOT_ADMIN';
  END IF;

  -- Lock target user
  SELECT credit_balance INTO v_current_balance
  FROM public.profiles
  WHERE id = p_target_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'TARGET_USER_NOT_FOUND';
  END IF;

  v_new_balance := GREATEST(0, v_current_balance + p_amount);
  v_tx_type := CASE WHEN p_amount >= 0 THEN 'admin_grant' ELSE 'admin_deduct' END;

  UPDATE public.profiles
  SET credit_balance = v_new_balance
  WHERE id = p_target_user_id;

  INSERT INTO public.credit_transactions (
    user_id,
    type,
    amount,
    balance_after,
    description,
    reference_id
  ) VALUES (
    p_target_user_id,
    v_tx_type,
    p_amount,
    v_new_balance,
    'Ajustare administrator: ' || COALESCE(p_reason, 'Fără motiv specificat'),
    p_admin_id::TEXT
  );

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ADMIN ROLE MANAGEMENT
CREATE OR REPLACE FUNCTION public.admin_set_user_role(
  p_admin_id UUID,
  p_target_user_id UUID,
  p_new_role TEXT
)
RETURNS TEXT AS $$
DECLARE
  v_admin_role TEXT;
BEGIN
  -- Verify caller is genuine admin
  SELECT role INTO v_admin_role
  FROM public.profiles
  WHERE id = p_admin_id;

  IF v_admin_role <> 'admin' THEN
    RAISE EXCEPTION 'UNAUTHORIZED_NOT_ADMIN';
  END IF;

  IF p_new_role NOT IN ('user', 'admin') THEN
    RAISE EXCEPTION 'INVALID_ROLE: Role must be user or admin';
  END IF;

  -- Authorize internal role operation for profile security trigger
  PERFORM set_config('app.internal_role_op', 'true', true);

  UPDATE public.profiles
  SET role = p_new_role
  WHERE id = p_target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'TARGET_USER_NOT_FOUND';
  END IF;

  RETURN p_new_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. HARDENED ROW LEVEL SECURITY (RLS) POLICIES

-- PROFILES: Users can only update non-security fields (name, avatar, country, preferred_language, preferred_currency)
DROP POLICY IF EXISTS "Users can update own profile (non-role fields)" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own safe profile fields" ON public.profiles;

CREATE POLICY "Users can update own safe profile fields"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    AND credit_balance = (SELECT p.credit_balance FROM public.profiles p WHERE p.id = auth.uid())
    AND email = (SELECT p.email FROM public.profiles p WHERE p.id = auth.uid())
  );

-- GENERATION JOBS: Normal users can only SELECT their jobs. Creation & updates are handled by backend / admin.
DROP POLICY IF EXISTS "Users can insert own generation jobs" ON public.generation_jobs;
DROP POLICY IF EXISTS "Admins can update generation jobs" ON public.generation_jobs;
DROP POLICY IF EXISTS "Admins can manage generation jobs" ON public.generation_jobs;

CREATE POLICY "Admins can manage generation jobs"
  ON public.generation_jobs FOR ALL
  TO authenticated
  USING (public.is_admin());

-- CREDIT TRANSACTIONS: Read-only for users & admins. Writes exclusively via server functions.
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.credit_transactions;

CREATE POLICY "Admins can view all transactions"
  ON public.credit_transactions FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 4. RPC EXECUTION PERMISSIONS
-- Revoke execution from PUBLIC, anon, and authenticated so client-side PostgREST cannot invoke them directly.
REVOKE EXECUTE ON FUNCTION public.deduct_credits_for_generation(UUID, INTEGER, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_credits_for_generation(UUID, INTEGER, TEXT, TEXT, TEXT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.refund_credits_for_failed_job(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refund_credits_for_failed_job(UUID, TEXT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.admin_adjust_credits(UUID, UUID, INTEGER, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_adjust_credits(UUID, UUID, INTEGER, TEXT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(UUID, UUID, TEXT) TO service_role;
