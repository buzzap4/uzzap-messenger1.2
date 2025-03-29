import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async (req, res) => {
  const { user_id, chatroom_id } = await req.json();

  // Get user data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('username')
    .eq('id', user_id)
    .single();

  if (userError || !userData) {
    return res.status(400).json({ error: 'User not found' });
  }

  // Get chatroom data
  const { data: chatroomData, error: chatroomError } = await supabase
    .from('chatrooms')
    .select('name')
    .eq('id', chatroom_id)
    .single();

  if (chatroomError || !chatroomData) {
    return res.status(400).json({ error: 'Chatroom not found' });
  }

  const botEmail = 'mharbalaba@gmail.com'; // Bot email
  const { data: botData, error: botError } = await supabase
    .from('users')
    .select('id')
    .eq('email', botEmail)
    .single();

  if (botError || !botData) {
    return res.status(400).json({ error: 'Bot user not found' });
  }

  // Get member count
  const { count: memberCount } = await supabase
    .from('chatroom_members')
    .select('*', { count: 'exact' })
    .eq('chatroom_id', chatroom_id);

  // Get time-based greeting
  const hour = new Date().getHours();
  let timeGreeting = 'Hello';
  if (hour < 12) timeGreeting = 'Good morning';
  else if (hour < 17) timeGreeting = 'Good afternoon';
  else timeGreeting = 'Good evening';

  const welcomePhrases = [
    `Hey @${userData.username}, ${timeGreeting.toLowerCase()} and welcome to`,
    `@${userData.username}, welcome aboard`,
    `@${userData.username} has joined! Welcome to`,
    `Everyone welcome @${userData.username} to`,
    `A warm welcome to @${userData.username} in`
  ];
  
  const welcomeEmojis = ['👋', '🎉', '🌟', '✨', '💫', '🎊', '🤗', '☺️', '😊', '💐'];
  const randomEmoji = welcomeEmojis[Math.floor(Math.random() * welcomeEmojis.length)];
  const randomPhrase = welcomePhrases[Math.floor(Math.random() * welcomePhrases.length)];
  
  const welcomeMessage = `${randomPhrase} ${chatroomData.name}! ${randomEmoji}\nYou're member #${memberCount}!`;

  const { error: messageError } = await supabase.from('messages').insert([
    {
      user_id: botData.id,
      content: welcomeMessage,
      chatroom_id,
    },
  ]);

  if (messageError) {
    return res.status(500).json({ error: messageError.message });
  }

  res.json({ message: 'Welcome message sent' });
};
