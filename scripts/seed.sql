-- Create auth users first (requires superuser privileges)
DO $$
DECLARE
    user_count integer;
BEGIN
    -- Check if users already exist
    SELECT COUNT(*) INTO user_count FROM auth.users 
    WHERE id IN (
        'd1f7c10b-58cc-4372-a567-0e02b2c3d489',
        'd1f7c10b-58cc-4372-a567-0e02b2c3d490',
        'd1f7c10b-58cc-4372-a567-0e02b2c3d491',
        'd1f7c10b-58cc-4372-a567-0e02b2c3d492'
    );

    -- Only create users if they don't exist
    IF user_count = 0 THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES
            ('d1f7c10b-58cc-4372-a567-0e02b2c3d489', 'admin1@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
            ('d1f7c10b-58cc-4372-a567-0e02b2c3d490', 'mod1@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
            ('d1f7c10b-58cc-4372-a567-0e02b2c3d491', 'user1@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
            ('d1f7c10b-58cc-4372-a567-0e02b2c3d492', 'user2@example.com', crypt('password123', gen_salt('bf')), now(), now(), now());
    END IF;
END
$$;

-- Seed initial regions and provinces (fixed query)
INSERT INTO regions (name)
VALUES ('Metro Manila'), ('REGION IV-A - CALABARZON')
ON CONFLICT (name) DO NOTHING;

-- Metro Manila provinces/cities
INSERT INTO provinces (name, region_id)
SELECT 'Metro Manila', r.id
FROM regions r
WHERE r.name = 'Metro Manila'
ON CONFLICT (name, region_id) DO NOTHING;

-- CALABARZON provinces (fixed query)
INSERT INTO provinces (name, region_id)
SELECT p.province_name, r.id
FROM regions r
CROSS JOIN (
    VALUES 
        ('Cavite'),
        ('Laguna'),
        ('Batangas'),
        ('Rizal'),
        ('Quezon')
) AS p(province_name)
WHERE r.name = 'REGION IV-A - CALABARZON'
ON CONFLICT (name, region_id) DO NOTHING;

-- Seed regions
INSERT INTO regions (id, name) VALUES
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Luzon'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Visayas'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Mindanao');

-- Seed provinces
INSERT INTO provinces (id, name, region_id) VALUES
    -- Luzon provinces
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d482', 'Metro Manila', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d483', 'Cavite', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d484', 'Laguna', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
    -- Visayas provinces
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d485', 'Cebu', 'f47ac10b-58cc-4372-a567-0e02b2c3d480'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d486', 'Bohol', 'f47ac10b-58cc-4372-a567-0e02b2c3d480'),
    -- Mindanao provinces
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d487', 'Davao', 'f47ac10b-58cc-4372-a567-0e02b2c3d481'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d488', 'Zamboanga', 'f47ac10b-58cc-4372-a567-0e02b2c3d481');

-- Seed profiles (with conflict handling)
INSERT INTO profiles (id, username, avatar_url, display_name, status_message, role)
VALUES
    ('d1f7c10b-58cc-4372-a567-0e02b2c3d489', 'admin1', 'https://example.com/avatar1.jpg', 'Admin User', 'System Administrator', 'admin'),
    ('d1f7c10b-58cc-4372-a567-0e02b2c3d490', 'mod1', 'https://example.com/avatar2.jpg', 'Moderator', 'Chat Moderator', 'moderator'),
    ('d1f7c10b-58cc-4372-a567-0e02b2c3d491', 'user1', 'https://example.com/avatar3.jpg', 'Regular User 1', 'Hello World!', 'user'),
    ('d1f7c10b-58cc-4372-a567-0e02b2c3d492', 'user2', 'https://example.com/avatar4.jpg', 'Regular User 2', 'Happy chatting!', 'user')
ON CONFLICT (id) DO UPDATE
SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    status_message = EXCLUDED.status_message;

-- Combined chatroom seeding with conflict handling and returning IDs
WITH inserted_chatrooms AS (
    INSERT INTO chatrooms (name, province_id)
    SELECT 
        p.name || ' Chat',
        p.id
    FROM provinces p
    LEFT JOIN chatrooms c ON c.province_id = p.id
    WHERE c.id IS NULL
    RETURNING id, name, province_id
)
-- Store Manila Chat ID for reference
, manila_chat AS (
    SELECT id 
    FROM inserted_chatrooms 
    WHERE name = 'Metro Manila Chat'
    UNION ALL
    SELECT id 
    FROM chatrooms 
    WHERE name = 'Metro Manila Chat'
    LIMIT 1
)
-- Store Cebu Chat ID for reference
, cebu_chat AS (
    SELECT id 
    FROM inserted_chatrooms 
    WHERE name = 'Cebu Chat'
    UNION ALL
    SELECT id 
    FROM chatrooms 
    WHERE name = 'Cebu Chat'
    LIMIT 1
)
-- Seed messages using the correct chatroom IDs with UUID casting
INSERT INTO messages (content, user_id, chatroom_id)
SELECT 'Welcome to Manila Chat!', 
       'd1f7c10b-58cc-4372-a567-0e02b2c3d489'::UUID, 
       id 
FROM manila_chat
UNION ALL
SELECT 'Hello everyone!', 
       'd1f7c10b-58cc-4372-a567-0e02b2c3d491'::UUID, 
       id 
FROM manila_chat
UNION ALL
SELECT 'Welcome to Cebu Chat!', 
       'd1f7c10b-58cc-4372-a567-0e02b2c3d490'::UUID, 
       id 
FROM cebu_chat;

-- Seed chatroom memberships (with conflict handling)
INSERT INTO chatroom_memberships (chatroom_id, user_id)
SELECT c.id, p.id
FROM chatrooms c
CROSS JOIN profiles p
WHERE c.name LIKE '%Chat'
ON CONFLICT (chatroom_id, user_id) DO NOTHING;

-- Continue with remaining seed data
-- Cast UUIDs in direct messages
INSERT INTO direct_messages (content, sender_id, receiver_id, conversation_id) 
VALUES
    ('Hey, how are you?', 
     'd1f7c10b-58cc-4372-a567-0e02b2c3d491'::UUID, 
     'd1f7c10b-58cc-4372-a567-0e02b2c3d492'::UUID, 
     'f1f7c10b-58cc-4372-a567-0e02b2c3d496'::UUID),
    ('I''m good, thanks!', 
     'd1f7c10b-58cc-4372-a567-0e02b2c3d492'::UUID, 
     'd1f7c10b-58cc-4372-a567-0e02b2c3d491'::UUID, 
     'f1f7c10b-58cc-4372-a567-0e02b2c3d496'::UUID);
