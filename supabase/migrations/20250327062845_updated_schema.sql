-- Enable the uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT,
    status TEXT,
    avatar_url TEXT,
    last_seen TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create regions table
CREATE TABLE regions (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
     updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create provinces table
CREATE TABLE provinces (
    id TEXT PRIMARY KEY,
    region_id TEXT REFERENCES regions(id) ON DELETE CASCADE,
    name TEXT UNIQUE NOT NULL,
     updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chatrooms table
CREATE TABLE chatrooms (
    id TEXT PRIMARY KEY,
    province_id TEXT REFERENCES provinces(id) ON DELETE CASCADE,
    name TEXT,
     updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chatroom_id TEXT REFERENCES chatrooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(content) <= 2000),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create chatroom_members table
CREATE TABLE chatroom_members (
    chatroom_id TEXT REFERENCES chatrooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (chatroom_id, user_id)
);

-- Create direct_messages table
CREATE TABLE direct_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(content) <= 2000),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted_sender BOOLEAN DEFAULT FALSE,
    is_deleted_receiver BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_blocks table
CREATE TABLE user_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reported_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    direct_message_id UUID REFERENCES direct_messages(id) ON DELETE SET NULL,
    reason TEXT,
    status TEXT CHECK (status IN ('pending', 'resolved', 'rejected')) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX messages_chatroom_id_idx ON messages (chatroom_id);
CREATE INDEX chatroom_members_user_id_idx ON chatroom_members (user_id);
CREATE INDEX chatrooms_province_id_idx ON chatrooms (province_id);

-- Create trigger for messages content not empty
CREATE OR REPLACE FUNCTION check_message_content()
RETURNS TRIGGER AS $$
BEGIN
    IF length(NEW.content) = 0 THEN
        RAISE EXCEPTION 'Message content cannot be empty';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_content_check
BEFORE INSERT OR UPDATE ON messages
FOR EACH ROW
EXECUTE PROCEDURE check_message_content();

-- Create trigger for direct_messages content not empty
CREATE OR REPLACE FUNCTION check_direct_message_content()
RETURNS TRIGGER AS $$
BEGIN
    IF length(NEW.content) = 0 THEN
        RAISE EXCEPTION 'Direct message content cannot be empty';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER direct_message_content_check
BEFORE INSERT OR UPDATE ON direct_messages
FOR EACH ROW
EXECUTE PROCEDURE check_direct_message_content();

-- Create trigger for updated_at column in all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE
ON profiles FOR EACH ROW EXECUTE PROCEDURE 
update_updated_at_column();

CREATE TRIGGER update_regions_updated_at BEFORE UPDATE
ON regions FOR EACH ROW EXECUTE PROCEDURE 
update_updated_at_column();

CREATE TRIGGER update_provinces_updated_at BEFORE UPDATE
ON provinces FOR EACH ROW EXECUTE PROCEDURE 
update_updated_at_column();

CREATE TRIGGER update_chatrooms_updated_at BEFORE UPDATE
ON chatrooms FOR EACH ROW EXECUTE PROCEDURE 
update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE
ON messages FOR EACH ROW EXECUTE PROCEDURE 
update_updated_at_column();

CREATE TRIGGER update_chatroom_members_updated_at BEFORE UPDATE
ON chatroom_members FOR EACH ROW EXECUTE PROCEDURE 
update_updated_at_column();

CREATE TRIGGER update_direct_messages_updated_at BEFORE UPDATE
ON direct_messages FOR EACH ROW EXECUTE PROCEDURE 
update_updated_at_column();

CREATE TRIGGER update_user_blocks_updated_at BEFORE UPDATE
ON user_blocks FOR EACH ROW EXECUTE PROCEDURE 
update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE
ON reports FOR EACH ROW EXECUTE PROCEDURE 
update_updated_at_column();

-- Insert regions
DO $$
DECLARE
  region_data RECORD;
  province_data RECORD;
BEGIN
  -- Insert regions
  FOR region_data IN
    SELECT * FROM (VALUES
      ('NCR', 'National Capital Region'),
      ('CAR', 'Cordillera Administrative Region'),
      ('R1', 'Ilocos Region'),
      ('R2', 'Cagayan Valley'),
      ('R3', 'Central Luzon'),
      ('R4A', 'CALABARZON'),
      ('R4B', 'MIMAROPA'),
      ('R5', 'Bicol Region'),
      ('R6', 'Western Visayas'),
      ('R7', 'Central Visayas'),
      ('R8', 'Eastern Visayas'),
      ('R9', 'Zamboanga Peninsula'),
      ('R10', 'Northern Mindanao'),
      ('R11', 'Davao Region'),
      ('R12', 'SOCCSKSARGEN'),
      ('R13', 'Caraga'),
      ('BARMM', 'Bangsamoro Autonomous Region in Muslim Mindanao')
    ) AS t(id, name)
  LOOP
    INSERT INTO regions (id, name) VALUES (region_data.id, region_data.name);
  END LOOP;

  -- Insert provinces
  FOR province_data IN
    SELECT * FROM (VALUES
        ('NCR', array['Metro Manila']),
        ('CAR', array['Abra', 'Apayao', 'Benguet', 'Ifugao', 'Kalinga', 'Mountain Province']),
        ('R1', array['Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan']),
        ('R2', array['Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino']),
        ('R3', array['Aurora', 'Bataan', 'Bulacan', 'Nueva Ecija', 'Pampanga', 'Tarlac', 'Zambales']),
        ('R4A', array['Batangas', 'Cavite', 'Laguna', 'Quezon', 'Rizal']),
        ('R4B', array['Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Romblon']),
        ('R5', array['Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon']),
        ('R6', array['Aklan', 'Antique', 'Capiz', 'Guimaras', 'Iloilo', 'Negros Occidental']),
        ('R7', array['Bohol', 'Cebu', 'Negros Oriental', 'Siquijor']),
        ('R8', array['Biliran', 'Eastern Samar', 'Leyte', 'Northern Samar', 'Samar', 'Southern Leyte']),
        ('R9', array['Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay']),
        ('R10', array['Bukidnon', 'Camiguin', 'Lanao del Norte', 'Misamis Occidental', 'Misamis Oriental']),
        ('R11', array['Davao de Oro', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental', 'Davao Oriental']),
        ('R12', array['Cotabato', 'Sarangani', 'South Cotabato', 'Sultan Kudarat']),
        ('R13', array['Agusan del Norte', 'Agusan del Sur', 'Dinagat Islands', 'Surigao del Norte', 'Surigao del Sur']),
        ('BARMM', array['Basilan', 'Lanao del Sur', 'Maguindanao del Norte', 'Maguindanao del Sur', 'Sulu', 'Tawi-Tawi'])
    ) AS t(region_id, province_names)
  LOOP
    FOR i IN 1 .. array_length(province_data.province_names, 1)
    LOOP
        INSERT INTO provinces (id, region_id, name) VALUES (province_data.region_id || LPAD(i::TEXT, 3, '0'), province_data.region_id, province_data.province_names[i]);
    END LOOP;
  END LOOP;
END $$;




-- Insert default chatrooms (one per province)
DO $$
DECLARE
  province_record RECORD;
BEGIN
  FOR province_record IN SELECT id, name FROM provinces
  LOOP
      INSERT INTO chatrooms (id, province_id, name) VALUES
          (province_record.id || '-chatroom', province_record.id, province_record.name || ' Chatroom');
  END LOOP;
END $$;
