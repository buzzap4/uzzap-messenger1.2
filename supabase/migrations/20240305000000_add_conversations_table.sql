-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID REFERENCES profiles(id),
    user2_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT no_self_conversation CHECK (user1_id != user2_id),
    CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user1_id ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON conversations(user2_id);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their own conversations"
    ON conversations FOR SELECT
    TO authenticated
    USING (
        user1_id = auth.uid() 
        OR user2_id = auth.uid()
    );

CREATE POLICY "Users can create conversations they are part of"
    ON conversations FOR INSERT
    TO authenticated
    WITH CHECK (
        user1_id = auth.uid() 
        OR user2_id = auth.uid()
    );
