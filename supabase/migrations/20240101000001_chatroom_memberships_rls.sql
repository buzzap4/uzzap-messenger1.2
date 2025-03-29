-- Enable RLS
alter table chatroom_memberships enable row level security;

-- Create policies
-- Allow users to join chatrooms
create policy "Users can join chatrooms"
on chatroom_memberships for insert
to authenticated
with check (auth.uid() = user_id);

-- Allow users to view their own memberships
create policy "Users can view their own memberships"
on chatroom_memberships for select
to authenticated
using (auth.uid() = user_id);

-- Allow users to leave chatrooms (delete their own memberships)
create policy "Users can leave chatrooms"
on chatroom_memberships for delete
to authenticated
using (auth.uid() = user_id);
