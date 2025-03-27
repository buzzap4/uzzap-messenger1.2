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
    sender?: {
      id: string;
      username: string;
      avatar_url: string | null;
    };
  }

export default function DirectMessageScreen() {
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const flatListRef = useRef(null);
  
  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select(
          `
            id,
            content,
            created_at,
            sender:profiles(id, username, avatar_url)
          `
        )
        .match({ conversation_id: id })
        .order('created_at', { ascending: false })
        .limit(50);
        
        if (error) throw error;
        if (data) {
          const transformedMessages = data.map((message: any) => ({
            ...message,
            sender: message.sender[0],
          }));
        setMessages(transformedMessages

        );
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
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
              setMessages((current) => [payload.new as DirectMessage, ...current]);
          }
        )
      
      return () => {
        supabase.removeChannel(subscription)
        subscription.unsubscribe();
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
        })
        .select(`id, content, created_at, sender:profiles(id, username, avatar_url)`)
        .single();
  
      if (messageError) throw messageError;
      setMessages((current) => {
            return [message, ...current]
          });
    
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
