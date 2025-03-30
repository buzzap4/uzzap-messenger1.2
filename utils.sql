-- Enable the uuid-ossp extension if it's not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to send a welcome message to a specific chatroom
CREATE OR REPLACE FUNCTION send_welcome_message_to_chatroom(chatroom_id_param UUID)
RETURNS VOID AS $$
DECLARE
    system_user_id UUID;
BEGIN
    -- Get the ID of the system user (you should create this user in your profiles table)
    SELECT id INTO system_user_id FROM profiles WHERE username = 'system' LIMIT 1;

    -- If the system user doesn't exist, raise an exception
    IF NOT FOUND THEN
        RAISE EXCEPTION 'System user not found. Please create a user with username ''system'' in the profiles table.';
    END IF;

    -- Insert the welcome message into the messages table
    INSERT INTO messages (content, user_id, chatroom_id)
    VALUES ('Welcome to the chatroom!', system_user_id, chatroom_id_param);
END;
$$ LANGUAGE plpgsql;

-- Function to send a welcome message to all province chatrooms
CREATE OR REPLACE FUNCTION send_welcome_message_to_all_provinces()
RETURNS VOID AS $$
DECLARE
    province_chatroom_record RECORD;
BEGIN
    -- Iterate through all province chatrooms
    FOR province_chatroom_record IN SELECT id FROM chatrooms LOOP
        -- Send a welcome message to each chatroom
        PERFORM send_welcome_message_to_chatroom(province_chatroom_record.id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create the system user if it doesn't exist
INSERT INTO profiles (id, username, display_name, created_at, updated_at)
SELECT uuid_generate_v4(), 'system', 'System User', timezone('utc'::text, now()), timezone('utc'::text, now())
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE username = 'system');

-- Send the welcome message to all provinces
SELECT send_welcome_message_to_all_provinces();