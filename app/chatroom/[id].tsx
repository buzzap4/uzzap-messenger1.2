import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/context/theme';
import { useProfile } from '@/src/hooks/useProfile';
import { useMessages } from '@/src/hooks/useMessages'; // Add this import
import { Message } from '@/src/types/models';
import ChatMessage from '@/components/ChatMessage';
import MessageInput from '@/components/MessageInput';
import { verifyOrJoinChatroom } from '@/src/services/chatroomService';
import { RefreshControl } from '@/components/RefreshControl';
import { useRefresh } from '@/hooks/useRefresh';
import { RealtimeChannel } from '@supabase/supabase-js';

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { colors } = useTheme();
  const { profile, loading: profileLoading, fetchProfile } = useProfile();
  const { messages, loading: messagesLoading, hasMore, error: messagesError, refresh: fetchMessages, addMessage } = useMessages(id as string);
  const flatListRef = useRef<FlatList<Message>>(null);

  const { refreshing, handleRefresh } = useRefresh(async () => {
    await Promise.all([
      fetchProfile(session?.user?.id || ''),
      fetchMessages()
    ]);
  });

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

      // Add immediate optimistic update with a temporary ID
      const tempId = 'temp-' + Date.now();
      const optimisticMessage: Message = {
        id: tempId,
        content,
        user_id: session.user.id,
        chatroom_id: id,
        created_at: new Date().toISOString(),
        is_edited: false,
        is_deleted: false,
        bubble_color: bubbleColor,
        user: profile
      };

      // Add the message optimistically
      addMessage(optimisticMessage);

      const { data: newMessage, error: messageError } = await supabase
        .from('messages')
        .insert({
          chatroom_id: id,
          content,
          user_id: session.user.id,
          bubble_color: bubbleColor,
        })
        .select(`
          *,
          profiles:profiles!messages_user_id_fkey (*)
        `)
        .single();

      if (messageError) throw messageError;

      // Skip optimistic update since we already have it
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const subscribeToMessages = useCallback(() => {
    if (!id) return () => {};
    
    const channelId = `chatroom:${id}`;
    const channel = supabase.channel(channelId);
    
    channel
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages',
          filter: `chatroom_id=eq.${id}`
        },
        async (payload: { new: any; old: any; }) => {
          // Ensure payload.new exists and has required properties
          if (!payload.new || typeof payload.new.user_id === 'undefined') {
            return;
          }

          // Skip if message is from current user
          if (payload.new.user_id === session?.user?.id) {
            return;
          }

          try {
            const { data: messageData } = await supabase
              .from('messages')
              .select(`*, profiles:profiles!messages_user_id_fkey (*)`)
              .eq('id', payload.new.id)
              .single();

            if (messageData) {
              const transformedMessage: Message = {
                id: messageData.id,
                content: messageData.content,
                user_id: messageData.user_id,
                chatroom_id: messageData.chatroom_id,
                created_at: messageData.created_at,
                is_edited: messageData.is_edited || false,
                is_deleted: messageData.is_deleted || false,
                bubble_color: messageData.bubble_color,
                user: messageData.profiles
              };
              addMessage(transformedMessage);
            }
          } catch (error) {
            console.error('Error fetching message details:', error);
          }
        }
      )
      .subscribe(status => {
        if (status !== 'SUBSCRIBED') {
          console.error('Failed to subscribe to messages');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, session?.user?.id, addMessage]);

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
      await fetchMessages();
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={Platform.OS === 'web' ? [...messages].reverse() : messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={fetchMoreMessages}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator /> : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        inverted={Platform.OS !== 'web'}
        style={Platform.OS === 'web' ? styles.webList : undefined}
        contentContainerStyle={Platform.OS === 'web' ? styles.webListContent : undefined}
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
  webList: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  webListContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  }
});