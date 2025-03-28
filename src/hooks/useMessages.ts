import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Message, DatabaseMessage, ApiResponse, Profile } from '@/src/types/models';

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

  const transformMessages = useCallback((data: any[]): Message[] => {
    return data?.map(message => ({
      id: message.id,
      content: message.content,
      user_id: message.user_id,
      chatroom_id: message.chatroom_id,
      created_at: message.created_at,
      is_edited: message.is_edited || false,
      is_deleted: message.is_deleted || false,
      user: message.profiles?.[0]
        ? {
            id: message.profiles[0].id,
            username: message.profiles[0].username,
            avatar_url: message.profiles[0].avatar_url,
            created_at: message.profiles[0].created_at,
            updated_at: message.profiles[0].updated_at,
            role: message.profiles[0].role || 'user',
            last_seen: message.profiles[0].last_seen,
            display_name: message.profiles[0].display_name,
            status_message: message.profiles[0].status_message
          } as Profile
        : undefined
    })) ?? [];
  }, []);

  const fetchMessages = useCallback(async (lastMessageId?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      let query = supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          user_id,
          is_edited,
          is_deleted,
          profiles!inner(
            id, 
            username, 
            avatar_url,
            created_at,
            updated_at,
            role,
            last_seen,
            display_name,
            status_message
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
      
      const transformedMessages = transformMessages(data || []);
      setState(prev => ({
        ...prev,
        messages: lastMessageId ? [...prev.messages, ...transformedMessages] : transformedMessages,
        hasMore: data?.length === PAGE_SIZE,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch messages',
        loading: false
      }));
    }
  }, [chatroomId, transformMessages]);

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
