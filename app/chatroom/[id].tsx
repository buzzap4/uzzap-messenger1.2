import React, { useEffect, useRef, useCallback, useState } from 'react';
import { FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/context/theme';
import ChatMessage from '@/components/ChatMessage';
import MessageInput from '@/components/MessageInput';
import { useProfile } from '@/src/hooks/useProfile';
import { useMessages } from '@/src/hooks/useMessages';
import { Message, User } from '@/src/types/models';
import { verifyOrJoinChatroom } from '@/src/services/chatroomService';

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Add error handling for missing ID
  if (!id) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid chatroom ID</Text>
      </View>
    );
  }

  const { session } = useAuth();
  const { colors } = useTheme();
  const { profile, loading: profileLoading, fetchProfile } = useProfile();
  const { messages, loading: messagesLoading, hasMore, error: messagesError, fetchMessages } = useMessages(id as string);
  const [localMessages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile(session.user.id);
    }
  }, [session?.user?.id, fetchProfile]);

  // Sync localMessages with messages from useMessages hook
  useEffect(() => {
    setMessages(messages);
  }, [messages]);

  const handleSend = async (content: string, type: 'text' | 'image' | undefined, bubbleColor?: string) => {
    if (!session?.user?.id || !profile?.id) {
      Alert.alert('Error', 'Please sign in to send messages');
      return;
    }
    
    try {
      const { success, error: membershipError } = await verifyOrJoinChatroom(id, session.user.id);

      if (!success) {
        Alert.alert('Error', 'Failed to verify chatroom membership');
        return;
      }

      const { data: newMessage, error: messageError } = await supabase
        .from('messages')
        .insert({
          chatroom_id: id,
          content,
          user_id: session.user.id,
          bubble_color: bubbleColor // Add the bubble color to the message
        })
        .select(`
          id,
          content,
          user_id,
          chatroom_id,
          created_at,
          is_edited,
          is_deleted,
          bubble_color,
          user:profiles!messages_user_id_fkey (*)
        `)
        .single();

      if (messageError) {
        console.error('Message error:', messageError);
        Alert.alert('Error', 'Failed to send message');
        return;
      }

      // Immediately update local state with the new message
      const transformedMessage: Message = {
        ...newMessage,
        user: {
          id: profile.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          display_name: profile.display_name,
          status_message: profile.status_message,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          role: profile.role
        }
      };

      setMessages(currentMessages => [transformedMessage, ...currentMessages]);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  // Update subscription handler
  const subscribeToMessages = useCallback(() => {
    const subscription = supabase
      .channel(`chatroom:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chatroom_id=eq.${id}`,
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          // Fetch complete message data including bubble_color
          const { data: messageData, error: messageError } = await supabase
            .from('messages')
            .select(`
              id,
              content,
              created_at,
              user_id,
              chatroom_id,
              is_edited,
              is_deleted,
              bubble_color,
              user:profiles(*)
            `)
            .eq('id', newMessage.id)
            .single();

          if (messageError) {
            console.error('Error fetching message:', messageError);
            return;
          }

          const userData = messageData.user?.[0];
          const transformedMessage: Message = {
            ...messageData,
            is_edited: messageData.is_edited || false,
            is_deleted: messageData.is_deleted || false,
            user: {
              id: userData?.id || messageData.user_id,
              username: userData?.username || 'Unknown',
              avatar_url: userData?.avatar_url || null,
              display_name: userData?.display_name || null,
              status_message: userData?.status_message || null,
              created_at: userData?.created_at || messageData.created_at,
              updated_at: userData?.updated_at || messageData.created_at,
              role: userData?.role || 'user'
            }
          };

          setMessages(currentMessages => {
            const messageExists = currentMessages.some(msg => msg.id === transformedMessage.id);
            if (!messageExists) {
              return [transformedMessage, ...currentMessages];
            }
            return currentMessages;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id]);

  useEffect(() => {
    fetchMessages();
    const unsubscribe = subscribeToMessages();
    return () => {
      unsubscribe();
    };
  }, [fetchMessages, subscribeToMessages]);

  const fetchMoreMessages = async () => {
    if (!hasMore || messagesLoading) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      await fetchMessages(lastMessage.id);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <ChatMessage
      content={item.content}
      sender={item.user ?? { 
        id: item.user_id,
        username: 'Unknown',
        avatar_url: null
      }}
      timestamp={item.created_at}
      isOwnMessage={item.user_id === session?.user?.id}
      bubbleColor={item.bubble_color}
    />
  );

  if (messagesError) {
    return <Text style={styles.errorText}>{messagesError}</Text>;
  }

  const loading = profileLoading || messagesLoading;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={localMessages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={fetchMoreMessages}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator /> : null}
        inverted
      />
      <MessageInput onSend={handleSend} disabled={!profile || loading} />
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
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 10,
    marginVertical: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
    padding: 10,
    marginVertical: 4,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});