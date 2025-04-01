import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, Alert, Modal, TouchableOpacity } from 'react-native';
import { GiftedChat, IMessage, Bubble, InputToolbar, Send, Actions, Composer } from 'react-native-gifted-chat';
import { MaterialIcons } from '@expo/vector-icons';
import EmojiSelector from 'react-native-emoji-selector';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/context/theme';
import { useProfile } from '@/src/hooks/useProfile';
import { useMessages } from '@/src/hooks/useMessages';
import { verifyOrJoinChatroom } from '@/src/services/chatroomService';
import { Message as DatabaseMessage, User } from '@/src/types/models';
import { ChatMessage } from '@/src/types/chat';
import TypingIndicator from '@/components/TypingIndicator';

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { colors } = useTheme();
  const { profile, loading: profileLoading, fetchProfile } = useProfile();
  const { messages, loading: messagesLoading, hasMore, error: messagesError, refresh: fetchMessages, addMessage } = useMessages(id as string);

  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [currentBubbleColor, setCurrentBubbleColor] = useState(colors.primary);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const bubbleColors = [
    colors.primary,
    '#FF69B4', // pink
    '#4169E1', // royal blue
    '#32CD32', // lime green
    '#FF8C00', // dark orange
    '#8A2BE2', // blue violet
  ];

  useEffect(() => {
    if (id && session?.user?.id) {
      fetchProfile(session.user.id);
    }
  }, [id, session?.user?.id, fetchProfile]);

  useEffect(() => {
    const typingChannel = supabase.channel(`typing:${id}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== session?.user?.id) {
          setTypingUsers(prev => new Set(prev).add(payload.userId));
          // Clear typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(payload.userId);
              return newSet;
            });
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [id, session?.user?.id]);

  const getFallbackAvatar = (userId: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&backgroundColor=random`;
  };

  const handleSendMessage = async (content: string, type: 'text' | 'image' = 'text', bubbleColor?: string) => {
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

      const tempId = 'temp-' + Date.now();
      const optimisticMessage: DatabaseMessage = {
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
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleSend = async (messages: IMessage[]) => {
    const [message] = messages;
    await handleSendMessage(message.text, 'text', currentBubbleColor);
  };

  const transformToGiftedMessage = (message: DatabaseMessage): ChatMessage => {
    const messageUser = message.user || {
      id: message.user_id,
      username: 'Unknown',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return {
      _id: message.id,
      text: message.content,
      createdAt: new Date(message.created_at),
      user: {
        _id: messageUser.id,
        name: messageUser.username,
        avatar: messageUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${messageUser.id}`
      },
      bubble_color: message.bubble_color
    };
  };

  const onSend = useCallback(async (messages: IMessage[]) => {
    await handleSend(messages);
  }, [handleSend]);

  const handleInputTextChanged = (text: string) => {
    setComposerText(text);
    
    if (!isTyping) {
      setIsTyping(true);
      supabase.channel(`typing:${id}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: session?.user?.id }
      });
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

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
      containerStyle={styles.actionButton}
      icon={() => (
        <MaterialIcons name="emoji-emotions" size={24} color={colors.text} />
      )}
      onPressActionButton={() => setIsEmojiPickerVisible(true)}
    />
  );

  const renderComposer = (props: any) => (
    <Composer
      {...props}
      textInputStyle={[styles.composer, { color: colors.text, backgroundColor: colors.surface }]}
    />
  );

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={[styles.inputToolbar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
      primaryStyle={{ alignItems: 'center' }}
      renderActions={renderActions}
      renderComposer={renderComposer}
    />
  );

  const renderSend = (props: any) => (
    <View style={styles.sendContainer}>
      <TouchableOpacity 
        style={[styles.colorButton, { backgroundColor: currentBubbleColor }]}
        onPress={() => setIsColorPickerVisible(true)}
      >
        <MaterialIcons name="color-lens" size={20} color="#fff" />
      </TouchableOpacity>
      <Send
        {...props}
        containerStyle={styles.sendButton}
      />
    </View>
  );

  const fetchMoreMessages = async () => {
    if (!hasMore || messagesLoading) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      await fetchMessages();
    }
  };

  if (!id || messagesError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          {!id ? 'Invalid chatroom ID' : messagesError}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <GiftedChat
        messages={messages.map(transformToGiftedMessage)}
        onSend={onSend}
        user={{
          _id: session?.user?.id || '',
          name: profile?.username || 'Me',
          avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.id}`
        }}
        text={composerText}
        onInputTextChanged={handleInputTextChanged}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        showAvatarForEveryMessage={true}
        renderAvatarOnTop={true}
        showUserAvatar={true}
        alwaysShowSend
        scrollToBottomComponent={() => null}
        inverted={true}
        infiniteScroll
        isLoadingEarlier={messagesLoading}
        onLoadEarlier={fetchMoreMessages}
        loadEarlier={hasMore}
        renderUsernameOnMessage={true}
        renderFooter={() => typingUsers.size > 0 ? <TypingIndicator /> : null}
      />
      <Modal
        visible={isEmojiPickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsEmojiPickerVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setIsEmojiPickerVisible(false)}
        >
          <View style={styles.emojiPickerContainer}>
            <EmojiSelector
              onEmojiSelected={(emoji) => {
                setComposerText(prev => prev + emoji);
                setIsEmojiPickerVisible(false);
              }}
              showSearchBar={false}
              columns={8}
              showHistory={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal
        visible={isColorPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsColorPickerVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setIsColorPickerVisible(false)}
        >
          <View style={styles.colorPickerContainer}>
            <View style={styles.colorGrid}>
              {bubbleColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    currentBubbleColor === color && styles.selectedColor
                  ]}
                  onPress={() => {
                    setCurrentBubbleColor(color);
                    setIsColorPickerVisible(false);
                  }}
                />
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  actionButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginRight: 4,
    marginBottom: 0,
  },
  composer: {
    borderRadius: 20,
    paddingHorizontal: 12,
    marginLeft: 0,
    marginRight: 5,
    marginBottom: 5,
    minHeight: 40,
  },
  inputToolbar: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  emojiPickerContainer: {
    backgroundColor: 'white',
    height: '40%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  colorPickerContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 80,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#000',
    transform: [{ scale: 1.1 }],
  },
  sendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
});