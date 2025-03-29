-- Truncate tables to delete existing regions, provinces, chatrooms, and related data
TRUNCATE TABLE chatroom_memberships CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE chatrooms CASCADE;
TRUNCATE TABLE provinces CASCADE;
TRUNCATE TABLE regions CASCADE;

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

-- Complete list of regions in the Philippines
INSERT INTO regions (id, name) VALUES
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'National Capital Region (NCR)'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Cordillera Administrative Region (CAR)'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Ilocos Region (Region I)'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'Cagayan Valley (Region II)'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'Central Luzon (Region III)'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d484', 'CALABARZON (Region IV-A)'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d485', 'MIMAROPA (Region IV-B)'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d486', 'Bicol Region (Region V)'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d487', 'Western Visayas (Region VI)'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d488', 'Central Visayas (Region VII)'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d489', 'Eastern Visayas (Region VIII)'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d490', 'Zamboanga Peninsula (Region IX)'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d491', 'Northern Mindanao (Region X)'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d492', 'Davao Region (Region XI)'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d493', 'SOCCSKSARGEN (Region XII)'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d494', 'Caraga (Region XIII)'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d495', 'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)')
ON CONFLICT (id) DO NOTHING;

-- Complete list of provinces in the Philippines
INSERT INTO provinces (id, name, region_id) VALUES
    -- NCR
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d482', 'Metro Manila', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
    -- CAR
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d483', 'Abra', 'f47ac10b-58cc-4372-a567-0e02b2c3d480'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d484', 'Benguet', 'f47ac10b-58cc-4372-a567-0e02b2c3d480'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d485', 'Ifugao', 'f47ac10b-58cc-4372-a567-0e02b2c3d480'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d486', 'Kalinga', 'f47ac10b-58cc-4372-a567-0e02b2c3d480'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d487', 'Mountain Province', 'f47ac10b-58cc-4372-a567-0e02b2c3d480'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d488', 'Apayao', 'f47ac10b-58cc-4372-a567-0e02b2c3d480'),
    -- Region I
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d489', 'Ilocos Norte', 'f47ac10b-58cc-4372-a567-0e02b2c3d481'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d490', 'Ilocos Sur', 'f47ac10b-58cc-4372-a567-0e02b2c3d481'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d491', 'La Union', 'f47ac10b-58cc-4372-a567-0e02b2c3d481'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d492', 'Pangasinan', 'f47ac10b-58cc-4372-a567-0e02b2c3d481'),
    -- Region II
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d493', 'Batanes', 'f47ac10b-58cc-4372-a567-0e02b2c3d482'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d494', 'Cagayan', 'f47ac10b-58cc-4372-a567-0e02b2c3d482'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d495', 'Isabela', 'f47ac10b-58cc-4372-a567-0e02b2c3d482'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d496', 'Nueva Vizcaya', 'f47ac10b-58cc-4372-a567-0e02b2c3d482'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d497', 'Quirino', 'f47ac10b-58cc-4372-a567-0e02b2c3d482'),
    -- Region III
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d498', 'Aurora', 'f47ac10b-58cc-4372-a567-0e02b2c3d483'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d499', 'Bataan', 'f47ac10b-58cc-4372-a567-0e02b2c3d483'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d500', 'Bulacan', 'f47ac10b-58cc-4372-a567-0e02b2c3d483'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d501', 'Nueva Ecija', 'f47ac10b-58cc-4372-a567-0e02b2c3d483'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d502', 'Pampanga', 'f47ac10b-58cc-4372-a567-0e02b2c3d483'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d503', 'Tarlac', 'f47ac10b-58cc-4372-a567-0e02b2c3d483'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d504', 'Zambales', 'f47ac10b-58cc-4372-a567-0e02b2c3d483'),
    -- Region IV-A
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d505', 'Cavite', 'f47ac10b-58cc-4372-a567-0e02b2c3d484'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d506', 'Laguna', 'f47ac10b-58cc-4372-a567-0e02b2c3d484'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d507', 'Batangas', 'f47ac10b-58cc-4372-a567-0e02b2c3d484'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d508', 'Rizal', 'f47ac10b-58cc-4372-a567-0e02b2c3d484'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d509', 'Quezon', 'f47ac10b-58cc-4372-a567-0e02b2c3d484'),
    -- Region IV-B
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d510', 'Occidental Mindoro', 'f47ac10b-58cc-4372-a567-0e02b2c3d485'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d511', 'Oriental Mindoro', 'f47ac10b-58cc-4372-a567-0e02b2c3d485'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d512', 'Marinduque', 'f47ac10b-58cc-4372-a567-0e02b2c3d485'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d513', 'Romblon', 'f47ac10b-58cc-4372-a567-0e02b2c3d485'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d514', 'Palawan', 'f47ac10b-58cc-4372-a567-0e02b2c3d485'),
    -- Region V
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d515', 'Albay', 'f47ac10b-58cc-4372-a567-0e02b2c3d486'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d516', 'Camarines Norte', 'f47ac10b-58cc-4372-a567-0e02b2c3d486'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d517', 'Camarines Sur', 'f47ac10b-58cc-4372-a567-0e02b2c3d486'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d518', 'Catanduanes', 'f47ac10b-58cc-4372-a567-0e02b2c3d486'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d519', 'Masbate', 'f47ac10b-58cc-4372-a567-0e02b2c3d486'),
    ('b5f7c10b-58cc-4372-a567-0e02b2c3d520', 'Sorsogon', 'f47ac10b-58cc-4372-a567-0e02b2c3d486')
ON CONFLICT (id) DO NOTHING;

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
