-- Schema creation or migration code here...
-- ...existing schema creation code...

-- Reset tables
TRUNCATE auth.users CASCADE;
TRUNCATE regions, provinces, chatrooms CASCADE;

-- Insert users into auth.users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  ('d7404b4c-b881-4a76-9874-f89a81d81326', 'juan@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('e9404b4c-b881-4a76-9874-f89a81d81327', 'maria@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW());

-- Insert regions
INSERT INTO regions (id, name) VALUES
  ('r001', 'National Capital Region (NCR)'),
  ('r002', 'Cordillera Administrative Region (CAR)');

-- Insert provinces
INSERT INTO provinces (id, region_id, name) VALUES
  ('p001', 'r001', 'Manila'),
  ('p002', 'r001', 'Quezon City'),
  ('p003', 'r002', 'Baguio');

-- Insert chatrooms
INSERT INTO chatrooms (id, province_id, name) VALUES
  ('c001', 'p001', 'Manila Chatroom'),
  ('c002', 'p002', 'Quezon City Chatroom'),
  ('c003', 'p003', 'Baguio Chatroom');

-- Insert profiles
INSERT INTO profiles (id, username, display_name, avatar_url, role, status_message) VALUES
  ('d7404b4c-b881-4a76-9874-f89a81d81326', 'juan_dela_cruz', 'Juan Dela Cruz', 'https://api.dicebear.com/7.x/avataaars/svg?seed=juan', 'user', 'Hello Philippines!'),
  ('e9404b4c-b881-4a76-9874-f89a81d81327', 'maria_garcia', 'Maria Garcia', 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria', 'user', 'Mabuhay!');

-- Insert chatroom members
INSERT INTO chatroom_members (chatroom_id, user_id, joined_at) VALUES
  ('c001', 'd7404b4c-b881-4a76-9874-f89a81d81326', NOW()),
  ('c002', 'e9404b4c-b881-4a76-9874-f89a81d81327', NOW());

-- Insert messages
INSERT INTO messages (chatroom_id, user_id, content, created_at) VALUES
  ('c001', 'd7404b4c-b881-4a76-9874-f89a81d81326', 'Hello from Manila!', NOW()),
  ('c002', 'e9404b4c-b881-4a76-9874-f89a81d81327', 'Hello from Quezon City!', NOW());
