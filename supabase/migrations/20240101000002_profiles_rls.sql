-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can update their online status"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Allow real-time updates for online status
CREATE POLICY "Allow real-time updates for online status"
ON profiles FOR SELECT
TO authenticated
USING (true);
