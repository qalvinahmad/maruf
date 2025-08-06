-- =====================================================
-- COMPREHENSIVE AVATARS TABLE SETUP FOR SUPABASE
-- =====================================================

-- Drop existing table if exists (CAUTION: This will delete all data!)
-- DROP TABLE IF EXISTS public.avatars CASCADE;

-- Create avatars table with comprehensive fields
CREATE TABLE IF NOT EXISTS public.avatars (
  -- Primary identification
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Avatar media content
  image_url TEXT,                    -- Static image URL (.jpg, .png, .gif)
  video_url TEXT,                    -- Video/animation URL (.mp4, .webm)
  thumbnail_url TEXT,                -- Thumbnail for video previews
  
  -- Avatar properties
  title VARCHAR(100) NOT NULL DEFAULT 'Default Avatar',
  description TEXT,
  category VARCHAR(50) DEFAULT 'general', -- general, premium, special, seasonal
  rarity VARCHAR(20) DEFAULT 'common',    -- common, rare, epic, legendary
  
  -- Customization options
  background_color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for avatar background
  border_style VARCHAR(20) DEFAULT 'simple',     -- simple, gradient, animated, custom
  border_color VARCHAR(7) DEFAULT '#6B7280',     -- Border color
  border_gradient_start VARCHAR(7),              -- For gradient borders
  border_gradient_end VARCHAR(7),                -- For gradient borders
  
  -- Badge configuration
  badge_enabled BOOLEAN DEFAULT TRUE,
  badge_type VARCHAR(20) DEFAULT 'active',       -- active, streaming, recording, award, custom
  badge_color VARCHAR(7) DEFAULT '#10B981',      -- Badge background color
  badge_icon VARCHAR(50),                        -- Icon name or custom icon
  badge_image_url TEXT,                          -- Custom badge image
  
  -- Avatar states and permissions
  is_default BOOLEAN DEFAULT FALSE,              -- Is this the default avatar for new users
  is_premium BOOLEAN DEFAULT FALSE,              -- Requires premium/payment
  is_unlockable BOOLEAN DEFAULT FALSE,           -- Can be unlocked through achievements
  unlock_condition TEXT,                         -- JSON string of unlock conditions
  
  -- Pricing and availability
  price_points INTEGER DEFAULT 0,               -- Cost in points to purchase
  price_real_money DECIMAL(10,2),               -- Real money price (optional)
  is_limited_time BOOLEAN DEFAULT FALSE,         -- Limited time availability
  available_from TIMESTAMP WITH TIME ZONE,      -- When avatar becomes available
  available_until TIMESTAMP WITH TIME ZONE,     -- When avatar stops being available
  
  -- Usage and stats
  usage_count INTEGER DEFAULT 0,                -- How many times this avatar has been equipped
  popularity_score DECIMAL(3,2) DEFAULT 0.0,    -- Popularity rating (0-10)
  
  -- Technical metadata
  file_size_bytes BIGINT,                       -- File size for optimization
  format VARCHAR(10),                           -- jpg, png, gif, mp4, webm
  dimensions VARCHAR(20),                       -- e.g., "512x512"
  
  -- Content moderation
  is_approved BOOLEAN DEFAULT FALSE,            -- Admin approval status
  moderation_notes TEXT,                        -- Notes from moderation
  reported_count INTEGER DEFAULT 0,            -- Number of times reported
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_background_color CHECK (background_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_border_color CHECK (border_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_badge_color CHECK (badge_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_rarity CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  CONSTRAINT valid_category CHECK (category IN ('general', 'premium', 'special', 'seasonal', 'event', 'achievement')),
  CONSTRAINT valid_badge_type CHECK (badge_type IN ('active', 'streaming', 'recording', 'award', 'custom', 'none')),
  CONSTRAINT valid_border_style CHECK (border_style IN ('simple', 'gradient', 'animated', 'custom', 'none')),
  CONSTRAINT valid_price CHECK (price_points >= 0),
  CONSTRAINT valid_popularity CHECK (popularity_score >= 0 AND popularity_score <= 10)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_avatars_user_id ON public.avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_avatars_category ON public.avatars(category);
CREATE INDEX IF NOT EXISTS idx_avatars_rarity ON public.avatars(rarity);
CREATE INDEX IF NOT EXISTS idx_avatars_is_premium ON public.avatars(is_premium);
CREATE INDEX IF NOT EXISTS idx_avatars_is_default ON public.avatars(is_default);
CREATE INDEX IF NOT EXISTS idx_avatars_price_points ON public.avatars(price_points);
CREATE INDEX IF NOT EXISTS idx_avatars_availability ON public.avatars(available_from, available_until);
CREATE INDEX IF NOT EXISTS idx_avatars_popularity ON public.avatars(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_avatars_created_at ON public.avatars(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view all approved avatars
CREATE POLICY "Users can view approved avatars" ON public.avatars
  FOR SELECT USING (is_approved = TRUE);

-- Users can view their own avatars (including unapproved ones)
CREATE POLICY "Users can view own avatars" ON public.avatars
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own avatars (will need approval)
CREATE POLICY "Users can create own avatars" ON public.avatars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own avatars (non-admin fields only)
CREATE POLICY "Users can update own avatars" ON public.avatars
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    -- Prevent users from changing admin-only fields
    is_approved = (SELECT is_approved FROM public.avatars WHERE id = avatars.id) AND
    is_default = (SELECT is_default FROM public.avatars WHERE id = avatars.id)
  );

-- Admins can do everything
CREATE POLICY "Admins can manage all avatars" ON public.avatars
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = TRUE
    )
  );

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_avatars_updated_at ON public.avatars;
CREATE TRIGGER update_avatars_updated_at
    BEFORE UPDATE ON public.avatars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to increment usage count when avatar is equipped
CREATE OR REPLACE FUNCTION increment_avatar_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_equipped = TRUE AND (OLD.is_equipped IS NULL OR OLD.is_equipped = FALSE) THEN
        UPDATE public.avatars 
        SET usage_count = usage_count + 1,
            popularity_score = LEAST(10.0, popularity_score + 0.01)
        WHERE id = NEW.item_id 
        AND EXISTS (
            SELECT 1 FROM public.shop_items 
            WHERE shop_items.id = NEW.item_id 
            AND shop_items.item_type = 'avatar'
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_inventory to track avatar usage
DROP TRIGGER IF EXISTS track_avatar_usage ON public.user_inventory;
CREATE TRIGGER track_avatar_usage
    AFTER UPDATE ON public.user_inventory
    FOR EACH ROW
    EXECUTE FUNCTION increment_avatar_usage();

-- Insert some default avatars
INSERT INTO public.avatars (
  user_id, title, description, category, rarity, 
  image_url, background_color, border_style, border_color,
  badge_type, badge_color, is_default, is_approved, price_points
) VALUES 
(
  (SELECT id FROM auth.users LIMIT 1), -- Use first available user, or replace with system user
  'Default Avatar',
  'Standard avatar for all new users',
  'general',
  'common',
  '/img/avatar_default.png',
  '#3B82F6',
  'simple',
  '#6B7280',
  'active',
  '#10B981',
  TRUE,
  TRUE,
  0
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Premium Golden Avatar',
  'Exclusive golden avatar with special effects',
  'premium',
  'legendary',
  '/img/avatar_golden.png',
  '#FFD700',
  'gradient',
  '#FFA500',
  'award',
  '#FF6B35',
  FALSE,
  TRUE,
  1000
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Student Achiever',
  'Special avatar for academic achievements',
  'achievement',
  'epic',
  '/img/avatar_student.png',
  '#4F46E5',
  'animated',
  '#7C3AED',
  'award',
  '#F59E0B',
  FALSE,
  TRUE,
  500
)
ON CONFLICT DO NOTHING; -- Prevent duplicate inserts

-- Create view for easy avatar browsing
CREATE OR REPLACE VIEW public.available_avatars AS
SELECT 
  a.*,
  CASE 
    WHEN a.is_limited_time AND a.available_until < NOW() THEN FALSE
    WHEN a.is_limited_time AND a.available_from > NOW() THEN FALSE
    ELSE TRUE
  END AS is_currently_available,
  CASE 
    WHEN a.price_points = 0 AND NOT a.is_premium THEN 'free'
    WHEN a.price_points > 0 THEN 'points'
    WHEN a.is_premium THEN 'premium'
    ELSE 'unknown'
  END AS pricing_type
FROM public.avatars a
WHERE a.is_approved = TRUE;

-- Grant appropriate permissions
GRANT SELECT ON public.available_avatars TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.avatars TO authenticated;
GRANT USAGE ON SEQUENCE avatars_id_seq TO authenticated;

-- Example queries for testing:

-- Get all available avatars for shop
-- SELECT * FROM public.available_avatars WHERE is_currently_available = TRUE ORDER BY popularity_score DESC;

-- Get user's current avatar
-- SELECT a.* FROM public.avatars a 
-- JOIN public.user_inventory ui ON ui.item_id = a.id 
-- WHERE ui.user_id = auth.uid() AND ui.is_equipped = TRUE AND ui.item_type = 'avatar';

-- Get avatars user can afford
-- SELECT * FROM public.available_avatars 
-- WHERE price_points <= (SELECT points FROM public.profiles WHERE id = auth.uid())
-- AND is_currently_available = TRUE;

COMMENT ON TABLE public.avatars IS 'Comprehensive avatar system with customization, pricing, and moderation features';
COMMENT ON COLUMN public.avatars.unlock_condition IS 'JSON string describing unlock conditions, e.g., {"type":"level","value":10} or {"type":"achievement","id":"first_lesson"}';
COMMENT ON COLUMN public.avatars.background_color IS 'Hex color code for avatar background glow effect';
COMMENT ON COLUMN public.avatars.badge_color IS 'Hex color code for badge background, customizable by user';
