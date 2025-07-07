-- Create user_inventory table
CREATE TABLE user_inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('item', 'border', 'avatar', 'powerup')),
  quantity INTEGER DEFAULT 1,
  is_equipped BOOLEAN DEFAULT false,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create index for faster queries
CREATE INDEX idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX idx_user_inventory_item_type ON user_inventory(item_type);

-- Enable Row Level Security
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own inventory
CREATE POLICY "Users can view own inventory"
ON user_inventory
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own inventory items (e.g. equipping/unequipping)
CREATE POLICY "Users can update own inventory"
ON user_inventory
FOR UPDATE
USING (auth.uid() = user_id);

-- Only allow insert through purchase function
CREATE POLICY "Users can insert through purchase"
ON user_inventory
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create purchase history table
CREATE TABLE purchase_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL,
  item_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  points_spent INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for purchase history
ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;

-- Create policies for purchase history
CREATE POLICY "Users can view own purchases"
ON purchase_history
FOR SELECT
USING (auth.uid() = user_id);

-- Create function to handle purchases
CREATE OR REPLACE FUNCTION purchase_item(
  p_user_id UUID,
  p_item_id INTEGER,
  p_item_type TEXT,
  p_quantity INTEGER,
  p_points_cost INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_points INTEGER;
BEGIN
  -- Get user's current points
  SELECT points INTO user_points
  FROM profiles
  WHERE id = p_user_id;
  
  -- Check if user has enough points
  IF user_points < p_points_cost THEN
    RETURN FALSE;
  END IF;
  
  -- Begin transaction
  BEGIN
    -- Deduct points from user
    UPDATE profiles
    SET 
      points = points - p_points_cost,
      updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Add item to inventory
    INSERT INTO user_inventory (
      user_id,
      item_id,
      item_type,
      quantity
    ) VALUES (
      p_user_id,
      p_item_id,
      p_item_type,
      p_quantity
    );
    
    -- Record purchase in history
    INSERT INTO purchase_history (
      user_id,
      item_id,
      item_type,
      quantity,
      points_spent
    ) VALUES (
      p_user_id,
      p_item_id,
      p_item_type,
      p_quantity,
      p_points_cost
    );
    
    RETURN TRUE;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN FALSE;
  END;
END;
$$;

-- Create function to equip/unequip items
CREATE OR REPLACE FUNCTION toggle_equip_item(
  p_user_id UUID,
  p_inventory_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if item belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM user_inventory 
    WHERE id = p_inventory_id AND user_id = p_user_id
  ) THEN
    RETURN FALSE;
  END IF;

  -- Toggle equip status
  UPDATE user_inventory
  SET 
    is_equipped = NOT is_equipped,
    updated_at = NOW()
  WHERE id = p_inventory_id;
  
  RETURN TRUE;
END;
$$;
