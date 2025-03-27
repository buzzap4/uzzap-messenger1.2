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

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  status_message text,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Regions table
CREATE TABLE IF NOT EXISTS regions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Provinces table
CREATE TABLE IF NOT EXISTS provinces (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  region_id uuid REFERENCES regions(id) ON DELETE CASCADE,
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Chatrooms table
CREATE TABLE IF NOT EXISTS chatrooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  province_id uuid REFERENCES provinces(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  chatroom_id uuid REFERENCES chatrooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Chatroom members table
CREATE TABLE IF NOT EXISTS chatroom_members (
  chatroom_id uuid REFERENCES chatrooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (chatroom_id, user_id)
);

-- Direct messages table
CREATE TABLE IF NOT EXISTS direct_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- User blocks table
CREATE TABLE IF NOT EXISTS user_blocks (
  blocker_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reported_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

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

-- Policies

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Messages policies
CREATE POLICY "Messages are viewable by chatroom members"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chatroom_members
      WHERE chatroom_members.chatroom_id = messages.chatroom_id
      AND chatroom_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in joined chatrooms"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chatroom_members
      WHERE chatroom_members.chatroom_id = chatroom_id
      AND chatroom_members.user_id = auth.uid()
    )
  );

-- Direct messages policies
CREATE POLICY "Users can view their direct messages"
  ON direct_messages FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR
    auth.uid() = receiver_id
  );

CREATE POLICY "Users can send direct messages"
  ON direct_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Chatroom members policies
CREATE POLICY "Users can view chatroom members"
  ON chatroom_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join/leave chatrooms"
  ON chatroom_members FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create function to update last seen
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_seen = now()
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for last seen
CREATE TRIGGER update_last_seen
  AFTER INSERT OR UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_last_seen();