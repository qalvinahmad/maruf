-- Create RLS policies for communitymessage bucket via SQL
-- Run this if you have permission, otherwise use Dashboard UI

-- Allow public to insert into communitymessage bucket
CREATE POLICY "Allow upload to communitymessage" ON storage.objects
FOR INSERT TO public
WITH CHECK (bucket_id = 'communitymessage');

-- Allow public to select from communitymessage bucket  
CREATE POLICY "Allow read from communitymessage" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'communitymessage');

-- Check if policies were created
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%communitymessage%';
