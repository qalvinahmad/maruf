-- Create email queue table for fallback email delivery
-- File: create_email_queue_table.sql

CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  purpose TEXT DEFAULT 'general',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'retry')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_recipient ON email_queue(recipient_email);

-- Create function to process email queue (for future implementation)
CREATE OR REPLACE FUNCTION process_email_queue()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be extended to trigger email sending
  -- via external services or Edge Functions
  
  -- Log the new email queue entry
  RAISE NOTICE 'New email queued: % to %', NEW.subject, NEW.recipient_email;
  
  -- You can add webhook calls or other processing here
  -- For example, call an Edge Function to send the email
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to process new emails
DROP TRIGGER IF EXISTS trigger_process_email_queue ON email_queue;
CREATE TRIGGER trigger_process_email_queue
  AFTER INSERT ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION process_email_queue();

-- Add RLS policies for security
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Policy for service role (API access)
CREATE POLICY "Service role can manage email queue" ON email_queue
  FOR ALL USING (auth.role() = 'service_role');

-- Policy for authenticated users to view their own emails
CREATE POLICY "Users can view their own emails" ON email_queue
  FOR SELECT USING (recipient_email = auth.email());

-- Insert some example data for testing (optional)
-- INSERT INTO email_queue (recipient_email, subject, html_content, purpose) VALUES
-- ('test@example.com', 'Test Email', '<h1>Test</h1>', 'test');

COMMENT ON TABLE email_queue IS 'Queue table for email delivery with fallback mechanism';
COMMENT ON COLUMN email_queue.status IS 'Email status: pending, sent, failed, retry';
COMMENT ON COLUMN email_queue.attempts IS 'Number of delivery attempts made';
COMMENT ON COLUMN email_queue.metadata IS 'Additional email metadata (JSON format)';
