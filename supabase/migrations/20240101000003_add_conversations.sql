-- Create conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT different_users CHECK (user1_id != user2_id)
);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own conversations
CREATE POLICY "Users can view their own conversations"
ON conversations FOR SELECT
TO authenticated
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create policy to allow users to create conversations
CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create indexes for better query performance
CREATE INDEX idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON conversations(user2_id);
