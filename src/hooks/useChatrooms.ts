import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Chatroom {
  id: string;
  name: string;
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
      lastMessage: chatroom.messages?.[0] ? {
        content: chatroom.messages[0].content || '',
        created_at: chatroom.messages[0].created_at || new Date().toISOString(),
        user: chatroom.messages[0].profiles ? {
          username: chatroom.messages[0].profiles.username || '',
          avatar_url: chatroom.messages[0].profiles.avatar_url || null
        } : undefined
      } : undefined
    }));
  };

  const fetchChatrooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chatrooms')
        .select(`
          *,
          messages (
            content,
            created_at,
            profiles (
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
  };

  useEffect(() => {
    fetchChatrooms();
  }, []);

  return { chatrooms, fetchChatrooms };
};
