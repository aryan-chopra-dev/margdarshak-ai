-- ============================================================================
-- Supabase Migration: Add Profile Columns
-- ============================================================================
-- Run this SQL in your Supabase Dashboard → SQL Editor
-- This adds all the profile columns that were previously in the Prisma/SQLite
-- schema but missing from the Supabase 'profiles' table.
--
-- NOTE: We use quoted camelCase column names to match the application code.
-- Supabase/PostgREST handles quoted identifiers correctly.
-- ============================================================================

-- Academic fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "gpa" REAL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "greScore" INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "toeflScore" INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "ieltsScore" REAL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "workExperience" INTEGER DEFAULT 0;

-- Study goals
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "stage" TEXT DEFAULT 'explorer';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "targetCountry" TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "targetField" TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "degree" TEXT DEFAULT 'masters';

-- Financial
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "budget" INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "hasResearch" BOOLEAN DEFAULT false;

-- University shortlist & documents (stored as JSONB arrays)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "shortlistedUniversities" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "docsUploaded" JSONB DEFAULT '[]'::jsonb;

-- Parent / Co-applicant
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "parentName" TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "parentPhone" TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "parentIncome" INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "parentOccupation" TEXT;

-- KYC
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "kycVerified" BOOLEAN DEFAULT false;

-- Scoring
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "lrsScore" INTEGER DEFAULT 300;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "intentScore" INTEGER DEFAULT 0;

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
