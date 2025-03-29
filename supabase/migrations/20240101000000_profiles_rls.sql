-- Enable RLS
alter table profiles enable row level security;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles cannot be deleted" ON profiles;
DROP POLICY IF EXISTS "Allow public read access to profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to manage their own profile" ON profiles;

-- Create new policies
CREATE POLICY "Allow public read access to profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow users to manage their own profile"
ON profiles FOR ALL 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles cannot be deleted"
ON profiles FOR DELETE
USING (false);
