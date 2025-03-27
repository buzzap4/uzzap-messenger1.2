import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  status_message: string | null;
}

export const useProfile = (chatroomId: string) => {
  const [sending, setSending] = useState(false);

  const createProfileIfNotExists = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        await supabase.from('profiles').insert([
          {
            id: userId,
            username: `user_${userId.slice(0, 8)}`,
            display_name: 'New User',
            avatar_url: null,
            status_message: null
          }
        ]);
      }
    } catch (error) {
      console.error('Error checking/creating profile:', error);
      throw error;
    }
  };

  const handleSend = async (message: string) => {
    if (sending) return;
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      await createProfileIfNotExists(session.user.id);

      const { error } = await supabase
        .from('messages')
        .insert([
          {
            content: message,
            user_id: session.user.id,
            chatroom_id: chatroomId
          }
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setSending(false);
    }
  };

  return { handleSend, sending };
};
