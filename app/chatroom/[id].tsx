import React, { useEffect, useState, useRef } from 'react';
import { FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';
import ChatMessage from '@/components/ChatMessage';
import MessageInput from '@/components/MessageInput';

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  profiles: Profile;
}

const transformMessages = (data: any[]): Message[] => {
  return data.map(msg => ({
    id: msg.id,
    content: msg.content,
    created_at: msg.created_at,
    profiles: {
      id: msg.profiles[0]?.id || '',
      username: msg.profiles[0]?.username || '',
      avatar_url: msg.profiles[0]?.avatar_url || null
    }
  }));
};

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
  }, [id]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          profiles (
            id,
            username,
            avatar_url
          )
        `)
        .eq('chatroom_id', id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMessages(transformMessages(data || []));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chatroom_id=eq.${id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((current) => [newMessage, ...current]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleSend = async (content: string) => {
    try {
      const { error } = await supabase.from('messages').insert([
        {
          chatroom_id: id,
          content,
          user_id: session?.user.id,
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        inverted
        renderItem={({ item }) => (
          <ChatMessage
            content={item.content}
            sender={item.profiles}
            timestamp={item.created_at}
            isOwnMessage={item.profiles.id === session?.user.id}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
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
  messageList: {
    paddingVertical: 16,
  },
});