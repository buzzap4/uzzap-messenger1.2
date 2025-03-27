import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Message {
  id: string;
  content: string;
  userId: string;
  chatroomId: string;
  created_at: string;
  user?: {
    username: string;
    avatar_url: string | null;
  };
}

export const useMessages = (chatroomId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const transformMessages = (data: any[]): Message[] => {
    if (!data || !Array.isArray(data)) return [];
    return data.filter(message => message != null).map(message => ({
      id: message.id || '',
      content: message.content || '',
      userId: message.user_id || '',
      chatroomId: message.chatroom_id || '',
      created_at: message.created_at || new Date().toISOString(),
      user: message.profiles ? {
        username: message.profiles.username || '',
        avatar_url: message.profiles.avatar_url || null
      } : undefined
    }));
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles (username, avatar_url)
        `)
        .eq('chatroom_id', chatroomId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }
      
      setMessages(transformMessages(data || []));
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (chatroomId) {
      fetchMessages();
    }
  }, [chatroomId]);

  return { messages, fetchMessages };
};
