-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE chatroom_role AS ENUM ('owner', 'moderator', 'member');

-- Regions table
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    order_sequence INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT regions_code_check CHECK (code ~ '^[A-Z0-9]+$')
);

-- Provinces table
CREATE TABLE provinces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID NOT NULL REFERENCES regions(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT provinces_code_check CHECK (code ~ '^[A-Z0-9]+$')
);

-- Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    avatar_url TEXT,
    display_name VARCHAR(255),
    status_message TEXT,
    role user_role DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ,
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- User blocks table
CREATE TABLE user_blocks (
    blocker_id UUID REFERENCES profiles(id),
    blocked_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id),
    CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- Chatrooms table
CREATE TABLE chatrooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    province_id UUID NOT NULL REFERENCES provinces(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    max_members INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chatroom_name_length CHECK (char_length(name) >= 3)
);

-- Chatroom memberships table
CREATE TABLE chatroom_memberships (
    chatroom_id UUID REFERENCES chatrooms(id),
    user_id UUID REFERENCES profiles(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (chatroom_id, user_id)
);

-- Chatroom roles table
CREATE TABLE chatroom_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chatroom_id UUID REFERENCES chatrooms(id),
    user_id UUID REFERENCES profiles(id),
    role chatroom_role DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chatroom_id, user_id)
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id),
    chatroom_id UUID REFERENCES chatrooms(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    CONSTRAINT content_not_empty CHECK (content <> '')
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID REFERENCES profiles(id),
    user2_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT no_self_conversation CHECK (user1_id != user2_id),
    CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id)
);

-- Direct messages table
CREATE TABLE direct_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    sender_id UUID REFERENCES profiles(id),
    receiver_id UUID REFERENCES profiles(id),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    CONSTRAINT content_not_empty CHECK (content <> ''),
    CONSTRAINT no_self_message CHECK (sender_id != receiver_id)
);

-- Create indexes
CREATE INDEX idx_provinces_region_id ON provinces(region_id);
CREATE INDEX idx_chatrooms_province_id ON chatrooms(province_id);
CREATE INDEX idx_messages_chatroom_id ON messages(chatroom_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_direct_messages_conversation_id ON direct_messages(conversation_id);
CREATE INDEX idx_direct_messages_sender_id ON direct_messages(sender_id);
CREATE INDEX idx_direct_messages_receiver_id ON direct_messages(receiver_id);
CREATE INDEX idx_conversations_user1_id ON conversations(user1_id);
CREATE INDEX idx_conversations_user2_id ON conversations(user2_id);

-- Add index for common direct message queries
CREATE INDEX idx_direct_messages_participants 
    ON direct_messages(sender_id, receiver_id);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view any profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatroom_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Chatroom membership policies
CREATE POLICY "Users can view their own memberships"
    ON chatroom_memberships FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can join chatrooms"
    ON chatroom_memberships FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Message policies
CREATE POLICY "Users can view messages in their chatrooms"
    ON messages FOR SELECT
    TO authenticated
    USING (
        chatroom_id IN (
            SELECT chatroom_id 
            FROM chatroom_memberships 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to their chatrooms"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (
        chatroom_id IN (
            SELECT chatroom_id 
            FROM chatroom_memberships 
            WHERE user_id = auth.uid()
        )
        AND user_id = auth.uid()
    );

-- Chatroom policies
CREATE POLICY "Users can view chatrooms they are members of"
    ON chatrooms FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT chatroom_id 
            FROM chatroom_memberships 
            WHERE user_id = auth.uid()
        )
        OR is_active = true
    );

-- Conversation policies
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

-- Direct messages policies
CREATE POLICY "Users can view their direct messages"
    ON direct_messages FOR SELECT
    TO authenticated
    USING (
        sender_id = auth.uid() 
        OR receiver_id = auth.uid()
    );

CREATE POLICY "Users can send direct messages"
    ON direct_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_id = auth.uid() 
        AND conversation_id IN (
            SELECT id FROM conversations 
            WHERE user1_id = auth.uid() 
            OR user2_id = auth.uid()
        )
    );
