-- ============================================================================
-- Supabase Migration: Add Profile Check Constraints
-- ============================================================================
-- Run this SQL in your Supabase Dashboard → SQL Editor:
-- https://supabase.com/dashboard/project/qzmvmbsbdajyxfddbxcr/sql/new
-- ============================================================================

-- 1. Ensure any existing data satisfies the constraints before adding them.
-- If there are invalid scores, they will be normalized to safe defaults.
UPDATE profiles
SET gpa = 0.0
WHERE gpa < 0.0 OR gpa > 10.0;

UPDATE profiles
SET gre_score = 0
WHERE gre_score != 0 AND (gre_score < 260 OR gre_score > 340);

UPDATE profiles
SET toefl_score = 0
WHERE toefl_score < 0 OR toefl_score > 120;

UPDATE profiles
SET ielts_score = 0.0
WHERE ielts_score < 0.0 OR ielts_score > 9.0;

UPDATE profiles
SET work_experience = 0
WHERE work_experience < 0 OR work_experience > 30;

UPDATE profiles
SET parent_income = 0
WHERE parent_income < 0 OR parent_income > 100000000;

UPDATE profiles
SET budget = 0
WHERE budget < 0;

-- 2. Add the CHECK constraints to the profiles table
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS chk_gpa,
  DROP CONSTRAINT IF EXISTS chk_gre_score,
  DROP CONSTRAINT IF EXISTS chk_toefl_score,
  DROP CONSTRAINT IF EXISTS chk_ielts_score,
  DROP CONSTRAINT IF EXISTS chk_work_experience,
  DROP CONSTRAINT IF EXISTS chk_parent_income,
  DROP CONSTRAINT IF EXISTS chk_budget;

ALTER TABLE profiles
  ADD CONSTRAINT chk_gpa CHECK (gpa >= 0.0 AND gpa <= 10.0),
  ADD CONSTRAINT chk_gre_score CHECK (gre_score = 0 OR (gre_score >= 260 AND gre_score <= 340)),
  ADD CONSTRAINT chk_toefl_score CHECK (toefl_score >= 0 AND toefl_score <= 120),
  ADD CONSTRAINT chk_ielts_score CHECK (ielts_score >= 0.0 AND ielts_score <= 9.0),
  ADD CONSTRAINT chk_work_experience CHECK (work_experience >= 0 AND work_experience <= 30),
  ADD CONSTRAINT chk_parent_income CHECK (parent_income >= 0 AND parent_income <= 100000000),
  ADD CONSTRAINT chk_budget CHECK (budget >= 0);
