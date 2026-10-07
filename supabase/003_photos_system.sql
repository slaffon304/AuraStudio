-- ============================================================================
-- AuraStudio migration: credits → photos
-- Apply in Supabase SQL Editor AFTER FULL_SETUP was already run.
-- Safe to re-run partially (IF EXISTS / ON CONFLICT).
-- ============================================================================

BEGIN;

-- --------------------------------------------------------------------------
-- 1. profiles: credit_balance → photo_balance
-- --------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'credit_balance'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'photo_balance'
  ) THEN
    ALTER TABLE public.profiles RENAME COLUMN credit_balance TO photo_balance;
  END IF;
END $$;

-- Ensure constraint name is sensible (drop old check if present, add new)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_credit_balance_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_photo_balance_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_photo_balance_check CHECK (photo_balance >= 0);

-- Default for NEW rows (existing users keep current balance; we do not auto-reset)
ALTER TABLE public.profiles
  ALTER COLUMN photo_balance SET DEFAULT 1;

-- --------------------------------------------------------------------------
-- 2. templates: credit_cost → photo_cost, force cost = 1
-- --------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'templates' AND column_name = 'credit_cost'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'templates' AND column_name = 'photo_cost'
  ) THEN
    ALTER TABLE public.templates RENAME COLUMN credit_cost TO photo_cost;
  END IF;
END $$;

ALTER TABLE public.templates DROP CONSTRAINT IF EXISTS templates_credit_cost_check;
ALTER TABLE public.templates DROP CONSTRAINT IF EXISTS templates_photo_cost_check;
ALTER TABLE public.templates
  ADD CONSTRAINT templates_photo_cost_check CHECK (photo_cost >= 1);

ALTER TABLE public.templates
  ALTER COLUMN photo_cost SET DEFAULT 1;

UPDATE public.templates SET photo_cost = 1 WHERE photo_cost IS DISTINCT FROM 1;

-- --------------------------------------------------------------------------
-- 3. generation_jobs: credit_cost → photo_cost
-- --------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'generation_jobs' AND column_name = 'credit_cost'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'generation_jobs' AND column_name = 'photo_cost'
  ) THEN
    ALTER TABLE public.generation_jobs RENAME COLUMN credit_cost TO photo_cost;
  END IF;
END $$;

ALTER TABLE public.generation_jobs DROP CONSTRAINT IF EXISTS generation_jobs_credit_cost_check;
ALTER TABLE public.generation_jobs DROP CONSTRAINT IF EXISTS generation_jobs_photo_cost_check;
ALTER TABLE public.generation_jobs
  ADD CONSTRAINT generation_jobs_photo_cost_check CHECK (photo_cost >= 1);

-- --------------------------------------------------------------------------
-- 4. Rename credit_packages → photo_packages + reshape columns
-- --------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'credit_packages'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'photo_packages'
  ) THEN
    ALTER TABLE public.credit_packages RENAME TO photo_packages;
  END IF;
END $$;

-- credits → photos
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'photo_packages' AND column_name = 'credits'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'photo_packages' AND column_name = 'photos'
  ) THEN
    ALTER TABLE public.photo_packages RENAME COLUMN credits TO photos;
  END IF;
END $$;

-- Drop bonus_credits (no longer used)
ALTER TABLE public.photo_packages DROP COLUMN IF EXISTS bonus_credits;

-- Drop MDL/RON prices — product is EUR-only
ALTER TABLE public.photo_packages DROP COLUMN IF EXISTS price_mdl;
ALTER TABLE public.photo_packages DROP COLUMN IF EXISTS price_ron;

-- Ensure price_eur exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'photo_packages' AND column_name = 'price_eur'
  ) THEN
    ALTER TABLE public.photo_packages ADD COLUMN price_eur NUMERIC(10,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

ALTER TABLE public.photo_packages DROP CONSTRAINT IF EXISTS credit_packages_credits_check;
ALTER TABLE public.photo_packages DROP CONSTRAINT IF EXISTS photo_packages_photos_check;
ALTER TABLE public.photo_packages
  ADD CONSTRAINT photo_packages_photos_check CHECK (photos > 0);

-- --------------------------------------------------------------------------
-- 5. Rename credit_transactions → photo_transactions
-- --------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'credit_transactions'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'photo_transactions'
  ) THEN
    ALTER TABLE public.credit_transactions RENAME TO photo_transactions;
  END IF;
END $$;

-- Rename indexes if they still have old names
ALTER INDEX IF EXISTS idx_credit_transactions_user RENAME TO idx_photo_transactions_user;
ALTER INDEX IF EXISTS idx_credit_transactions_ref RENAME TO idx_photo_transactions_ref;

-- --------------------------------------------------------------------------
-- 6. payment_transactions: package FK → photo_packages
-- --------------------------------------------------------------------------
-- Drop old FK if points to credit_packages
ALTER TABLE public.payment_transactions
  DROP CONSTRAINT IF EXISTS payment_transactions_package_id_fkey;

ALTER TABLE public.payment_transactions
  ADD CONSTRAINT payment_transactions_package_id_fkey
  FOREIGN KEY (package_id) REFERENCES public.photo_packages(id);

-- Prefer EUR as default currency going forward (existing rows untouched)
-- currency check already allows EUR

-- --------------------------------------------------------------------------
-- 7. Seed ONLY landing packages (remove old packs)
-- --------------------------------------------------------------------------
DELETE FROM public.photo_packages
WHERE id NOT IN ('pack5', 'pack10', 'pack40');

INSERT INTO public.photo_packages (
  id, name_ro, name_ru, name_en, photos, price_eur,
  is_popular, is_best_value, is_active
) VALUES
  (
    'pack5',
    'Pachet 5 foto',
    'Пакет 5 фото',
    '5 photos pack',
    5, 2.90,
    false, false, true
  ),
  (
    'pack10',
    'Pachet 10 foto',
    'Пакет 10 фото',
    '10 photos pack',
    10, 4.90,
    true, false, true
  ),
  (
    'pack40',
    'Pachet 40 foto',
    'Пакет 40 фото',
    '40 photos pack',
    40, 11.60,
    false, true, true
  )
ON CONFLICT (id) DO UPDATE SET
  name_ro = EXCLUDED.name_ro,
  name_ru = EXCLUDED.name_ru,
  name_en = EXCLUDED.name_en,
  photos = EXCLUDED.photos,
  price_eur = EXCLUDED.price_eur,
  is_popular = EXCLUDED.is_popular,
  is_best_value = EXCLUDED.is_best_value,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- --------------------------------------------------------------------------
-- 8. Profile security trigger → photo_balance
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_profile_security()
RETURNS TRIGGER AS $$
DECLARE
  v_is_service_role BOOLEAN;
  v_is_internal_photo_op BOOLEAN;
  v_is_internal_role_op BOOLEAN;
  v_is_internal_email_op BOOLEAN;
BEGIN
  v_is_service_role := (
    current_user = 'service_role'
    OR current_setting('request.jwt.claim.role', true) = 'service_role'
    OR auth.role() = 'service_role'
  );

  IF v_is_service_role THEN
    RETURN NEW;
  END IF;

  -- Support both old and new session flags during transition
  v_is_internal_photo_op := (
    current_setting('app.internal_photo_op', true) = 'true'
    OR current_setting('app.internal_credit_op', true) = 'true'
  );
  v_is_internal_role_op := (current_setting('app.internal_role_op', true) = 'true');
  v_is_internal_email_op := (current_setting('app.internal_email_op', true) = 'true');

  IF NEW.role IS DISTINCT FROM OLD.role AND NOT v_is_internal_role_op THEN
    RAISE EXCEPTION 'SECURITY_VIOLATION: Direct modification of profile role is strictly prohibited.';
  END IF;

  IF NEW.photo_balance IS DISTINCT FROM OLD.photo_balance AND NOT v_is_internal_photo_op THEN
    RAISE EXCEPTION 'SECURITY_VIOLATION: Direct modification of photo_balance is strictly prohibited. Photos must be managed through designated server procedures.';
  END IF;

  IF NEW.email IS DISTINCT FROM OLD.email AND NOT v_is_internal_email_op THEN
    RAISE EXCEPTION 'SECURITY_VIOLATION: Direct modification of email is strictly prohibited.';
  END IF;

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

-- --------------------------------------------------------------------------
-- 9. Welcome: 1 photo on registration
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
  v_country TEXT;
  v_lang TEXT;
BEGIN
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  v_country := COALESCE(NEW.raw_user_meta_data->>'country', 'Moldova');
  IF v_country NOT IN ('Moldova', 'Romania', 'Other') THEN
    v_country := 'Moldova';
  END IF;

  v_lang := COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ro');
  IF v_lang NOT IN ('ro', 'ru', 'en') THEN
    v_lang := 'ro';
  END IF;

  INSERT INTO public.profiles (
    id, name, email, avatar_url, role, country,
    preferred_language, preferred_currency, photo_balance
  ) VALUES (
    NEW.id,
    v_name,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'user',
    v_country,
    v_lang,
    'EUR',
    1
  );

  INSERT INTO public.photo_transactions (
    user_id, type, amount, balance_after, description, reference_id
  ) VALUES (
    NEW.id,
    'welcome_bonus',
    1,
    1,
    'Cadou de bun venit AuraStudio (1 foto)',
    'signup_bonus'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------------------------
-- 10. Atomic deduct photos for generation
--    p_amount: 1 = standard, 2 = 4K upgrade (video 8 later)
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.deduct_photos_for_generation(
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
  IF p_amount IS NULL OR p_amount < 1 THEN
    RAISE EXCEPTION 'INVALID_AMOUNT';
  END IF;

  PERFORM set_config('app.internal_photo_op', 'true', true);

  SELECT photo_balance INTO v_current_balance
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'USER_NOT_FOUND';
  END IF;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_PHOTOS';
  END IF;

  v_new_balance := v_current_balance - p_amount;

  UPDATE public.profiles
  SET photo_balance = v_new_balance
  WHERE id = p_user_id;

  INSERT INTO public.photo_transactions (
    user_id, type, amount, balance_after, description, reference_id
  ) VALUES (
    p_user_id,
    'generation_spend',
    -p_amount,
    v_new_balance,
    'Generare foto: ' || COALESCE(p_template_name, 'Șablon'),
    p_job_id
  );

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------------
-- 11. Atomic refund on failed job
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.refund_photos_for_failed_job(
  p_job_id UUID,
  p_error_message TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_user_id UUID;
  v_photo_cost INTEGER;
  v_template_name TEXT;
  v_already_refunded BOOLEAN;
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  PERFORM set_config('app.internal_photo_op', 'true', true);

  SELECT j.user_id, j.photo_cost, COALESCE(t.name_ro, 'Șablon')
  INTO v_user_id, v_photo_cost, v_template_name
  FROM public.generation_jobs j
  LEFT JOIN public.templates t ON t.id = j.template_id
  WHERE j.id = p_job_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'JOB_NOT_FOUND';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.photo_transactions
    WHERE reference_id = p_job_id::TEXT AND type = 'generation_refund'
  ) INTO v_already_refunded;

  IF v_already_refunded THEN
    RAISE EXCEPTION 'JOB_ALREADY_REFUNDED';
  END IF;

  SELECT photo_balance INTO v_current_balance
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  v_new_balance := v_current_balance + v_photo_cost;

  UPDATE public.profiles
  SET photo_balance = v_new_balance
  WHERE id = v_user_id;

  UPDATE public.generation_jobs
  SET status = 'failed',
      progress = 0,
      current_step_message = 'Generare eșuată (foto restituite)',
      error_message = COALESCE(p_error_message, error_message, 'Generare eșuată'),
      completed_at = now()
  WHERE id = p_job_id;

  INSERT INTO public.photo_transactions (
    user_id, type, amount, balance_after, description, reference_id
  ) VALUES (
    v_user_id,
    'generation_refund',
    v_photo_cost,
    v_new_balance,
    'Restituire foto (eroare generare): ' || v_template_name,
    p_job_id::TEXT
  );

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------------
-- 12. Admin adjust photos
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_adjust_photos(
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
  PERFORM set_config('app.internal_photo_op', 'true', true);

  SELECT role INTO v_admin_role
  FROM public.profiles
  WHERE id = p_admin_id;

  IF v_admin_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'UNAUTHORIZED_NOT_ADMIN';
  END IF;

  SELECT photo_balance INTO v_current_balance
  FROM public.profiles
  WHERE id = p_target_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'TARGET_USER_NOT_FOUND';
  END IF;

  v_new_balance := GREATEST(0, v_current_balance + p_amount);
  v_tx_type := CASE WHEN p_amount >= 0 THEN 'admin_grant' ELSE 'admin_deduct' END;

  UPDATE public.profiles
  SET photo_balance = v_new_balance
  WHERE id = p_target_user_id;

  INSERT INTO public.photo_transactions (
    user_id, type, amount, balance_after, description, reference_id
  ) VALUES (
    p_target_user_id,
    v_tx_type,
    p_amount,
    v_new_balance,
    COALESCE(p_reason, 'Admin adjustment'),
    p_admin_id::TEXT
  );

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------------
-- 13. PROFESSIONAL: grant photos after successful payment (idempotent)
--     Call from server AFTER payment provider confirms paid status.
--     Same payment_transaction id can be processed only once.
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.grant_photos_from_purchase(
  p_payment_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_user_id UUID;
  v_package_id TEXT;
  v_status TEXT;
  v_photos INTEGER;
  v_package_name TEXT;
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_already_granted BOOLEAN;
BEGIN
  PERFORM set_config('app.internal_photo_op', 'true', true);

  SELECT pt.user_id, pt.package_id, pt.status
  INTO v_user_id, v_package_id, v_status
  FROM public.payment_transactions pt
  WHERE pt.id = p_payment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PAYMENT_NOT_FOUND';
  END IF;

  IF v_status IS DISTINCT FROM 'paid' THEN
    RAISE EXCEPTION 'PAYMENT_NOT_PAID';
  END IF;

  -- Idempotency: one grant per payment
  SELECT EXISTS (
    SELECT 1 FROM public.photo_transactions
    WHERE reference_id = p_payment_id::TEXT AND type = 'purchase'
  ) INTO v_already_granted;

  IF v_already_granted THEN
    SELECT photo_balance INTO v_current_balance
    FROM public.profiles WHERE id = v_user_id;
    RETURN v_current_balance;
  END IF;

  SELECT pp.photos, COALESCE(pp.name_ro, pp.id)
  INTO v_photos, v_package_name
  FROM public.photo_packages pp
  WHERE pp.id = v_package_id AND pp.is_active = true;

  IF v_photos IS NULL OR v_photos < 1 THEN
    RAISE EXCEPTION 'PACKAGE_NOT_FOUND_OR_INACTIVE';
  END IF;

  SELECT photo_balance INTO v_current_balance
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'USER_NOT_FOUND';
  END IF;

  v_new_balance := v_current_balance + v_photos;

  UPDATE public.profiles
  SET photo_balance = v_new_balance
  WHERE id = v_user_id;

  INSERT INTO public.photo_transactions (
    user_id, type, amount, balance_after, description, reference_id
  ) VALUES (
    v_user_id,
    'purchase',
    v_photos,
    v_new_balance,
    'Cumpărare pachet: ' || v_package_name || ' (+' || v_photos || ' foto)',
    p_payment_id::TEXT
  );

  UPDATE public.payment_transactions
  SET completed_at = COALESCE(completed_at, now())
  WHERE id = p_payment_id;

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------------
-- 14. Drop old credit_* functions (if still present)
-- --------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.deduct_credits_for_generation(UUID, INTEGER, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.refund_credits_for_failed_job(UUID, TEXT);
DROP FUNCTION IF EXISTS public.admin_adjust_credits(UUID, UUID, INTEGER, TEXT);

-- --------------------------------------------------------------------------
-- 15. Grants (service_role only — never expose to anon/authenticated directly)
-- --------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.deduct_photos_for_generation(UUID, INTEGER, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_photos_for_failed_job(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_adjust_photos(UUID, UUID, INTEGER, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_photos_from_purchase(UUID) TO service_role;

-- --------------------------------------------------------------------------
-- 16. RLS: rename-friendly policies for photo_packages / photo_transactions
-- --------------------------------------------------------------------------
ALTER TABLE public.photo_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Credit packages are readable" ON public.photo_packages;
DROP POLICY IF EXISTS "Photo packages are readable" ON public.photo_packages;
CREATE POLICY "Photo packages are readable"
  ON public.photo_packages FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

DROP POLICY IF EXISTS "Users read own credit transactions" ON public.photo_transactions;
DROP POLICY IF EXISTS "Users read own photo transactions" ON public.photo_transactions;
CREATE POLICY "Users read own photo transactions"
  ON public.photo_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can read all transactions
DROP POLICY IF EXISTS "Admins read all photo transactions" ON public.photo_transactions;
CREATE POLICY "Admins read all photo transactions"
  ON public.photo_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

COMMIT;

-- ============================================================================
-- NOTES FOR APP / SERVER (manual follow-up, not in this SQL):
-- 1. server.ts: rpc names
--    deduct_credits_for_generation → deduct_photos_for_generation
--    refund_credits_for_failed_job → refund_photos_for_failed_job
--    admin_adjust_credits → admin_adjust_photos
--    columns: credit_balance → photo_balance, credit_cost → photo_cost
--    error: INSUFFICIENT_CREDITS → INSUFFICIENT_PHOTOS
-- 2. After payment webhook marks payment_transactions.status = 'paid',
--    call: SELECT grant_photos_from_purchase('<payment_uuid>');
-- 3. Generation cost: always 1; 4K upgrade: pass p_amount = 2; video later: 8.
-- 4. Frontend: creditBalance → photoBalance, packages from /api/photo-packages
--    (or keep endpoint name and query photo_packages table).
-- 5. Existing users keep their current numeric balance (was credits, now photos).
--    If you need to reset everyone to 1, run separately:
--      UPDATE public.profiles SET photo_balance = 1;
-- ============================================================================
