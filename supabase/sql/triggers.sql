-- Drop existing objects to avoid conflicts
DROP TRIGGER IF EXISTS welcome_message_trigger ON chatroom_memberships;
DROP FUNCTION IF EXISTS send_welcome_message();

-- Create the welcome message function
CREATE OR REPLACE FUNCTION send_welcome_message()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
DECLARE
    bot_id UUID;
BEGIN
    -- Get bot user ID
    SELECT id INTO bot_id 
    FROM auth.users 
    WHERE email = 'mharbalaba@gmail.com';

    -- Insert welcome message
    INSERT INTO messages (user_id, content, chatroom_id)
    VALUES (bot_id, 'Welcome to the chatroom! Feel free to introduce yourself.', NEW.chatroom_id);

    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER welcome_message_trigger
AFTER INSERT ON chatroom_memberships
FOR EACH ROW 
EXECUTE FUNCTION send_welcome_message();
