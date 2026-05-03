-- =====================================================
-- Margdarshak AI — Supabase Table Setup
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/qzmvmbsbdajyxfddbxcr/sql/new
-- =====================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Student',
  phone TEXT,
  stage TEXT DEFAULT 'explorer',
  target_country TEXT,
  target_field TEXT,
  degree TEXT DEFAULT 'masters',
  gpa REAL DEFAULT 0,
  gre_score INT DEFAULT 0,
  toefl_score INT DEFAULT 0,
  ielts_score REAL DEFAULT 0,
  work_experience INT DEFAULT 0,
  budget INT DEFAULT 0,
  has_research BOOLEAN DEFAULT false,
  shortlisted_universities TEXT DEFAULT '[]',
  parent_name TEXT,
  parent_phone TEXT,
  parent_income INT DEFAULT 0,
  parent_occupation TEXT,
  kyc_verified BOOLEAN DEFAULT false,
  docs_uploaded TEXT DEFAULT '[]',
  lrs_score INT DEFAULT 300,
  intent_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OTP verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, phone)
);

-- Allow all operations (hackathon demo — no RLS restrictions)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for otp_verifications" ON otp_verifications FOR ALL USING (true) WITH CHECK (true);
