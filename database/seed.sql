-- Seed Regions
INSERT INTO regions (id, name, code, order_sequence, is_active) VALUES
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'National Capital Region', 'NCR', 1, true),
    ('550e8400-e29b-41d4-a716-446655440000', 'Central Luzon', 'R3', 2, true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'CALABARZON', 'R4A', 3, true);

-- Seed Provinces
INSERT INTO provinces (id, region_id, name, code, is_active) VALUES
    ('123e4567-e89b-12d3-a456-426614174000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Metro Manila', 'MM', true),
    ('987fcdeb-51a2-4121-9c1a-426614174001', '550e8400-e29b-41d4-a716-446655440000', 'Bulacan', 'BUL', true),
    ('550e8400-e29b-41d4-a716-446655440001', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Laguna', 'LAG', true);

-- Seed Profiles (Sample Users)
INSERT INTO profiles (id, username, avatar_url, display_name, status_message, role) VALUES
    ('a1b2c3d4-e5f6-4321-a123-426614174000', 'admin_user', 'https://api.dicebear.com/7.x/initials/svg?seed=AU', 'System Admin', 'Managing the system', 'admin'),
    ('b2c3d4e5-f6a7-5432-b234-426614174001', 'mod_user', 'https://api.dicebear.com/7.x/initials/svg?seed=MU', 'Moderator', 'Keeping the peace', 'moderator'),
    ('c3d4e5f6-a7b8-6543-c345-426614174002', 'regular_user1', 'https://api.dicebear.com/7.x/initials/svg?seed=RU1', 'Regular User', 'Just chatting', 'user'),
    ('d4e5f6a7-b8c9-7654-d456-426614174003', 'regular_user2', 'https://api.dicebear.com/7.x/initials/svg?seed=RU2', 'Chat User', 'Hello world', 'user');

-- Seed User Blocks
INSERT INTO user_blocks (blocker_id, blocked_id) VALUES
    ('c3d4e5f6-a7b8-6543-c345-426614174002', 'd4e5f6a7-b8c9-7654-d456-426614174003');

-- Seed Chatrooms
INSERT INTO chatrooms (id, province_id, name, description, max_members) VALUES
    ('e5f6a7b8-c9d0-8765-e567-426614174000', '123e4567-e89b-12d3-a456-426614174000', 'Manila Chat', 'Chat room for Manila residents', 200),
    ('f6a7b8c9-d0e1-9876-f678-426614174001', '987fcdeb-51a2-4121-9c1a-426614174001', 'Bulacan Hub', 'Bulacan community chat', 150),
    ('a7b8c9d0-e1f2-0987-a789-426614174002', '550e8400-e29b-41d4-a716-446655440001', 'Laguna Lounge', 'Laguna hangout spot', 100);

-- Seed Chatroom Memberships
INSERT INTO chatroom_memberships (chatroom_id, user_id) VALUES
    ('e5f6a7b8-c9d0-8765-e567-426614174000', 'a1b2c3d4-e5f6-4321-a123-426614174000'),
    ('e5f6a7b8-c9d0-8765-e567-426614174000', 'b2c3d4e5-f6a7-5432-b234-426614174001'),
    ('f6a7b8c9-d0e1-9876-f678-426614174001', 'c3d4e5f6-a7b8-6543-c345-426614174002'),
    ('a7b8c9d0-e1f2-0987-a789-426614174002', 'd4e5f6a7-b8c9-7654-d456-426614174003');

-- Seed Chatroom Roles
INSERT INTO chatroom_roles (id, chatroom_id, user_id, role) VALUES
    ('b8c9d0e1-f2a3-0987-b890-426614174000', 'e5f6a7b8-c9d0-8765-e567-426614174000', 'a1b2c3d4-e5f6-4321-a123-426614174000', 'owner'),
    ('c9d0e1f2-a3b4-1098-c901-426614174001', 'f6a7b8c9-d0e1-9876-f678-426614174001', 'b2c3d4e5-f6a7-5432-b234-426614174001', 'moderator'),
    ('d0e1f2a3-b4c5-2109-d012-426614174002', 'a7b8c9d0-e1f2-0987-a789-426614174002', 'c3d4e5f6-a7b8-6543-c345-426614174002', 'member');

-- Seed Messages
INSERT INTO messages (id, content, user_id, chatroom_id) VALUES
    ('e1f2a3b4-c5d6-3210-e123-426614174000', 'Welcome to Manila Chat!', 'a1b2c3d4-e5f6-4321-a123-426614174000', 'e5f6a7b8-c9d0-8765-e567-426614174000'),
    ('f2a3b4c5-d6e7-4321-f234-426614174001', 'Hello Bulacan!', 'b2c3d4e5-f6a7-5432-b234-426614174001', 'f6a7b8c9-d0e1-9876-f678-426614174001'),
    ('a3b4c5d6-e7f8-5432-a345-426614174002', 'Laguna chat room is now open!', 'c3d4e5f6-a7b8-6543-c345-426614174002', 'a7b8c9d0-e1f2-0987-a789-426614174002');

-- Seed Direct Messages
INSERT INTO direct_messages (id, content, sender_id, receiver_id, conversation_id) VALUES
    ('b4c5d6e7-f8a9-6543-b456-426614174000', 'Hey, how are you?', 'c3d4e5f6-a7b8-6543-c345-426614174002', 'b2c3d4e5-f6a7-5432-b234-426614174001', 'd1e2f3a4-b5c6-7890-d123-426614174000'),
    ('c5d6e7f8-a9b0-7654-c567-426614174001', 'Welcome to the platform!', 'a1b2c3d4-e5f6-4321-a123-426614174000', 'c3d4e5f6-a7b8-6543-c345-426614174002', 'd1e2f3a4-b5c6-7890-d123-426614174001');
