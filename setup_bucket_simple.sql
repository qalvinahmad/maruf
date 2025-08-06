-- Simple RLS Setup (Run this in SQL Editor if you have admin access)
-- Only create bucket and basic policies

-- 1. Create bucket (this should work)
INSERT INTO storage.buckets (id, name, public)
VALUES ('communitymessage', 'communitymessage', true)
ON CONFLICT (id) DO NOTHING;

-- 2. If the above doesn't work, just verify bucket exists
SELECT id, name, public FROM storage.buckets WHERE id = 'communitymessage';

-- Note: RLS policies need to be created through Dashboard UI
-- Go to Storage → communitymessage → New policy
