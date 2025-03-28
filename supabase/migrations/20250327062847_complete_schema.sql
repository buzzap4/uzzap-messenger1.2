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

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(30) NOT NULL UNIQUE CHECK (username ~ '^[a-zA-Z0-9_]+$'),
    display_name VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    status_message TEXT,
    role VARCHAR(20) DEFAULT 'user',
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create regions table
CREATE TABLE regions (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create provinces table
CREATE TABLE provinces (
    id VARCHAR(20) PRIMARY KEY,
    region_id VARCHAR(10) REFERENCES regions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chatrooms table
CREATE TABLE chatrooms (
    id VARCHAR(50) PRIMARY KEY,
    province_id VARCHAR(20) REFERENCES provinces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chatroom_id VARCHAR(50) REFERENCES chatrooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(content) <= 2000),
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chatroom_members table
CREATE TABLE chatroom_members (
    chatroom_id VARCHAR(50) REFERENCES chatrooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (chatroom_id, user_id)
);

-- Create direct_messages table
CREATE TABLE direct_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(content) <= 2000),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_blocks table
CREATE TABLE user_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (blocker_id, blocked_id)
);

-- Create reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reported_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    direct_message_id UUID REFERENCES direct_messages(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'resolved', 'rejected')) NOT NULL DEFAULT 'pending',
    notes TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_messages_chatroom ON messages(chatroom_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_direct_messages_participants ON direct_messages(sender_id, receiver_id);
CREATE INDEX idx_direct_messages_created_at ON direct_messages(created_at);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_chatrooms_province ON chatrooms(province_id);

-- Insert initial regions
INSERT INTO regions (id, name) VALUES
    ('NCR', 'National Capital Region'),
    ('CAR', 'Cordillera Administrative Region'),
    ('R1', 'Ilocos Region'),
    ('R2', 'Cagayan Valley'),
    ('R3', 'Central Luzon');

-- Insert sample provinces
INSERT INTO provinces (id, region_id, name) VALUES
    ('NCR-01', 'NCR', 'Manila'),
    ('NCR-02', 'NCR', 'Quezon City'),
    ('CAR-01', 'CAR', 'Baguio'),
    ('R1-01', 'R1', 'Ilocos Norte'),
    ('R2-01', 'R2', 'Cagayan');

-- Insert default chatrooms
INSERT INTO chatrooms (id, province_id, name) VALUES
    ('manila-general', 'NCR-01', 'Manila General Chat'),
    ('qc-general', 'NCR-02', 'Quezon City General Chat'),
    ('baguio-general', 'CAR-01', 'Baguio General Chat');

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_regions_timestamp BEFORE UPDATE ON regions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_provinces_timestamp BEFORE UPDATE ON provinces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chatrooms_timestamp BEFORE UPDATE ON chatrooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_timestamp BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_direct_messages_timestamp BEFORE UPDATE ON direct_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Message policies
CREATE POLICY "Messages are viewable by everyone"
    ON messages FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert messages"
    ON messages FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own messages"
    ON messages FOR UPDATE
    USING (auth.uid() = user_id);

-- Direct message policies
CREATE POLICY "Users can see their own direct messages"
    ON direct_messages FOR SELECT
    USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can send direct messages"
    ON direct_messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);
