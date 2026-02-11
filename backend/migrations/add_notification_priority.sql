-- Add priority field to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Create index for priority filtering
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
