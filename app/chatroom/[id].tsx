import React, { useEffect, useState, useRef } from 'react';
import { FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/context/theme';
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

interface DatabaseMessage {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
  }[];  // Change this to an array type
}

const createProfileIfNotExists = async (userId: string) => {
  try {
    // Simplified profile check
    const { data: profile, error: checkError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    if (profile) return profile;

    // Create basic profile if doesn't exist
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: `user_${userId.slice(0, 6)}`,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
      })
      .select()
      .single();

    if (createError) throw createError;
    return newProfile;
  } catch (error) {
    console.error('Profile creation error:', error);
    return null;
  }
};

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { colors } = useTheme();
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
          user_id,
          profiles (
            id,
            username,
            avatar_url
          )
        `)
        .eq('chatroom_id', id!)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Safer transformation with null checks
      const transformedMessages = (data as DatabaseMessage[] || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        profiles: msg.profiles ? {
          id: msg.user_id,  // Use user_id directly instead of profiles array
          username: msg.profiles[0]?.username || 'Unknown User',
          avatar_url: msg.profiles[0]?.avatar_url || null
        } : {
          id: msg.user_id,
          username: 'Unknown User',
          avatar_url: null
        }
      }));
      
      setMessages(transformedMessages);
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
          filter: `chatroom_id=eq.${id!}`,
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
    if (!session) {
        Alert.alert('Error', 'Please sign in to send messages');
        return;
      }
    if(session){
    try {
        // Create or get profile first
        const profile = await createProfileIfNotExists(session.user.id);
        if (!profile) {
          Alert.alert('Error', 'Unable to create profile');
          return;
        }

        // Then send message
        const { data: message, error: messageError } = await supabase
          .from('messages')
          .insert({
            chatroom_id: id,
            content,
            user_id: session.user.id
          })
          .select('id, content, created_at')
          .single();

        if (messageError) throw messageError;

        // Construct message with profile data we already have
        const newMessage = {
          id: message.id,
          content: message.content,
          created_at: message.created_at,
          profiles: {
            id: profile.id,
            username: profile.username,
            avatar_url: profile.avatar_url
          }
        };

        setMessages(current => [newMessage, ...current]);
      } catch (error) {
        console.error('Error sending message:', error);
        Alert.alert('Error', 'Failed to send message');
      }
    };
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
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
  },
  messageList: {
    paddingVertical: 16,
  },
});