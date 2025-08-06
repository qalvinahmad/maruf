-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('bug', 'feature', 'ui', 'performance', 'content', 'other')),
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_target_type ON reports(target_type);

-- Enable RLS (Row Level Security)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policy for users to insert their own reports
CREATE POLICY "Users can insert their own reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to view their own reports (optional)
CREATE POLICY "Users can view their own reports" ON reports
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy for admin to view all reports (optional)
CREATE POLICY "Admins can view all reports" ON reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Grant necessary permissions
GRANT SELECT, INSERT ON reports TO authenticated;
GRANT ALL ON reports TO service_role;