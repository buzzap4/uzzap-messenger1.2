-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.messages enable row level security;
alter table public.direct_messages enable row level security;
alter table public.chatroom_memberships enable row level security;

-- Add necessary indexes
create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists messages_chatroom_id_idx on public.messages (chatroom_id);
create index if not exists direct_messages_conversation_id_idx on public.direct_messages (conversation_id);
create index if not exists chatroom_memberships_user_id_idx on public.chatroom_memberships (user_id);

-- Add constraints (only if they don't exist)
do $$ 
begin
  if not exists (select 1 
    from information_schema.constraint_column_usage 
    where table_name = 'profiles' and constraint_name = 'username_length') then
    
    alter table public.profiles
      add constraint username_length check (char_length(username) >= 3);
  end if;

  if not exists (select 1 
    from information_schema.constraint_column_usage 
    where table_name = 'messages' and constraint_name = 'content_not_empty') then
    
    alter table public.messages
      add constraint content_not_empty check (char_length(content) > 0);
  end if;

  if not exists (select 1 
    from information_schema.constraint_column_usage 
    where table_name = 'direct_messages' and constraint_name = 'content_not_empty_dm') then
    
    alter table public.direct_messages
      add constraint content_not_empty_dm check (char_length(content) > 0);
  end if;
end $$;

-- Safely drop and recreate policies
do $$
begin
  -- Drop profile policies if they exist
  if exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Public profiles are viewable by everyone') then
    drop policy "Public profiles are viewable by everyone" on profiles;
  end if;
  if exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can insert their own profile') then
    drop policy "Users can insert their own profile" on profiles;
  end if;
  if exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can update own profile') then
    drop policy "Users can update own profile" on profiles;
  end if;
  if exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Profiles cannot be deleted') then
    drop policy "Profiles cannot be deleted" on profiles;
  end if;

  -- Drop message policies if they exist
  if exists (select 1 from pg_policies where tablename = 'messages' and policyname = 'Users can view messages in chatrooms they are members of') then
    drop policy "Users can view messages in chatrooms they are members of" on messages;
  end if;
  if exists (select 1 from pg_policies where tablename = 'messages' and policyname = 'Users can insert messages in chatrooms they are members of') then
    drop policy "Users can insert messages in chatrooms they are members of" on messages;
  end if;
  if exists (select 1 from pg_policies where tablename = 'messages' and policyname = 'Users can update their own messages') then
    drop policy "Users can update their own messages" on messages;
  end if;
  if exists (select 1 from pg_policies where tablename = 'messages' and policyname = 'Users can delete their own messages') then
    drop policy "Users can delete their own messages" on messages;
  end if;
end $$;

-- Create profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id )
  with check ( auth.uid() = id );

create policy "Profiles cannot be deleted"
  on profiles for delete
  using ( false );

-- Create messages policies
create policy "Users can view messages in chatrooms they are members of"
  on messages for select
  using (
    exists (
      select 1 from chatroom_memberships
      where user_id = auth.uid()
      and chatroom_id = messages.chatroom_id
    )
  );

create policy "Users can insert messages in chatrooms they are members of"
  on messages for insert
  with check (
    exists (
      select 1 from chatroom_memberships
      where user_id = auth.uid()
      and chatroom_id = messages.chatroom_id
    )
  );

create policy "Users can update their own messages"
  on messages for update
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

create policy "Users can delete their own messages"
  on messages for delete
  using ( auth.uid() = user_id );
