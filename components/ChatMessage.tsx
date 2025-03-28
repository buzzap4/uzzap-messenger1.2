import React, { useMemo } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, Image, StyleSheet, Animated, Pressable } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '@/context/theme';
import { avatarCache } from '@/lib/avatarCache';

interface ChatMessageProps {
  content: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  timestamp: string;
  isOwnMessage: boolean;
  reactions?: { emoji: string; count: number }[];
  isRead?: boolean;
  isPinned?: boolean;
}

export default function ChatMessage({ content, sender, timestamp, isOwnMessage, reactions, isRead, isPinned }: ChatMessageProps) {
  const { colors } = useTheme();
  const avatarUrl = useMemo(() => 
    sender.avatar_url || avatarCache.getAvatarUrl(sender.id, sender.username),
    [sender]
  );

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
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 8,
      alignSelf: 'flex-start', // Ensure the avatar aligns with the top of the message
    },
    messageContent: {
      maxWidth: '75%',
      flex: 1,
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
      backgroundColor: colors.messageOther,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopLeftRadius: 4,
    },
    ownBubble: {
      backgroundColor: colors.messageOwn,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 4,
    },
    text: {
      fontSize: 16,
      color: colors.textOther,
      marginTop: 4,
    },
    ownText: {
      color: colors.textOwn,
    },
    timestamp: {
      fontSize: 11,
      color: colors.gray,
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

  return (
    <Animated.View style={[styles.container, isOwnMessage && styles.ownMessageContainer]}>
      {!isOwnMessage && ( // Render avatar only for other users
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatar}
        />
      )}
      <Pressable
        style={[styles.messageContent, isOwnMessage && styles.ownMessageContent]}
      >
        {isPinned && <Icon name="pin" size={16} color={colors.text} style={styles.pinIcon} />}
        {!isOwnMessage && (
          <Text style={styles.username}>{sender.username}</Text>
        )}
        <View style={[styles.bubble, isOwnMessage && styles.ownBubble]}>
          <Text style={[styles.text, isOwnMessage && styles.ownText]}>{content}</Text>
        </View>
        <Text style={[styles.timestamp, isOwnMessage && styles.ownTimestamp]}>
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </Text>
        {isRead && <Icon name="check-double" size={12} color={colors.text} style={styles.readIcon} />}
      </Pressable>
    </Animated.View>
  );
}