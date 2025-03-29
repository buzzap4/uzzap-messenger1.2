-- Enable RLS
alter table profiles enable row level security;

-- Create policies
-- Allow users to create their own profile
create policy "Users can create their own profile"
on profiles for insert
with check (auth.uid() = id);

-- Allow users to view any profile
create policy "Profiles are viewable by everyone"
on profiles for select
using (true);

-- Allow users to update their own profile
create policy "Users can update own profile"
on profiles for update
using (auth.uid() = id)
with check (
  auth.uid() = id
  AND (
    CASE WHEN role IS NOT NULL 
    THEN role = (SELECT role FROM profiles WHERE id = auth.uid())
    ELSE true
    END
  )
);

-- Prevent profile deletion
create policy "Profiles cannot be deleted"
on profiles for delete
using (false);
