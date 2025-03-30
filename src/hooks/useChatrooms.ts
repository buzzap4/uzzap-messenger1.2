import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase'; // Fixed import path
import { joinChatroom } from '../services/chatroomService';

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
          avatar_url: chatroom.messages[0].profiles[0].avatar_url || 'https://api.dicebear.com/7.x/initials/svg?background=0D8ABC&bold=true'
        } : undefined
      } : undefined
    }));
  };

  const fetchChatrooms = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session');
        return;
      }

      const { data, error } = await supabase
        .from('chatroom_memberships')
        .select(`
          chatroom:chatrooms (
            id,
            name,
            province_id,
            messages (
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
            )
          )`).order('created_at', { ascending: false, foreignTable: 'chatroom.messages' })
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false, foreignTable: 'chatroom.messages' })
        .limit(1, { foreignTable: 'messages' });

      if (error) throw error;

      const transformedData = data?.map(item => item.chatroom) || [];
      setChatrooms(transformChatrooms(transformedData));
    } catch (error) {
      console.error('Error fetching chatrooms:', error);
      setChatrooms([]);
    }
  }, []);

  const handleJoinChatroom = async (chatroomId: string) => {
    const result = await joinChatroom(chatroomId);
    if (!result.error) {
      await fetchChatrooms();
    }
    return result;
  };

  useEffect(() => {
    fetchChatrooms();
  }, [fetchChatrooms]);

  return { chatrooms, fetchChatrooms, joinChatroom: handleJoinChatroom };
};
