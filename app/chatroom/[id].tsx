import React, { useEffect, useState, useRef } from 'react';
import { FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/context/theme';
import ChatMessage from '@/components/ChatMessage';
import MessageInput from '@/components/MessageInput';
import { useProfile } from '@/src/hooks/useProfile';
import { useMessages } from '@/src/hooks/useMessages';
import { Message, Profile } from '@/src/types/models';

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
  const { profile, loading: profileLoading, fetchProfile, error: profileError } = useProfile();
  const { messages, loading: messagesLoading, hasMore, error: messagesError, fetchMessages } = useMessages(id as string);
  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile(session.user.id);
    }
  }, [session?.user?.id, fetchProfile]);

  const handleSend = async (content: string) => {
    if (!session?.user?.id || !profile?.id) return;
    
    try {
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          chatroom_id: id,
          content,
          user_id: session.user.id,
        });

      if (messageError) throw messageError;
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

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