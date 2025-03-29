import { supabase } from '../../lib/supabase';

export const sendMessage = async (content: string, chatroom_id: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    // First check/create membership
    await supabase
      .from('chatroom_memberships')
      .upsert({ 
        chatroom_id, 
        user_id: session.user.id 
      });

    const { data, error } = await supabase
      .from('messages')
      .insert({
        content,
        chatroom_id,
        user_id: session.user.id,
      })
      .select(`
        id,
        content,
        created_at,
        is_edited,
        is_deleted,
        user:profiles!messages_user_id_fkey (*)
      `)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error sending message:', error);
    return { data: null, error };
  }
};

export const fetchMessages = async (chatroom_id: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        is_edited,
        is_deleted,
        user:profiles!messages_user_id_fkey (
          id,
          username,
          avatar_url,
          display_name,
          status_message,
          role,
          created_at,
          updated_at
        )
      `)
      .eq('chatroom_id', chatroom_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { data: null, error };
  }
};
