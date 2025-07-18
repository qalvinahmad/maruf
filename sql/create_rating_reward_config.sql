-- Table untuk konfigurasi reward rating
CREATE TABLE IF NOT EXISTS rating_reward_config (
    id SERIAL PRIMARY KEY,
    rating_value INTEGER NOT NULL UNIQUE CHECK (rating_value >= 1 AND rating_value <= 5),
    reward_points INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default reward configuration
INSERT INTO rating_reward_config (rating_value, reward_points, description) VALUES
(1, 5, 'Sangat Buruk - Terima kasih atas feedback Anda'),
(2, 10, 'Buruk - Kami akan terus berusaha lebih baik'),
(3, 15, 'Cukup - Feedback Anda sangat berharga'),
(4, 20, 'Baik - Terima kasih atas dukungan Anda'),
(5, 25, 'Sangat Baik - Terima kasih atas kepercayaan Anda')
ON CONFLICT (rating_value) DO NOTHING;

-- Update rating table untuk menambah kolom reward_points jika belum ada
ALTER TABLE rating 
ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 0;

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_rating_reward_config_active ON rating_reward_config(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_rating_reward_config_rating_value ON rating_reward_config(rating_value);

-- Function untuk update timestamp
CREATE OR REPLACE FUNCTION update_rating_reward_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-update timestamp
DROP TRIGGER IF EXISTS trigger_update_rating_reward_config_updated_at ON rating_reward_config;
CREATE TRIGGER trigger_update_rating_reward_config_updated_at
    BEFORE UPDATE ON rating_reward_config
    FOR EACH ROW
    EXECUTE FUNCTION update_rating_reward_config_updated_at();

-- Enable RLS jika belum ada
ALTER TABLE rating_reward_config ENABLE ROW LEVEL SECURITY;

-- Policy untuk admin bisa CRUD, user hanya bisa read
CREATE POLICY IF NOT EXISTS "Admin can manage rating reward config" ON rating_reward_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY IF NOT EXISTS "Users can view active rating reward config" ON rating_reward_config
    FOR SELECT USING (is_active = true);

-- Comments untuk dokumentasi
COMMENT ON TABLE rating_reward_config IS 'Konfigurasi reward points untuk setiap rating value';
COMMENT ON COLUMN rating_reward_config.rating_value IS 'Nilai rating (1-5)';
COMMENT ON COLUMN rating_reward_config.reward_points IS 'Jumlah poin reward yang diberikan';
COMMENT ON COLUMN rating_reward_config.description IS 'Deskripsi untuk rating tersebut';
COMMENT ON COLUMN rating_reward_config.is_active IS 'Status aktif konfigurasi';
