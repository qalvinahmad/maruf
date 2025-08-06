-- Setup Community Message Storage Bucket and RLS Policies
-- Run this in Supabase SQL Editor

-- 1. Create bucket if not exists (or make sure it exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('communitymessage', 'communitymessage', true)
ON CONFLICT (id) DO UPDATE SET
  public = true;

-- 2. Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;

-- 3. Create RLS policies for communitymessage bucket

-- Policy 1: Allow authenticated users to upload files to communitymessage bucket
CREATE POLICY "Allow authenticated upload to communitymessage"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'communitymessage');

-- Policy 2: Allow public read access to communitymessage bucket
CREATE POLICY "Allow public read from communitymessage"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'communitymessage');

-- Policy 3: Allow users to delete their own files from communitymessage bucket
CREATE POLICY "Allow users to delete own files from communitymessage"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'communitymessage' AND auth.uid()::text = owner::text);

-- Policy 4: Allow users to update their own files from communitymessage bucket
CREATE POLICY "Allow users to update own files from communitymessage"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'communitymessage' AND auth.uid()::text = owner::text);

-- 5. Make sure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 6. Grant necessary permissions (optional, usually already set)
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;

-- 7. Verify bucket exists and is public
SELECT id, name, public FROM storage.buckets WHERE id = 'communitymessage';
