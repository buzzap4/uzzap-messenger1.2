-- Enable RLS
alter table chatroom_memberships enable row level security;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON chatroom_memberships;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON chatroom_memberships;
DROP POLICY IF EXISTS "Enable delete access for own memberships" ON chatroom_memberships;
DROP POLICY IF EXISTS "Users can view all memberships" ON chatroom_memberships;
DROP POLICY IF EXISTS "Users can join chatrooms" ON chatroom_memberships;
DROP POLICY IF EXISTS "Users can leave chatrooms" ON chatroom_memberships;

-- Create updated policies
CREATE POLICY "Users can view all memberships"
ON chatroom_memberships FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can join chatrooms"
ON chatroom_memberships FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave chatrooms"
ON chatroom_memberships FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON chatroom_memberships TO authenticated;
