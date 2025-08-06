-- Channel Communication Tables for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Create channel_messages table
CREATE TABLE IF NOT EXISTS channel_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'poll')),
  media_url TEXT,
  poll_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message_reactions table for sticker reactions
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES channel_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sticker VARCHAR(10) NOT NULL, -- Store sticker emoji
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, sticker)
);

-- Create poll_votes table
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES channel_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_channel_messages_created_at ON channel_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_channel_messages_user_id ON channel_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_message_id ON poll_votes(message_id);

-- Enable RLS (Row Level Security)
ALTER TABLE channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for channel_messages
CREATE POLICY "Anyone can read channel messages" ON channel_messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert channel messages" ON channel_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" ON channel_messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" ON channel_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for message_reactions
CREATE POLICY "Anyone can read message reactions" ON message_reactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert reactions" ON message_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON message_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for poll_votes
CREATE POLICY "Anyone can read poll votes" ON poll_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert poll votes" ON poll_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own poll votes" ON poll_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own poll votes" ON poll_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Insert some sample channel messages for testing
INSERT INTO channel_messages (user_id, content, message_type) VALUES
  ((SELECT id FROM profiles LIMIT 1), 'Selamat datang di channel komunikasi!', 'text'),
  ((SELECT id FROM profiles LIMIT 1), 'Bagaimana pembelajaran hari ini?', 'text');

-- Insert sample poll message
INSERT INTO channel_messages (user_id, content, message_type, poll_data) VALUES
  ((SELECT id FROM profiles LIMIT 1), 'Materi mana yang paling sulit?', 'poll', 
   '{"options": [{"text": "Makhraj Halqi", "votes": 0}, {"text": "Makhraj Lisani", "votes": 0}, {"text": "Makhraj Syafawi", "votes": 0}]}');
