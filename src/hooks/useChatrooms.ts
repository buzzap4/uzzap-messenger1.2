import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Chatroom {
  id: string;
  name: string;
  province_id?: string; // Add province_id
  lastMessage?: {
    content: string;
    created_at: string;
    user?: {
      username: string;
      avatar_url: string | null;
    };
  };
}

export const useChatrooms = () => {
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);

  const transformChatrooms = (data: any[]): Chatroom[] => {
    if (!data || !Array.isArray(data)) return [];
    return data.filter(chatroom => chatroom != null).map(chatroom => ({
      id: chatroom.id || '',
      name: chatroom.name || '',
      province_id: chatroom.province_id || '', // Include province_id
      lastMessage: chatroom.messages?.[0] ? {
        content: chatroom.messages[0].content || '',
        created_at: chatroom.messages[0].created_at || new Date().toISOString(),
        user: chatroom.messages[0].profiles?.[0] ? { // Ensure profiles is a single object
          username: chatroom.messages[0].profiles[0].username || 'Unknown',
          avatar_url: chatroom.messages[0].profiles[0].avatar_url || 'https://via.placeholder.com/50'
        } : undefined
      } : undefined
    }));
  };

  const fetchChatrooms = useCallback(async () => {
    try {
      // Add this check
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session');
        return;
      }

      const { data, error } = await supabase
        .from('chatrooms')
        .select(`
          id,
          name,
          province_id, // Include province_id
          messages (
            id,
            content,
            created_at,
            profiles:user_id (
              username,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false, foreignTable: 'messages' })
        .limit(1, { foreignTable: 'messages' });
      
      if (error) {
        console.error('Error fetching chatrooms:', error);
        return;
      }

      setChatrooms(transformChatrooms(data || []));
    } catch (error) {
      console.error('Error fetching chatrooms:', error);
      setChatrooms([]);
    }
  }, []);

  useEffect(() => {
    fetchChatrooms();
  }, [fetchChatrooms]);

  return { chatrooms, fetchChatrooms };
};
