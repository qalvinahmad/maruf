-- Function untuk menambah poin user dengan aman
CREATE OR REPLACE FUNCTION increment_user_points(
    user_id_param UUID,
    points_to_add INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update user points, create column if not exists
    UPDATE users 
    SET points = COALESCE(points, 0) + points_to_add,
        updated_at = NOW()
    WHERE id = user_id_param;
    
    -- If user not found, log it but don't error
    IF NOT FOUND THEN
        RAISE NOTICE 'User with ID % not found for points update', user_id_param;
    END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_user_points(UUID, INTEGER) TO authenticated;

-- Comment for documentation
COMMENT ON FUNCTION increment_user_points(UUID, INTEGER) IS 'Menambah poin user dengan aman';
