import React, { useState, useEffect, useCallback, useRef } from 'react'; 
import { StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native'; 
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';
import ChatMessage from '@/components/ChatMessage';
import MessageInput from '@/components/MessageInput';
import { FlashList } from '@shopify/flash-list';
import { DirectMessage } from '@/types';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  conversation_id?: string; // Add conversation_id
  is_read?: boolean; // Add is_read
  read_at?: string | null; // Add read_at
  sender?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  receiver?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export default function DirectMessageScreen() {
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef(null);
  
  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          *,
          sender:profiles!sender_id (
            id,
            username,
            avatar_url
          ),
          receiver:profiles!receiver_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('conversation_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedMessages = data?.map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        is_read: msg.is_read,
        read_at: msg.read_at,
        sender: msg.sender,
        receiver: msg.receiver
      }));

      setMessages(transformedMessages || []);
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
          const newMessage = payload.new as Message;
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
      if (!session?.user?.id) {
        Alert.alert('Error', 'Please sign in to send messages');
        return;
      }

      const { data: message, error: messageError } = await supabase
        .from('direct_messages')
        .insert({
          conversation_id: id,
          content,
          sender_id: session.user.id,
          is_read: false, // Default to false
        })
        .select(`
          id, 
          content, 
          created_at,
          sender_id,
          receiver_id,
          is_read,
          read_at,
          sender:profiles!sender_id (
            id,
            username,
            avatar_url
          ),
          receiver:profiles!receiver_id (
            id,
            username,
            avatar_url
          )
        `)
        .single();

      if (messageError) throw messageError;

      const newMessage: Message = {
        id: message.id,
        content: message.content,
        created_at: message.created_at,
        sender_id: message.sender_id,
        receiver_id: message.receiver_id,
        is_read: message.is_read,
        read_at: message.read_at,
        sender: Array.isArray(message.sender) ? message.sender[0] : message.sender, // Ensure sender is a single object
        receiver: Array.isArray(message.receiver) ? message.receiver[0] : message.receiver // Ensure receiver is a single object
      };

      setMessages(current => [newMessage, ...current]);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };
  
  const renderItem = ({ item }: { item: Message }) => {
    
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
