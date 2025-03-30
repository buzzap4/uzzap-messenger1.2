import React, { useEffect, useRef, useCallback } from 'react';
import { FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/context/theme';
import ChatMessage from '@/components/ChatMessage';
import MessageInput from '@/components/MessageInput';
import { useProfile } from '@/src/hooks/useProfile';
import { useMessages } from '@/src/hooks/useMessages';
import { Message } from '@/src/types/models';
import { verifyOrJoinChatroom } from '@/src/services/chatroomService';

// Ensure hooks are called unconditionally
export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { colors } = useTheme();
  const { profile, loading: profileLoading, fetchProfile } = useProfile();
  const { messages, loading: messagesLoading, hasMore, error: messagesError, fetchMessages, addMessage } = useMessages(id as string);
  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (id && session?.user?.id) {
      fetchProfile(session.user.id);
    }
  }, [id, session?.user?.id, fetchProfile]);

  const handleSend = async (content: string, type: 'text' | 'image' | undefined, bubbleColor?: string) => {
    if (!id || !session?.user?.id || !profile?.id) {
      Alert.alert('Error', 'Please sign in to send messages');
      return;
    }

    try {
      const { success } = await verifyOrJoinChatroom(id, session.user.id);
      if (!success) {
        Alert.alert('Error', 'Failed to verify chatroom membership');
        return;
      }

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          chatroom_id: id,
          content,
          user_id: session.user.id,
          bubble_color: bubbleColor,
        })
        .select()
        .single();

      if (messageError) throw messageError;
    } catch {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const subscribeToMessages = useCallback(() => {
    if (!id) return () => {};
    const subscription = supabase
      .channel(`chatroom:${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chatroom_id=eq.${id}` },
        async (payload) => {
          const { data: messageData, error: messageError } = await supabase
            .from('messages')
            .select('*, user:profiles(*)')
            .eq('id', payload.new.id)
            .single();

          if (messageError) {
            console.error('Error fetching message:', messageError);
            return;
          }

          const transformedMessage: Message = {
            id: messageData.id,
            content: messageData.content,
            user_id: messageData.user_id,
            chatroom_id: messageData.chatroom_id,
            created_at: messageData.created_at,
            is_edited: messageData.is_edited || false,
            is_deleted: messageData.is_deleted || false,
            bubble_color: messageData.bubble_color,
            user: Array.isArray(messageData.user) ? messageData.user[0] : messageData.user,
          };

          addMessage(transformedMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id, addMessage]);

  useEffect(() => {
    if (id) {
      fetchMessages();
      const unsubscribe = subscribeToMessages();
      return () => {
        unsubscribe();
      };
    }
  }, [id, fetchMessages, subscribeToMessages]);

  const fetchMoreMessages = async () => {
    if (!hasMore || messagesLoading) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      await fetchMessages(lastMessage.id);
      console.log("last message", lastMessage)
      messages.forEach((item) => console.log("item", item))
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <ChatMessage
      content={item.content}
      sender={item.user ?? { id: item.user_id, username: 'Unknown', avatar_url: null }}
      timestamp={item.created_at}
      isOwnMessage={item.user_id === session?.user?.id}
      bubbleColor={item.bubble_color}
    />
  );

  if (!id) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid chatroom ID</Text>
      </View>
    );
  }

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
        data={messages}
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
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});