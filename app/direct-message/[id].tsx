import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';
import ChatMessage from '@/components/ChatMessage';
import MessageInput from '@/components/MessageInput';
import { FlashList } from '@shopify/flash-list';
import { DirectMessage } from '../../types';

export function DirectMessageScreen() {
  interface Message  {
    id: string;
    content: string;
    created_at: string;
    sender?: {
        id: string;
        username: string;
        avatar_url: string | null;
    };
}
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);

  useEffect(() => {
    fetchMessages();
    const subscription = subscribeToMessages();
    return () => {
      subscription?.unsubscribe();
    };
  }, [id]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('direct_messages')
      .select(`
        id,
        content,
        created_at,
        sender:profiles(id, username, avatar_url)
      `)
      .match({ conversation_id: id })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMessages(data.map((message: any) => ({
        ...message,
        sender: message.sender[0] // Fix the sender array issue
      })));
    }
  };

  const subscribeToMessages = () => {
    return supabase
      .channel('direct_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `conversation_id=eq.${id}`,
      }, (payload) => {
        setMessages(current => [payload.new as DirectMessage, ...current]);
      })
      .subscribe();
  };

  const handleSend = async (content: string) => {
    await supabase.from('direct_messages').insert([{
      conversation_id: id,
      content,
      sender_id: session?.user.id,
    }]);
  };

  const renderItem = ({ item }: { item: Message }) => {
    if (!item.sender) {
      return null;
    }
    return (
      <ChatMessage
        content={item.content}
        sender={item.sender}
        timestamp={item.created_at}
        isOwnMessage={item.sender.id === session?.user.id}
      />);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlashList
        data={messages}
        renderItem={renderItem}
        estimatedItemSize={80}
        inverted
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

