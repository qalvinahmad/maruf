-- Alternative RLS Setup for Community Message Storage
-- Run this in Supabase SQL Editor if the previous script doesn't work

-- 1. Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('communitymessage', 'communitymessage', true)
ON CONFLICT (id) DO UPDATE SET
  public = true;

-- 2. Drop all existing policies for communitymessage bucket
DROP POLICY IF EXISTS "Allow authenticated upload to communitymessage" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from communitymessage" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files from communitymessage" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own files from communitymessage" ON storage.objects;

-- 3. Create more permissive policies

-- Allow anyone (including anonymous) to upload to communitymessage
CREATE POLICY "Allow all upload to communitymessage"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'communitymessage');

-- Allow anyone to read from communitymessage
CREATE POLICY "Allow all read from communitymessage"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'communitymessage');

-- Allow anyone to delete from communitymessage (optional)
CREATE POLICY "Allow all delete from communitymessage"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'communitymessage');

-- Allow anyone to update in communitymessage (optional)
CREATE POLICY "Allow all update from communitymessage"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'communitymessage');

-- 4. Ensure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 5. Grant permissions to both authenticated and anonymous users
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO anon;

-- 6. Check if policies are created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' AND qual LIKE '%communitymessage%';
