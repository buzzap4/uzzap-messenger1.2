import React, { useState, useEffect, useCallback, useRef } from 'react'; 
import { StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native'; 
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';
import ChatMessage from '@/components/ChatMessage';
import MessageInput from '@/components/MessageInput';
import { FlashList } from '@shopify/flash-list';
import { DirectMessage } from '@/src/types/models';

export default function DirectMessageScreen() {
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const flatListRef = useRef(null);

  // Add effect to fetch other user's ID
  useEffect(() => {
    const fetchOtherUser = async () => {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('user1_id, user2_id')
          .eq('id', id)
          .single();

        if (error) throw error;

        const otherId = data.user1_id === session?.user?.id ? data.user2_id : data.user1_id;
        setOtherUserId(otherId);
      } catch (error) {
        console.error('Error fetching conversation:', error);
      }
    };

    if (session?.user?.id) {
      fetchOtherUser();
    }
  }, [id, session?.user?.id]);

  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          *,
          sender:profiles!sender_id(*),
          receiver:profiles!receiver_id(*)
        `)
        .eq('conversation_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [id]);

  const subscribeToMessages = useCallback(() => {
    const subscription = supabase
      .channel('direct_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `conversation_id=eq.${id}`,
        },
        (payload) => {
          const newMessage = payload.new as DirectMessage;
          setMessages((current) => [newMessage, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id]);

  useEffect(() => {
    fetchMessages();
    const subscription = subscribeToMessages();
    return subscription;
  }, [fetchMessages, subscribeToMessages]);

  const handleSend = async (content: string) => {
    try {
      if (!session?.user?.id || !otherUserId) {
        Alert.alert('Error', 'Unable to send message');
        return;
      }

      // First verify conversation exists and user is part of it
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .select('id')
        .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
        .eq('id', id)
        .single();

      if (conversationError || !conversation) {
        Alert.alert('Error', 'Invalid conversation');
        return;
      }

      const { data: message, error: messageError } = await supabase
        .from('direct_messages')
        .insert({
          conversation_id: id,
          content,
          sender_id: session.user.id,
          receiver_id: otherUserId,
        })
        .select(`
          *,
          sender:profiles!sender_id(*),
          receiver:profiles!receiver_id(*)
        `)
        .single();

      if (messageError) {
        console.error('Message error:', messageError);
        throw messageError;
      }

      setMessages(current => [message, ...current]);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };
  
  const renderItem = ({ item }: { item: DirectMessage }) => {
    
    if (!item?.sender) {
      return null;
    }
    return (
      <ChatMessage
        content={item.content}
        sender={item.sender}
        timestamp={item.created_at}
        isOwnMessage={item.sender.id === session?.user.id}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlashList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        estimatedItemSize={80}
        inverted={true}
      />
      <MessageInput onSend={handleSend} />
    </KeyboardAvoidingView>
  ); 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
