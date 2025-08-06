-- Create RLS policies specifically for communitymessage bucket
-- Run this in Supabase SQL Editor

-- Drop any existing policies for communitymessage (in case they exist)
DROP POLICY IF EXISTS "Allow upload to communitymessage" ON storage.objects;
DROP POLICY IF EXISTS "Allow read from communitymessage" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete from communitymessage" ON storage.objects;

-- Create new policies for communitymessage bucket
CREATE POLICY "Allow upload to communitymessage" ON storage.objects
FOR INSERT TO public
WITH CHECK (bucket_id = 'communitymessage');

CREATE POLICY "Allow read from communitymessage" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'communitymessage');

CREATE POLICY "Allow delete from communitymessage" ON storage.objects
FOR DELETE TO public
USING (bucket_id = 'communitymessage');

-- Verify policies were created
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%communitymessage%';
