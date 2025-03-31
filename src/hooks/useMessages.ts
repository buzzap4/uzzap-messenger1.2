import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Message, User } from '../types/models';
<<<<<<< HEAD
console.log("test")
const PAGE_SIZE = 20;
=======

// Update the database response type to match Supabase's structure
interface MessageRow {
  id: string;
  content: string;
  created_at: string;
  is_edited: boolean;
  is_deleted: boolean;
  chatroom_id: string;
  user_id: string;
  bubble_color?: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
    display_name: string | null;
    status_message: string | null;
    role: 'user' | 'admin' | 'moderator';
    created_at: string;
    updated_at: string;
  };
}
>>>>>>> c589710 (Pre-build configuration updates)

export const useMessages = (chatroomId: string) => {
  const [state, setState] = useState<{
    messages: Message[];
    loading: boolean;
    hasMore: boolean;
    error: string | null;
  }>({
    messages: [],
    loading: false,
    hasMore: true,
    error: null
  });

  const loadMessages = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data: rawData, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          is_edited,
          is_deleted,
<<<<<<< HEAD
          user:profiles!messages_user_id_fkey (
=======
          chatroom_id,
          user_id,
          bubble_color,
          profiles!messages_user_id_fkey (
>>>>>>> c589710 (Pre-build configuration updates)
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
        .eq('chatroom_id', chatroomId)
        .order('created_at', { ascending: false })
<<<<<<< HEAD
        .limit(PAGE_SIZE);
      
      if (lastMessageId) {
        query = query.lt('id', lastMessageId);
      }

      const { data, error } = await query;
=======
        .limit(20);

>>>>>>> c589710 (Pre-build configuration updates)
      if (error) throw error;

      const messages = (rawData as unknown as MessageRow[])?.map(message => {
        const userProfile: User = {
          id: message.profiles.id,
          username: message.profiles.username,
          avatar_url: message.profiles.avatar_url,
          display_name: message.profiles.display_name || undefined, // Convert null to undefined
          status_message: message.profiles.status_message || undefined, // Convert null to undefined
          role: message.profiles.role,
          created_at: message.profiles.created_at,
          updated_at: message.profiles.updated_at
        };

        return {
          id: message.id,
          content: message.content,
          user_id: message.user_id,
          created_at: message.created_at,
          chatroom_id: message.chatroom_id,
          is_edited: message.is_edited || false,
          is_deleted: message.is_deleted || false,
<<<<<<< HEAD
          user
        };
      });

      setState(prev => ({
        messages: lastMessageId 
          ? [...prev.messages, ...transformedMessages]
          : transformedMessages, 
        hasMore: transformedMessages.length === PAGE_SIZE,
=======
          bubble_color: message.bubble_color || undefined, // Handle bubble_color properly
          user: userProfile
        } satisfies Message;
      }) || [];

      setState({
        messages,
>>>>>>> c589710 (Pre-build configuration updates)
        loading: false,
        hasMore: messages.length === 20,
        error: null
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch messages'
      }));
    }
  }, [chatroomId]);

  const addMessage = useCallback((message: Message) => {
    setState(prev => ({
      ...prev,
      messages: [message, ...prev.messages]
    }));
  }, []);

  return {
    ...state,
    refresh: loadMessages,
    addMessage
  };
};
