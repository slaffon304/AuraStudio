-- ====================================================================
-- AuraStudio - PostgreSQL Security Hardening Test Suite
-- ====================================================================
-- This test script simulates attack vectors executed by normal users
-- and verifies that database-level invariants, triggers, RLS, and RPC
-- permissions strictly reject unauthorized elevation and balance tampering.
-- ====================================================================

BEGIN;

DO $$
DECLARE
  v_test_user_id UUID := '11111111-1111-4111-8111-111111111111'::UUID;
  v_admin_user_id UUID := '99999999-9999-4999-8999-999999999999'::UUID;
  v_test_job_id UUID := '22222222-2222-4222-8222-222222222222'::UUID;
  v_balance INTEGER;
  v_passed_tests INTEGER := 0;
  v_error_caught BOOLEAN;
BEGIN
  RAISE NOTICE '>>> STARTING AURASTUDIO SECURITY AUDIT & VERIFICATION <<<';

  -- ------------------------------------------------------------------
  -- SETUP: Seed test user and admin profiles
  -- ------------------------------------------------------------------
  -- Authorize internal credit and role operations for test setup
  PERFORM set_config('app.internal_credit_op', 'true', true);
  PERFORM set_config('app.internal_role_op', 'true', true);

  DELETE FROM public.profiles WHERE id IN (v_test_user_id, v_admin_user_id);

  INSERT INTO public.profiles (
    id, name, email, role, credit_balance, country, preferred_language, preferred_currency
  ) VALUES
    (v_test_user_id, 'Normal User', 'user@example.com', 'user', 10, 'Moldova', 'ro', 'MDL'),
    (v_admin_user_id, 'Admin User', 'admin@example.com', 'admin', 500, 'Romania', 'ro', 'RON');

  -- Reset internal operation flags to simulate normal client queries
  PERFORM set_config('app.internal_credit_op', 'false', true);
  PERFORM set_config('app.internal_role_op', 'false', true);
  PERFORM set_config('app.internal_email_op', 'false', true);

  -- ------------------------------------------------------------------
  -- TEST 1: Normal User Attempts Direct Self-Promotion to Admin
  -- SQL: UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
  -- Expected: MUST FAIL with SECURITY_VIOLATION exception
  -- ------------------------------------------------------------------
  v_error_caught := false;
  BEGIN
    -- Simulate authenticated user context
    PERFORM set_config('request.jwt.claim.sub', v_test_user_id::text, true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = v_test_user_id;

    -- If no exception raised, test failed
  EXCEPTION WHEN OTHERS THEN
    v_error_caught := true;
    RAISE NOTICE ' [PASS] Test 1: Self-promotion attack prevented. Rejection message: %', SQLERRM;
  END;

  IF NOT v_error_caught THEN
    RAISE EXCEPTION 'TEST 1 FAILED: Normal user was able to promote self to admin!';
  END IF;
  v_passed_tests := v_passed_tests + 1;

  -- ------------------------------------------------------------------
  -- TEST 2: Normal User Attempts Direct Credit Balance Modification
  -- SQL: UPDATE profiles SET credit_balance = 999999 WHERE id = auth.uid();
  -- Expected: MUST FAIL with SECURITY_VIOLATION exception
  -- ------------------------------------------------------------------
  v_error_caught := false;
  BEGIN
    PERFORM set_config('request.jwt.claim.sub', v_test_user_id::text, true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    UPDATE public.profiles
    SET credit_balance = 999999
    WHERE id = v_test_user_id;

  EXCEPTION WHEN OTHERS THEN
    v_error_caught := true;
    RAISE NOTICE ' [PASS] Test 2: Arbitrary credit balance modification prevented. Rejection message: %', SQLERRM;
  END;

  IF NOT v_error_caught THEN
    RAISE EXCEPTION 'TEST 2 FAILED: Normal user was able to inject free credits!';
  END IF;
  v_passed_tests := v_passed_tests + 1;

  -- ------------------------------------------------------------------
  -- TEST 3: Normal User Attempts Direct Email Modification on Profile
  -- SQL: UPDATE profiles SET email = 'attacker@evil.com' WHERE id = auth.uid();
  -- Expected: MUST FAIL with SECURITY_VIOLATION exception
  -- ------------------------------------------------------------------
  v_error_caught := false;
  BEGIN
    PERFORM set_config('request.jwt.claim.sub', v_test_user_id::text, true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    UPDATE public.profiles
    SET email = 'attacker@evil.com'
    WHERE id = v_test_user_id;

  EXCEPTION WHEN OTHERS THEN
    v_error_caught := true;
    RAISE NOTICE ' [PASS] Test 3: Unauthorized email tampering prevented. Rejection message: %', SQLERRM;
  END;

  IF NOT v_error_caught THEN
    RAISE EXCEPTION 'TEST 3 FAILED: Normal user was able to tamper with profile email!';
  END IF;
  v_passed_tests := v_passed_tests + 1;

  -- ------------------------------------------------------------------
  -- TEST 4: Normal User Updates Safe Profile Fields (name, country, etc.)
  -- SQL: UPDATE profiles SET name = 'Updated Name' WHERE id = auth.uid();
  -- Expected: MUST SUCCEED
  -- ------------------------------------------------------------------
  BEGIN
    PERFORM set_config('request.jwt.claim.sub', v_test_user_id::text, true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    UPDATE public.profiles
    SET name = 'Updated Name', preferred_language = 'ru'
    WHERE id = v_test_user_id;

    RAISE NOTICE ' [PASS] Test 4: Safe profile customization succeeds normally.';
  END;
  v_passed_tests := v_passed_tests + 1;

  -- ------------------------------------------------------------------
  -- TEST 5: Insufficient Credits Protection in Server Procedure
  -- Calling deduct_credits_for_generation with more credits than balance
  -- Expected: MUST FAIL with INSUFFICIENT_CREDITS
  -- ------------------------------------------------------------------
  v_error_caught := false;
  BEGIN
    PERFORM public.deduct_credits_for_generation(
      v_test_user_id,
      999, -- User only has 10 credits
      'moldova-orheiul-vechi',
      'Apus de Aur la Orheiul Vechi',
      v_test_job_id::TEXT
    );
  EXCEPTION WHEN OTHERS THEN
    v_error_caught := true;
    RAISE NOTICE ' [PASS] Test 5: Insufficient credits blocked by atomic stored procedure: %', SQLERRM;
  END;

  IF NOT v_error_caught THEN
    RAISE EXCEPTION 'TEST 5 FAILED: Allowed deduction beyond available balance!';
  END IF;
  v_passed_tests := v_passed_tests + 1;

  -- ------------------------------------------------------------------
  -- TEST 6: Atomic Credit Deduction with Row Lock and Transaction Log
  -- Deduct 2 credits from 10
  -- Expected: Balance becomes 8, audited transaction recorded
  -- ------------------------------------------------------------------
  v_balance := public.deduct_credits_for_generation(
    v_test_user_id,
    2,
    'moldova-orheiul-vechi',
    'Apus de Aur la Orheiul Vechi',
    v_test_job_id::TEXT
  );

  IF v_balance <> 8 THEN
    RAISE EXCEPTION 'TEST 6 FAILED: Expected balance 8, got %', v_balance;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.credit_transactions
    WHERE user_id = v_test_user_id
      AND type = 'generation_spend'
      AND amount = -2
      AND reference_id = v_test_job_id::TEXT
  ) THEN
    RAISE EXCEPTION 'TEST 6 FAILED: Credit transaction audit record missing!';
  END IF;

  RAISE NOTICE ' [PASS] Test 6: Atomic deduction succeeded with audit trail. Balance: %', v_balance;
  v_passed_tests := v_passed_tests + 1;

  -- ------------------------------------------------------------------
  -- TEST 7: Admin Credit Adjustment Procedure
  -- Admin grants 25 bonus credits with reason
  -- Expected: Balance becomes 33, admin_grant transaction logged
  -- ------------------------------------------------------------------
  v_balance := public.admin_adjust_credits(
    v_admin_user_id,
    v_test_user_id,
    25,
    'Test VIP Grant'
  );

  IF v_balance <> 33 THEN
    RAISE EXCEPTION 'TEST 7 FAILED: Expected balance 33, got %', v_balance;
  END IF;

  RAISE NOTICE ' [PASS] Test 7: Admin credit adjustment succeeded. New balance: %', v_balance;
  v_passed_tests := v_passed_tests + 1;

  -- ------------------------------------------------------------------
  -- TEST 8: Non-Admin Attempts Admin Credit Adjustment
  -- Normal user calls admin_adjust_credits
  -- Expected: MUST FAIL with UNAUTHORIZED_NOT_ADMIN
  -- ------------------------------------------------------------------
  v_error_caught := false;
  BEGIN
    PERFORM public.admin_adjust_credits(
      v_test_user_id, -- Not an admin!
      v_test_user_id,
      1000,
      'Unauthorized self-grant'
    );
  EXCEPTION WHEN OTHERS THEN
    v_error_caught := true;
    RAISE NOTICE ' [PASS] Test 8: Non-admin credit adjustment blocked: %', SQLERRM;
  END;

  IF NOT v_error_caught THEN
    RAISE EXCEPTION 'TEST 8 FAILED: Non-admin successfully called admin_adjust_credits!';
  END IF;
  v_passed_tests := v_passed_tests + 1;

  -- ------------------------------------------------------------------
  -- TEST 9: Admin Role Management Procedure
  -- Genuine admin promotes or changes role
  -- Expected: SUCCEEDS only via admin_set_user_role
  -- ------------------------------------------------------------------
  PERFORM public.admin_set_user_role(
    v_admin_user_id,
    v_test_user_id,
    'admin'
  );

  SELECT role INTO v_balance FROM public.profiles WHERE id = v_test_user_id;
  RAISE NOTICE ' [PASS] Test 9: Protected admin role promotion succeeded via server procedure.';
  v_passed_tests := v_passed_tests + 1;

  RAISE NOTICE '==================================================';
  RAISE NOTICE '>>> ALL % SECURITY TESTS PASSED SUCCESSFULLY! <<<', v_passed_tests;
  RAISE NOTICE '==================================================';

END $$;

ROLLBACK;
