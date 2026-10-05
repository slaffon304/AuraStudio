-- ====================================================================
-- AuraStudio - Complete PostgreSQL Database Schema & Migration (001)
-- Platform: Supabase (PostgreSQL with Auth, Storage, and RLS)
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 2. Tables Definition
-- ====================================================================

-- PROFILES (Linked directly to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  country TEXT NOT NULL DEFAULT 'Moldova' CHECK (country IN ('Moldova', 'Romania', 'Other')),
  preferred_language TEXT NOT NULL DEFAULT 'ro' CHECK (preferred_language IN ('ro', 'ru', 'en')),
  preferred_currency TEXT NOT NULL DEFAULT 'MDL' CHECK (preferred_currency IN ('MDL', 'RON', 'EUR')),
  credit_balance INTEGER NOT NULL DEFAULT 15 CHECK (credit_balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name_ro TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  name_en TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TEMPLATES
CREATE TABLE IF NOT EXISTS public.templates (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON UPDATE CASCADE,
  name_ro TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ro TEXT NOT NULL,
  description_ru TEXT NOT NULL,
  description_en TEXT NOT NULL,
  preview_image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  aspect_ratio TEXT NOT NULL DEFAULT '3:4' CHECK (aspect_ratio IN ('1:1', '3:4', '4:3', '9:16', '16:9')),
  credit_cost INTEGER NOT NULL DEFAULT 2 CHECK (credit_cost >= 1),
  required_input_type TEXT NOT NULL DEFAULT 'single_portrait' CHECK (required_input_type IN ('single_portrait', 'couple_portrait', 'full_body', 'group_family', 'any')),
  provider_hint TEXT DEFAULT 'gemini-genai',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- USER PHOTOS (Metadata for files in private 'user-photos' storage bucket)
CREATE TABLE IF NOT EXISTS public.user_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GENERATION JOBS (Central asynchronous pipeline source of truth)
CREATE TABLE IF NOT EXISTS public.generation_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL REFERENCES public.templates(id) ON UPDATE CASCADE,
  user_photo_id UUID REFERENCES public.user_photos(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_step_message TEXT,
  provider_id TEXT NOT NULL DEFAULT 'gemini-genai',
  provider_job_id TEXT,
  credit_cost INTEGER NOT NULL CHECK (credit_cost >= 1),
  aspect_ratio TEXT NOT NULL DEFAULT '3:4',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- GENERATED IMAGES (Metadata for results in private 'generated-images' storage bucket)
CREATE TABLE IF NOT EXISTS public.generated_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.generation_jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CREDIT PACKAGES
CREATE TABLE IF NOT EXISTS public.credit_packages (
  id TEXT PRIMARY KEY,
  name_ro TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  name_en TEXT NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  bonus_credits INTEGER NOT NULL DEFAULT 0,
  price_mdl NUMERIC(10,2) NOT NULL,
  price_ron NUMERIC(10,2) NOT NULL,
  price_eur NUMERIC(10,2) NOT NULL,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_best_value BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CREDIT TRANSACTIONS (Audited ledger for all balance changes)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'generation_spend', 'generation_refund', 'admin_grant', 'admin_deduct', 'welcome_bonus')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PAYMENT TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_transaction_id TEXT,
  package_id TEXT REFERENCES public.credit_packages(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('MDL', 'RON', 'EUR')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- AI PROVIDERS
CREATE TABLE IF NOT EXISTS public.ai_providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
  description TEXT NOT NULL,
  is_configured BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,
  model_identifier TEXT NOT NULL,
  average_latency_seconds INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 3. Indexes for Performance
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category_id);
CREATE INDEX IF NOT EXISTS idx_templates_active ON public.templates(is_active);
CREATE INDEX IF NOT EXISTS idx_user_photos_user ON public.user_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_user ON public.generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status ON public.generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_generated_images_job ON public.generated_images(job_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_user ON public.generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_ref ON public.credit_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON public.payment_transactions(user_id);

-- ====================================================================
-- 4. Triggers: updated_at auto-update
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_credit_packages_updated_at
  BEFORE UPDATE ON public.credit_packages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 5. Trigger: Auto-create Profile & Welcome Bonus on Auth Registration
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
  v_country TEXT;
BEGIN
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  v_country := COALESCE(NEW.raw_user_meta_data->>'country', 'Moldova');

  IF v_country NOT IN ('Moldova', 'Romania', 'Other') THEN
    v_country := 'Moldova';
  END IF;

  -- Create user profile with 15 initial welcome credits
  INSERT INTO public.profiles (
    id,
    name,
    email,
    avatar_url,
    role,
    country,
    preferred_language,
    preferred_currency,
    credit_balance
  ) VALUES (
    NEW.id,
    v_name,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'user',
    v_country,
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ro'),
    CASE WHEN v_country = 'Romania' THEN 'RON' ELSE 'MDL' END,
    15
  );

  -- Record welcome bonus transaction in audited ledger
  INSERT INTO public.credit_transactions (
    user_id,
    type,
    amount,
    balance_after,
    description,
    reference_id
  ) VALUES (
    NEW.id,
    'welcome_bonus',
    15,
    15,
    'Cadou de bun venit AuraStudio (15 credite)',
    'signup_bonus'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- 5.1 Profile Security Trigger: Strict Database-Level Enforcement
-- Prevents any non-service-role client from tampering with role, credit_balance, email, id
-- ====================================================================
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

-- ====================================================================
-- 6. Atomic Secure Functions for Credits
-- ====================================================================

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

-- ====================================================================
-- 7. Supabase Storage Buckets
-- ====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'user-photos',
    'user-photos',
    false,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  ),
  (
    'generated-images',
    'generated-images',
    false,
    20971520,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ====================================================================
-- 8. Row Level Security (RLS) Policies
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;

-- HELPER: Check if current caller is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES POLICIES
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

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

-- CATEGORIES POLICIES
CREATE POLICY "Active categories are publicly readable"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- TEMPLATES POLICIES
CREATE POLICY "Active templates are publicly readable"
  ON public.templates FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage templates"
  ON public.templates FOR ALL
  USING (public.is_admin());

-- USER PHOTOS POLICIES
CREATE POLICY "Users can view own photos"
  ON public.user_photos FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own photos"
  ON public.user_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON public.user_photos FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- GENERATION JOBS POLICIES (Users read-only; creation & updates handled securely by server backend)
CREATE POLICY "Users can view own generation jobs"
  ON public.generation_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can manage generation jobs"
  ON public.generation_jobs FOR ALL
  TO authenticated
  USING (public.is_admin());

-- GENERATED IMAGES POLICIES
CREATE POLICY "Users can view own generated images"
  ON public.generated_images FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- CREDIT PACKAGES POLICIES
CREATE POLICY "Credit packages are readable"
  ON public.credit_packages FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage credit packages"
  ON public.credit_packages FOR ALL
  USING (public.is_admin());

-- CREDIT TRANSACTIONS POLICIES (Audited append-only ledger; client writes forbidden)
CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can view all transactions"
  ON public.credit_transactions FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- PAYMENT TRANSACTIONS POLICIES
CREATE POLICY "Users can view own payments"
  ON public.payment_transactions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- AI PROVIDERS POLICIES
CREATE POLICY "Authenticated users can view AI providers"
  ON public.ai_providers FOR SELECT
  USING (auth.role() = 'authenticated' OR public.is_admin());

-- Admins can manage AI providers
CREATE POLICY "Admins can manage AI providers"
  ON public.ai_providers FOR ALL
  USING (public.is_admin());

-- ====================================================================
-- 9. Storage RLS Policies
-- ====================================================================

-- user-photos bucket: user owns folder matching auth.uid()
CREATE POLICY "Users can upload their own user-photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read their own user-photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'user-photos'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
  );

CREATE POLICY "Users can delete their own user-photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-photos'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
  );

-- generated-images bucket: user can read their own generated images
CREATE POLICY "Users can read their own generated-images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'generated-images'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
  );

-- ====================================================================
-- 10. RPC Security: Revoke Client Execution on Sensitive Functions
-- Prevents clients from invoking privileged credit or role RPCs directly
-- ====================================================================
REVOKE EXECUTE ON FUNCTION public.deduct_credits_for_generation(UUID, INTEGER, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_credits_for_generation(UUID, INTEGER, TEXT, TEXT, TEXT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.refund_credits_for_failed_job(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refund_credits_for_failed_job(UUID, TEXT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.admin_adjust_credits(UUID, UUID, INTEGER, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_adjust_credits(UUID, UUID, INTEGER, TEXT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(UUID, UUID, TEXT) TO service_role;
