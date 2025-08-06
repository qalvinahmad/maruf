-- =====================================================
-- BASIC AVATARS TABLE SETUP FOR SUPABASE
-- =====================================================

-- Create avatars table for basic avatar management
CREATE TABLE IF NOT EXISTS public.avatars (
  -- Primary identification
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Avatar content
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,                    -- Static image URL
  video_url TEXT,                    -- Video/animation URL (.mp4)
  thumbnail_url TEXT,                -- Thumbnail preview
  
  -- Avatar styling
  background_color VARCHAR(7) DEFAULT '#3B82F6', -- Avatar background color
  border_style VARCHAR(20) DEFAULT 'simple',     -- Border style
  border_color VARCHAR(7) DEFAULT '#6B7280',     -- Border color
  
  -- Badge configuration
  badge_type VARCHAR(20) DEFAULT 'active',       -- Badge type
  badge_color VARCHAR(7) DEFAULT '#10B981',      -- Badge background color
  
  -- Avatar metadata
  category VARCHAR(50) DEFAULT 'general',        -- Category
  rarity VARCHAR(20) DEFAULT 'common',           -- Rarity
  price_points INTEGER DEFAULT 0,               -- Cost in points
  is_default BOOLEAN DEFAULT FALSE,              -- Default avatar
  is_active BOOLEAN DEFAULT TRUE,                -- Is available
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_background_color CHECK (background_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_border_color CHECK (border_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_badge_color CHECK (badge_color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_avatars_user_id ON public.avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_avatars_category ON public.avatars(category);
CREATE INDEX IF NOT EXISTS idx_avatars_is_active ON public.avatars(is_active);

-- Enable RLS
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active avatars" ON public.avatars
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can manage own avatars" ON public.avatars
  FOR ALL USING (auth.uid() = user_id);

-- Update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_avatars_updated_at
    BEFORE UPDATE ON public.avatars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default avatar
INSERT INTO public.avatars (
  name, description, image_url, background_color, 
  badge_color, is_default, is_active, price_points
) VALUES (
  'Default Avatar',
  'Standard avatar for all users',
  '/img/avatar_default.png',
  '#3B82F6',
  '#10B981',
  TRUE,
  TRUE,
  0
) ON CONFLICT DO NOTHING;
