-- Enable real-time for messages table
alter publication supabase_realtime add table messages;

-- Create notification function for new messages
create or replace function notify_new_messages()
returns trigger as $$
begin
  perform pg_notify(
    'new_message',
    json_build_object(
      'id', NEW.id,
      'content', NEW.content,
      'user_id', NEW.user_id,
      'chatroom_id', NEW.chatroom_id,
      'created_at', NEW.created_at
    )::text
  );
  return NEW;
end;
$$ language plpgsql;

-- Create trigger for new messages
drop trigger if exists on_new_message on messages;
create trigger on_new_message
  after insert on messages
  for each row
  execute function notify_new_messages();

-- Enable row level security
alter table messages enable row level security;

-- Create policy for inserting messages
create policy "Users can insert messages"
  on messages for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Create policy for reading messages
create policy "Users can read messages"
  on messages for select
  to authenticated
  using (true);

-- Add real-time replication for messages
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table messages;
