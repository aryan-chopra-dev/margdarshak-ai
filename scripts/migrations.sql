-- =====================================================
-- Margdarshak AI — Database Alteration & Loan Table Setup
-- =====================================================

-- 1. Alter profiles table to support admin roles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role_status TEXT NOT NULL DEFAULT 'approved';

-- 2. Create loan_applications table
CREATE TABLE IF NOT EXISTS loan_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lender_id TEXT NOT NULL,
  lender_name TEXT NOT NULL,
  university_name TEXT NOT NULL,
  principal_inr BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reference_id TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS and add access policies
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Loan applications access policy" ON loan_applications;
CREATE POLICY "Loan applications access policy" ON loan_applications FOR ALL USING (
  check_is_server() OR check_is_owner(profile_id) OR check_has_otp(profile_id)
) WITH CHECK (
  check_is_server() OR check_is_owner(profile_id) OR check_has_otp(profile_id)
);
