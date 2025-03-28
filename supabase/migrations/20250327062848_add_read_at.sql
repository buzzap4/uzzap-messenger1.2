ALTER TABLE direct_messages
ADD COLUMN read_at TIMESTAMPTZ DEFAULT NULL;

-- Create an index for better query performance
CREATE INDEX direct_messages_read_at_idx ON direct_messages (read_at);
