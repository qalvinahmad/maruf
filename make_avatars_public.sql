-- Make avatars bucket public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'avatars';
