-- Drop existing policies explicitly
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Grant permissions
GRANT SELECT ON profiles TO anon;
GRANT ALL ON profiles TO authenticated;
-- Drop all existing policies dynamically using the correct column name
DO $$ 
BEGIN
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS "' || policyname || '" ON profiles;', E'\n')
        FROM pg_policies 
        WHERE tablename = 'profiles'
    );
END $$;

-- Create new policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Update grants
GRANT SELECT ON profiles TO anon;
GRANT ALL ON profiles TO authenticated;
-- First drop all possible existing policies explicitly
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies with clear names
CREATE POLICY "profiles_select_policy" 
    ON profiles FOR SELECT 
    USING (true);

CREATE POLICY "profiles_insert_policy" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Grant base permissions
GRANT SELECT ON profiles TO anon;
GRANT ALL ON profiles TO authenticated;
-- Drop existing policies individually
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Allow public read access" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated insert" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated update" ON profiles;

-- Create new policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Update grants
GRANT SELECT ON profiles TO anon;
GRANT ALL ON profiles TO authenticated;
-- Drop all existing policies correctly
DO $$ 
BEGIN
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS "' || policyname || '" ON profiles;', E'\n')
        FROM pg_policies 
        WHERE tablename = 'profiles'
    );
END $$;

-- Create new policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Update grants
GRANT SELECT ON profiles TO anon;
GRANT ALL ON profiles TO authenticated;
-- First drop ALL existing policies
DO $$ 
BEGIN
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS "' || polname || '" ON profiles;', E'\n')
        FROM pg_policies 
        WHERE tablename = 'profiles'
    );
END $$;

-- Then create new policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Update grants
GRANT SELECT ON profiles TO anon;
GRANT ALL ON profiles TO authenticated;
-- Reset policies first
DROP POLICY IF EXISTS "Allow public read access" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated insert" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated update" ON profiles;

-- Modify profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL CHECK (char_length(username) >= 3),
    display_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    status_message TEXT,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Grant permissions
GRANT SELECT ON profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
-- Reset existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Create new simplified policies
CREATE POLICY "Allow public read access"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Ensure RLS is enabled but with proper grants
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Grant proper permissions
GRANT SELECT ON profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT USAGE ON SEQUENCE profiles_id_seq TO authenticated;
-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Create new policies
CREATE POLICY "Enable read access for all users"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON messages TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
/*
  # Initial Schema Setup for Chat App

  1. New Tables
    - `profiles`
      - Stores user profile information
      - Links to Supabase auth.users
      - Includes role, status, avatar URL, and last seen
    
    - `regions`
      - Stores Philippine regions
      - Used for organizing chatrooms
    
    - `provinces`
      - Stores provinces within regions
      - References regions table
    
    - `chatrooms`
      - Represents chat rooms for each province
      - Links to provinces table
    
    - `messages`
      - Stores chat messages
      - Links to profiles and chatrooms
    
    - `chatroom_members`
      - Tracks active users in chatrooms
      - Handles user join/leave events
    
    - `direct_messages`
      - Stores private messages between users
      - Links to sender and receiver profiles
    
    - `user_blocks`
      - Tracks blocked users
      - Prevents harassment
    
    - `reports`
      - Stores user reports for moderation
      - Links to reported content and users

  2. Security
    - Enable RLS on all tables
    - Set up policies for different user roles
    - Ensure proper access control
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS user_blocks CASCADE;
DROP TABLE IF EXISTS direct_messages CASCADE;
DROP TABLE IF EXISTS chatroom_members CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chatrooms CASCADE;
DROP TABLE IF EXISTS provinces CASCADE;
DROP TABLE IF EXISTS regions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create tables with proper constraints and indexes

-- Profiles table with extended user information
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL CHECK (char_length(username) >= 3),
    display_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    status_message TEXT,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT username_length CHECK (char_length(username) <= 30)
);

CREATE INDEX profiles_username_idx ON profiles USING btree (username);
CREATE INDEX profiles_role_idx ON profiles USING btree (role);

-- Regions table
CREATE TABLE regions (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX regions_name_idx ON regions USING btree (name);

-- Provinces table with region relationship
CREATE TABLE provinces (
    id TEXT PRIMARY KEY,
    region_id TEXT REFERENCES regions(id) ON DELETE CASCADE,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX provinces_region_id_idx ON provinces USING btree (region_id);
CREATE INDEX provinces_name_idx ON provinces USING btree (name);

-- Chatrooms table
CREATE TABLE chatrooms (
    id TEXT PRIMARY KEY,
    province_id TEXT REFERENCES provinces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT name_length CHECK (char_length(name) <= 100)
);

CREATE INDEX chatrooms_province_id_idx ON chatrooms USING btree (province_id);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chatroom_id TEXT REFERENCES chatrooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL CHECK (char_length(content) <= 2000),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX messages_chatroom_id_idx ON messages USING btree (chatroom_id);
CREATE INDEX messages_user_id_idx ON messages USING btree (user_id);
CREATE INDEX messages_created_at_idx ON messages USING btree (created_at DESC);

-- Chatroom members table
CREATE TABLE chatroom_members (
    chatroom_id TEXT REFERENCES chatrooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (chatroom_id, user_id)
);

CREATE INDEX chatroom_members_user_id_idx ON chatroom_members USING btree (user_id);

-- Direct messages table
CREATE TABLE direct_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    receiver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL CHECK (char_length(content) <= 2000),
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX direct_messages_sender_id_idx ON direct_messages USING btree (sender_id);
CREATE INDEX direct_messages_receiver_id_idx ON direct_messages USING btree (receiver_id);
CREATE INDEX direct_messages_created_at_idx ON direct_messages USING btree (created_at DESC);

-- User blocks table
CREATE TABLE user_blocks (
    blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id)
);

CREATE INDEX user_blocks_blocked_id_idx ON user_blocks USING btree (blocked_id);

-- Reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reported_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    direct_message_id UUID REFERENCES direct_messages(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX reports_status_idx ON reports USING btree (status);
CREATE INDEX reports_created_at_idx ON reports USING btree (created_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create Security Policies

-- First drop all existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Messages are viewable by everyone" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can view their direct messages" ON direct_messages;
DROP POLICY IF EXISTS "Users can send direct messages" ON direct_messages;
DROP POLICY IF EXISTS "Users can read their direct messages" ON direct_messages;
DROP POLICY IF EXISTS "Users can view their blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can create blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can remove their blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can create reports" ON reports;
DROP POLICY IF EXISTS "Moderators can view reports" ON reports;
DROP POLICY IF EXISTS "Regions are viewable by everyone" ON regions;
DROP POLICY IF EXISTS "Provinces are viewable by everyone" ON provinces;
DROP POLICY IF EXISTS "Chatrooms are viewable by everyone" ON chatrooms;

-- Then create all policies
-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Messages policies
CREATE POLICY "Messages are viewable by everyone"
    ON messages FOR SELECT
    USING (NOT is_deleted);

CREATE POLICY "Users can insert messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages"
    ON messages FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Direct messages policies
CREATE POLICY "Users can view their direct messages"
    ON direct_messages FOR SELECT
    USING (
        auth.uid() IN (sender_id, receiver_id)
        AND NOT EXISTS (
            SELECT 1 FROM user_blocks
            WHERE (blocker_id = auth.uid() AND blocked_id IN (sender_id, receiver_id))
            OR (blocked_id = auth.uid() AND blocker_id IN (sender_id, receiver_id))
        )
    );

CREATE POLICY "Users can send direct messages"
    ON direct_messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND NOT EXISTS (
            SELECT 1 FROM user_blocks
            WHERE (blocker_id = receiver_id AND blocked_id = auth.uid())
            OR (blocked_id = receiver_id AND blocker_id = auth.uid())
        )
    );

-- Other table policies
CREATE POLICY "Regions are viewable by everyone"
    ON regions FOR SELECT
    USING (true);

CREATE POLICY "Provinces are viewable by everyone"
    ON provinces FOR SELECT
    USING (true);

CREATE POLICY "Chatrooms are viewable by everyone"
    ON chatrooms FOR SELECT
    USING (true);

-- User blocks policies
CREATE POLICY "Users can view their blocks"
    ON user_blocks FOR SELECT
    USING (auth.uid() IN (blocker_id, blocked_id));

CREATE POLICY "Users can create blocks"
    ON user_blocks FOR INSERT
    WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can remove their blocks"
    ON user_blocks FOR DELETE
    USING (auth.uid() = blocker_id);

-- Reports policies
CREATE POLICY "Users can create reports"
    ON reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Moderators can view reports"
    ON reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('moderator', 'admin')
        )
    );

-- Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON direct_messages TO authenticated;

-- Ensure default role can create profiles
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT ALL ON TABLES TO authenticated;

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user's last_seen
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET last_seen = NOW()
    WHERE id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatrooms_updated_at
    BEFORE UPDATE ON chatrooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_direct_messages_updated_at
    BEFORE UPDATE ON direct_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_last_seen
    AFTER INSERT OR UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_last_seen();

CREATE TRIGGER update_user_last_seen_dm
    AFTER INSERT OR UPDATE ON direct_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_last_seen();

-- Create a function to verify user exists in auth.users
CREATE OR REPLACE FUNCTION check_user_exists()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.id) THEN
    RAISE EXCEPTION 'User does not exist in auth.users';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check user exists before profile creation
CREATE TRIGGER ensure_user_exists
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_user_exists();

-- Modify profiles RLS policies
CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);