-- ============================================================================
-- Supabase Migration: Create Documents Bucket
-- ============================================================================
-- Run this SQL in your Supabase Dashboard → SQL Editor
-- This creates the "documents" storage bucket and configures the necessary
-- Row Level Security (RLS) policies to allow uploads and public reads.
-- ============================================================================

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true, -- Allows public read access to getPublicUrl
  10485760, -- 10MB limit in bytes
  ARRAY['application/pdf', 'image/jpeg', 'image/png']::text[]
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png']::text[];

-- 2. Allow public access to view/download files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

-- 3. Allow anon/authenticated uploads
-- For a hackathon/demo, we allow all inserts. In production, this should be tied to auth.uid()
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents');

-- 4. Allow users to update/replace their own files
CREATE POLICY "Allow public updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documents');

-- 5. Allow users to delete their files
CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents');
