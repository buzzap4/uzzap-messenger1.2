import React, { useState, useEffect, useCallback, useRef } from 'react'; 
import { StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native'; 
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/context/theme'; // Add this import
import ChatMessage from '@/components/ChatMessage';
import MessageInput from '@/components/MessageInput';
import { FlashList } from '@shopify/flash-list';
import { DirectMessage } from '@/src/types/models';
import { sendPushNotification } from '@/src/services/notificationService';
import { RealtimeChannel } from '@supabase/supabase-js'; // Add this import

export default function DirectMessageScreen() {
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const { colors } = useTheme(); // Add this line
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
    if (!id) return () => {};

    const channelId = `direct-message:${id}`;
    const channel = supabase.channel(channelId);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
          filter: `conversation_id=eq.${id}`
        },
        async (payload: { new: any; old: any; }) => {
          // Ensure payload.new exists and has required properties
          if (!payload.new || typeof payload.new.sender_id === 'undefined') {
            return;
          }

          // Skip if message is from current user
          if (payload.new.sender_id === session?.user?.id) {
            return;
          }

          try {
            const { data: messageData } = await supabase
              .from('direct_messages')
              .select(`
                *,
                sender:profiles!sender_id(*),
                receiver:profiles!receiver_id(*)
              `)
              .eq('id', payload.new.id)
              .single();

            if (messageData) {
              setMessages(current => [messageData, ...current]);
            }
          } catch (error) {
            console.error('Error fetching message details:', error);
          }
        }
      )
      .subscribe(status => {
        if (status !== 'SUBSCRIBED') {
          console.error('Failed to subscribe to direct messages');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, session?.user?.id]);

  useEffect(() => {
    if (!id) return;
    
    fetchMessages();
    const unsubscribe = subscribeToMessages();
    
    return () => {
      unsubscribe();
    };
  }, [id, fetchMessages, subscribeToMessages]);

  const handleSend = async (content: string, type?: 'text' | 'image', bubbleColor?: string) => {
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
          bubble_color: bubbleColor // Add bubble color here
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

      // Get receiver's push token
      const { data: receiverProfile } = await supabase
        .from('profiles')
        .select('push_token, username, notifications_enabled')
        .eq('id', otherUserId)
        .single();

      if (receiverProfile?.push_token && receiverProfile.notifications_enabled) {
        await sendPushNotification(
          receiverProfile.push_token,
          `Message from ${session?.user?.user_metadata?.username || 'Someone'}`,
          content
        );
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
        bubbleColor={item.bubble_color} // Add this line to pass the bubble color
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]} // Add theme background color
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
    // Remove the hardcoded backgroundColor here since we're setting it dynamically
  },
});
