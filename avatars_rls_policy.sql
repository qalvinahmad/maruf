-- RLS Policy for avatars bucket (community-messages folder)
-- Run this if communitymessage bucket still has issues

-- Allow upload to avatars bucket (for community messages)
CREATE POLICY "Allow upload to avatars community-messages" ON storage.objects
FOR INSERT TO public
WITH CHECK (bucket_id = 'avatars' AND name LIKE 'community-messages/%');

-- Allow read from avatars bucket
CREATE POLICY "Allow read from avatars" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

-- Check existing policies for avatars
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%avatars%';
