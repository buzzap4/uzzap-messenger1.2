-- Drop existing triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop existing tables (in correct order due to dependencies)
DROP TABLE IF EXISTS direct_messages CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chatroom_memberships CASCADE;
DROP TABLE IF EXISTS chatrooms CASCADE;
DROP TABLE IF EXISTS provinces CASCADE;
DROP TABLE IF EXISTS regions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS user_role CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create roles enum
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    display_name TEXT,
    status_message TEXT,
    role user_role DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add column to track online status in profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

-- Create regions table first
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create provinces table second
CREATE TABLE provinces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, region_id)
);

-- Create chatrooms table third
CREATE TABLE chatrooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    province_id UUID REFERENCES provinces(id) ON DELETE CASCADE UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger function for automatic chatroom creation
CREATE OR REPLACE FUNCTION create_province_chatroom()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO chatrooms (name, province_id)
    VALUES (NEW.name || ' Chat', NEW.id)
    ON CONFLICT (province_id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS create_chatroom_on_province_insert ON provinces;
CREATE TRIGGER create_chatroom_on_province_insert
    AFTER INSERT ON provinces
    FOR EACH ROW
    EXECUTE FUNCTION create_province_chatroom();

-- Create chatroom memberships table
CREATE TABLE chatroom_memberships (
    chatroom_id UUID REFERENCES chatrooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (chatroom_id, user_id)
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    chatroom_id UUID REFERENCES chatrooms(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create direct messages table
CREATE TABLE direct_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    CONSTRAINT different_users CHECK (sender_id != receiver_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatroom_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatrooms ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view messages in chatrooms they are members of"
ON messages FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM chatroom_memberships
        WHERE chatroom_memberships.chatroom_id = messages.chatroom_id
        AND chatroom_memberships.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their own direct messages"
ON direct_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view direct messages they are part of"
ON direct_messages FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Create policies for chatrooms
CREATE POLICY "Enable read access for all users" ON chatrooms
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON chatrooms
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON chatrooms
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_messages_chatroom_id ON messages(chatroom_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_direct_messages_conversation_id ON direct_messages(conversation_id);
CREATE INDEX idx_direct_messages_created_at ON direct_messages(created_at DESC);
CREATE INDEX idx_chatroom_memberships_user_id ON chatroom_memberships(user_id);
CREATE INDEX idx_provinces_region_id ON provinces(region_id);
CREATE INDEX idx_chatrooms_province_id ON chatrooms(province_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to update online status
CREATE OR REPLACE FUNCTION set_online_status()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND NEW.is_online = TRUE) THEN
        PERFORM pg_notify('online_users', NEW.id::TEXT);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_online_status ON profiles;
CREATE TRIGGER trigger_online_status
AFTER UPDATE OF is_online ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_online_status();

-- Add trigger to notify new messages
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('new_message', NEW.chatroom_id || ',' || NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_message ON messages;
CREATE TRIGGER trigger_new_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION notify_new_message();
