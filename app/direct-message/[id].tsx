import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, Alert, Modal, TouchableOpacity, View } from 'react-native';
import { GiftedChat, IMessage, Send, Bubble, InputToolbar, Actions, Composer } from 'react-native-gifted-chat';
import { MaterialIcons } from '@expo/vector-icons';
import EmojiSelector from 'react-native-emoji-selector';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/context/theme';
import { sendPushNotification } from '@/src/services/notificationService';
import { DirectMessage } from '@/src/types/models';
import { ChatMessage } from '@/src/types/chat';

export default function DirectMessageScreen() {
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const { colors } = useTheme();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [currentBubbleColor, setCurrentBubbleColor] = useState(colors.primary);

  const bubbleColors = [
    colors.primary,
    '#FF69B4', // pink
    '#4169E1', // royal blue
    '#32CD32', // lime green
    '#FF8C00', // dark orange
    '#8A2BE2', // blue violet
  ];

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
        async (payload: { new: any; old: any }) => {
          if (!payload.new || typeof payload.new.sender_id === 'undefined') {
            return;
          }

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

  const handleSendMessage = async (content: string, type?: 'text' | 'image', bubbleColor?: string) => {
    try {
      if (!session?.user?.id || !otherUserId) {
        Alert.alert('Error', 'Unable to send message');
        return;
      }

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
          bubble_color: bubbleColor
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

  const transformToGiftedMessage = (message: DirectMessage): ChatMessage => {
    return {
      _id: message.id,
      text: message.content,
      createdAt: new Date(message.created_at),
      user: {
        _id: message.sender.id,
        name: message.sender.username,
        avatar: message.sender.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender.id}`
      },
      bubble_color: message.bubble_color
    };
  };

  const onSend = useCallback(async (messages: IMessage[]) => {
    const [message] = messages;
    await handleSendMessage(message.text, 'text', currentBubbleColor);
  }, [handleSendMessage, currentBubbleColor]);

  const renderBubble = (props: any) => {
    const currentMessage = props.currentMessage as IMessage & { bubble_color?: string };
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: currentMessage?.bubble_color || colors.primary
          },
          left: {
            backgroundColor: colors.surface
          }
        }}
        textStyle={{
          right: {
            color: '#fff'
          },
          left: {
            color: colors.text
          }
        }}
      />
    );
  };

  const renderActions = (props: any) => (
    <Actions
      {...props}
      containerStyle={{
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
        marginRight: 4,
        marginBottom: 0,
      }}
      icon={() => (
        <MaterialIcons name="emoji-emotions" size={24} color={colors.text} />
      )}
      onPressActionButton={() => setIsEmojiPickerVisible(true)}
    />
  );

  const renderComposer = (props: any) => (
    <Composer
      {...props}
      textInputStyle={{
        color: colors.text,
        backgroundColor: colors.surface,
        borderRadius: 20,
        paddingHorizontal: 12,
        marginLeft: 0,
      }}
    />
  );

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        padding: 8,
      }}
      primaryStyle={{ alignItems: 'center' }}
      renderActions={renderActions}
      renderComposer={renderComposer}
    />
  );

  const renderSend = (props: any) => (
    <Send
      {...props}
      containerStyle={{
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        marginBottom: 5
      }}
    >
      <MaterialIcons name="send" size={24} color={colors.primary} />
    </Send>
  );

  const renderBubbleColors = () => (
    <View style={styles.bubbleColorContainer}>
      {bubbleColors.map((color) => (
        <TouchableOpacity
          key={color}
          style={[styles.colorOption, { backgroundColor: color }]}
          onPress={() => setCurrentBubbleColor(color)}
        />
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <GiftedChat
        messages={messages.map(transformToGiftedMessage)}
        onSend={onSend}
        user={{
          _id: session?.user?.id || '',
          name: session?.user?.user_metadata?.username || 'Me',
          avatar: session?.user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.id}`
        }}
        text={composerText}
        onInputTextChanged={setComposerText}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        showAvatarForEveryMessage={true}
        renderAvatarOnTop={true}
        showUserAvatar={true}
        alwaysShowSend
        scrollToBottomComponent={() => null}
        inverted={true}
        renderUsernameOnMessage={true}
      />
      {renderBubbleColors()}
      <Modal
        visible={isEmojiPickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsEmojiPickerVisible(false)}
      >
        <View style={styles.emojiPickerContainer}>
          <EmojiSelector
            onEmojiSelected={(emoji) => {
              setComposerText(prev => prev + emoji);
              setIsEmojiPickerVisible(false);
            }}
            showSearchBar={false}
            columns={8}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emojiPickerContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 'auto',
    height: '50%',
  },
  bubbleColorContainer: {
    flexDirection: 'row',
    padding: 8,
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
  colorOption: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'white',
  },
});
