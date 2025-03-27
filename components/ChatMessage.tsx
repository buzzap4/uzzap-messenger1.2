import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  content: string;
  sender: {
    username: string;
    avatar_url: string | null;
  };
  timestamp: string;
  isOwnMessage: boolean;
}

export default function ChatMessage({ content, sender, timestamp, isOwnMessage }: ChatMessageProps) {
  return (
    <View style={[styles.container, isOwnMessage && styles.ownMessageContainer]}>
      {!isOwnMessage && (
        <Image
          source={{
            uri: sender.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
          }}
          style={styles.avatar}
        />
      )}
      <View style={[styles.messageContent, isOwnMessage && styles.ownMessageContent]}>
        {!isOwnMessage && (
          <Text style={styles.username}>{sender.username}</Text>
        )}
        <View style={[styles.bubble, isOwnMessage && styles.ownBubble]}>
          <Text style={[styles.text, isOwnMessage && styles.ownText]}>{content}</Text>
        </View>
        <Text style={[styles.timestamp, isOwnMessage && styles.ownTimestamp]}>
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </Text>
      </View>
    </View>
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
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
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
  },
  bubble: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 4,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 4,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  ownText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    marginLeft: 4,
  },
  ownTimestamp: {
    textAlign: 'right',
    marginRight: 4,
  },
});