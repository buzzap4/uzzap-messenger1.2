import React, { useMemo } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '@/context/theme';
import { avatarCache } from '@/lib/avatarCache';
import Avatar from '@/components/Avatar';

interface ChatMessageProps {
  content: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  timestamp: string;
  isOwnMessage: boolean;
  bubbleColor?: string;
  reactions?: { emoji: string; count: number }[];
  isRead?: boolean;
  isPinned?: boolean;
}

export default function ChatMessage({ 
  content, 
  sender, 
  timestamp, 
  isOwnMessage, 
  bubbleColor,
  isRead 
}: ChatMessageProps) {
  const { colors } = useTheme();
  const avatarUrl = useMemo(() => 
    sender.avatar_url || avatarCache.getAvatarUrl(sender.id, sender.username),
    [sender]
  );

  const bubbleStyle = useMemo(() => ({
    ...styles.bubble,
    backgroundColor: bubbleColor || (isOwnMessage ? colors.messageOwn : colors.messageOther),
    borderTopLeftRadius: isOwnMessage ? 20 : 4,
    borderTopRightRadius: isOwnMessage ? 4 : 20,
  }), [bubbleColor, isOwnMessage, colors.messageOwn, colors.messageOther]);

  const textStyle = useMemo(() => ({
    ...styles.text,
    color: bubbleColor ? '#FFFFFF' : (isOwnMessage ? colors.textOwn : colors.textOther),
  }), [bubbleColor, isOwnMessage, colors.textOwn, colors.textOther]);

  return (
    <Animated.View style={[styles.container, isOwnMessage && styles.ownMessageContainer]}>
      {!isOwnMessage && (
        <Avatar
          uri={avatarUrl}
          username={sender.username}
          size={32}
          style={styles.avatar}
        />
      )}
      <Pressable
        style={[styles.messageContent, isOwnMessage && styles.ownMessageContent]}
      >
        {!isOwnMessage && (
          <Text style={styles.username}>{sender.username}</Text>
        )}
        <View style={bubbleStyle}>
          <Text style={textStyle}>{content}</Text>
          <Text style={[styles.timestamp, isOwnMessage && styles.ownTimestamp]}>
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </Text>
          {isRead && <Icon name="checkmark-done" size={16} color={colors.text} style={styles.readIcon} />}
        </View>
      </Pressable>
      {isOwnMessage && (
        <Avatar
          uri={avatarUrl}
          username={sender.username}
          size={32}
          style={[styles.avatar, styles.ownAvatar]}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  avatar: {
    marginHorizontal: 8,
  },
  ownAvatar: {
    marginLeft: 8,
  },
  messageContent: {
    maxWidth: '75%',
  },
  ownMessageContent: {
    alignItems: 'flex-end',
  },
  username: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: {
    fontSize: 16,
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
  },
  ownTimestamp: {
    textAlign: 'right',
    marginRight: 4,
  },
  pinIcon: {
    position: 'absolute',
    top: -10,
    right: 8,
  },
  readIcon: {
    marginLeft: 4,
  },
});