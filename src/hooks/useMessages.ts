import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Message, User } from '../types/models';

const PAGE_SIZE = 20;

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

  const fetchMessages = useCallback(async (lastMessageId?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      let query = supabase
        .from('messages')
        .select(`
          id,
          content,
          user_id,
          chatroom_id,
          created_at,
          is_edited,
          is_deleted,
          bubble_color,
          user:profiles!messages_user_id_fkey (
            id,
            username,
            avatar_url,
            display_name,
            status_message,
            created_at,
            updated_at,
            role
          )
        `)
        .eq('chatroom_id', chatroomId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (lastMessageId) {
        query = query.lt('id', lastMessageId);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      const transformedMessages: Message[] = (data || []).map(message => {
        // Handle both array and single object user data
        const userData = Array.isArray(message.user) ? message.user[0] : message.user;
        const user: User = {
          id: userData?.id || message.user_id,
          username: userData?.username || 'Unknown',
          avatar_url: userData?.avatar_url || null,
          display_name: userData?.display_name || null,
          status_message: userData?.status_message || null,
          created_at: userData?.created_at || message.created_at,
          updated_at: userData?.updated_at || message.created_at,
          role: userData?.role || 'user'
        };

        return {
          id: message.id,
          content: message.content,
          user_id: message.user_id,
          chatroom_id: message.chatroom_id,
          created_at: message.created_at,
          is_edited: message.is_edited || false,
          is_deleted: message.is_deleted || false,
          bubble_color: message.bubble_color || null,
          user
        };
      });

      setState(prev => ({
        messages: lastMessageId 
          ? [...prev.messages, ...transformedMessages]
          : transformedMessages,
        hasMore: transformedMessages.length === PAGE_SIZE,
        loading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch messages',
        loading: false
      }));
    }
  }, [chatroomId]);

  useEffect(() => {
    if (chatroomId) {
      fetchMessages();
    }
  }, [chatroomId, fetchMessages]);

  return {
    ...state,
    fetchMessages
  };
};
