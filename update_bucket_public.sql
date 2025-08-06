-- Update bucket communitymessage to be public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'communitymessage';

-- Verify the change
SELECT id, name, public FROM storage.buckets WHERE id = 'communitymessage';
