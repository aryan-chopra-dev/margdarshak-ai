-- =====================================================
-- Margdarshak AI — Supabase Normalized Table Setup
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/qzmvmbsbdajyxfddbxcr/sql/new
-- =====================================================

-- Drop existing tables to clear previous structure (Warning: drops all existing student data)
DROP TABLE IF EXISTS shortlisted_universities CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS co_applicants CASCADE;
DROP TABLE IF EXISTS study_targets CASCADE;
DROP TABLE IF EXISTS academic_scores CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS otp_verifications CASCADE;

-- 1. Profiles (Core student identity)
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Student',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Academic Scores & Metrics
CREATE TABLE academic_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  gpa REAL DEFAULT 0 CHECK (gpa >= 0.0 AND gpa <= 10.0),
  gre_score INT DEFAULT 0 CHECK (gre_score = 0 OR (gre_score >= 260 AND gre_score <= 340)),
  toefl_score INT DEFAULT 0 CHECK (toefl_score >= 0 AND toefl_score <= 120),
  ielts_score REAL DEFAULT 0 CHECK (ielts_score >= 0.0 AND ielts_score <= 9.0),
  work_experience INT DEFAULT 0 CHECK (work_experience >= 0 AND work_experience <= 30),
  has_research BOOLEAN DEFAULT false,
  lrs_score INT DEFAULT 300,
  intent_score INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Study Targets & Preferences
CREATE TABLE study_targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stage TEXT DEFAULT 'explorer',
  target_country TEXT,
  target_field TEXT,
  degree TEXT DEFAULT 'masters',
  budget INT DEFAULT 0 CHECK (budget >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Co-applicants (Parents / Sponsors)
CREATE TABLE co_applicants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  income INT DEFAULT 0 CHECK (income >= 0 AND income <= 100000000),
  occupation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Documents
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Shortlisted Universities
CREATE TABLE shortlisted_universities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  university_name TEXT NOT NULL,
  shortlisted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, university_name)
);

-- 7. OTP Verifications (Email-only)
CREATE TABLE otp_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RLS Policy Configuration
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE co_applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlisted_universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- OTP table: Allow all operations for custom OTP login mechanism
CREATE POLICY "Allow public OTP operations" ON otp_verifications FOR ALL USING (true) WITH CHECK (true);

-- profiles policies
CREATE POLICY "Profiles access policy" ON profiles FOR ALL USING (
  check_is_server()
  OR (auth.jwt() ->> 'email' = email)
  OR EXISTS (SELECT 1 FROM otp_verifications WHERE otp_verifications.email = profiles.email)
) WITH CHECK (
  check_is_server()
  OR (auth.jwt() ->> 'email' = email)
  OR EXISTS (SELECT 1 FROM otp_verifications WHERE otp_verifications.email = profiles.email)
);

-- Helper functions to get owner email from profile_id (since auth.jwt() only returns user email)
CREATE OR REPLACE FUNCTION check_is_owner(p_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email' = (SELECT email FROM profiles WHERE id = p_id));
END;
$$ LANGUAGE plpgsql;

-- Helper function to check if active OTP verification exists for a profile_id
CREATE OR REPLACE FUNCTION check_has_otp(p_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM otp_verifications 
    WHERE otp_verifications.email = (SELECT email FROM profiles WHERE id = p_id)
  );
END;
$$ LANGUAGE plpgsql;

-- Secure helper RPC function to check if a profile exists by email (used anonymously before OTP is created)
CREATE OR REPLACE FUNCTION check_profile_exists(target_email TEXT)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE email = target_email);
END;
$$ LANGUAGE plpgsql;

-- Secure helper function to check if query originates from Next.js server with bypass key
CREATE OR REPLACE FUNCTION check_is_server()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.headers', true)::json ->> 'x-bypass-key',
    ''
  ) = 'margdarshak_secure_bypass_key_2026';
END;
$$ LANGUAGE plpgsql;

-- academic_scores policies
CREATE POLICY "Academic scores access policy" ON academic_scores FOR ALL USING (
  check_is_server() OR check_is_owner(profile_id) OR check_has_otp(profile_id)
) WITH CHECK (
  check_is_server() OR check_is_owner(profile_id) OR check_has_otp(profile_id)
);

-- study_targets policies
CREATE POLICY "Study targets access policy" ON study_targets FOR ALL USING (
  check_is_server() OR check_is_owner(profile_id) OR check_has_otp(profile_id)
) WITH CHECK (
  check_is_server() OR check_is_owner(profile_id) OR check_has_otp(profile_id)
);

-- co_applicants policies
CREATE POLICY "Co-applicants access policy" ON co_applicants FOR ALL USING (
  check_is_server() OR check_is_owner(profile_id) OR check_has_otp(profile_id)
) WITH CHECK (
  check_is_server() OR check_is_owner(profile_id) OR check_has_otp(profile_id)
);

-- documents policies
CREATE POLICY "Documents access policy" ON documents FOR ALL USING (
  check_is_server() OR check_is_owner(profile_id) OR check_has_otp(profile_id)
) WITH CHECK (
  check_is_server() OR check_is_owner(profile_id) OR check_has_otp(profile_id)
);

-- shortlisted_universities policies
CREATE POLICY "Shortlisted universities access policy" ON shortlisted_universities FOR ALL USING (
  check_is_server() OR check_is_owner(profile_id) OR check_has_otp(profile_id)
) WITH CHECK (
  check_is_server() OR check_is_owner(profile_id) OR check_has_otp(profile_id)
);
