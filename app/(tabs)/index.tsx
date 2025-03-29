import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import Avatar from '@/components/Avatar';
import { useTheme } from '@/context/theme';

interface ChatroomWithMessages {
  id: string;
  name: string;
  lastMessage: {
    content: string;
    created_at: string;
    sender: {
      username: string;
      avatar_url: string | null;
    }
  } | null;
}

export default function ChatsScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [chatrooms, setChatrooms] = useState<ChatroomWithMessages[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchChatrooms();
  }, []);

  const fetchChatrooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chatrooms')
        .select(`
          id,
          name,
          messages:messages(
            content,
            created_at,
            sender:profiles(
              username,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(1, { foreignTable: 'messages' });

      if (error) throw error;

      const transformedData: ChatroomWithMessages[] = data.map(room => ({
        id: room.id,
        name: room.name,
        lastMessage: room.messages?.[0] ? {
          content: room.messages[0].content,
          created_at: room.messages[0].created_at,
          sender: room.messages[0].sender[0] // Ensure sender is a single object
        } : null
      }));

      setChatrooms(transformedData);
    } catch (err) {
      console.error('Error fetching chatrooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: ChatroomWithMessages }) => (
    <TouchableOpacity
      style={[styles.chatItem, { backgroundColor: colors.surface }]}
      onPress={() => router.push(`/chatroom/${item.id}`)}
    >
      <Avatar
        uri={item.lastMessage?.sender?.avatar_url}
        username={item.lastMessage?.sender?.username || 'Unknown'}
        size={50}
        style={styles.avatar}
      />
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={[styles.chatName, { color: colors.text }]}>{item.name}</Text>
          <Text style={styles.timestamp}>
            {item.lastMessage ? new Date(item.lastMessage.created_at).toLocaleString() : ''}
          </Text>
        </View>
        <View style={styles.messageRow}>
          <Text style={[styles.lastMessage, { color: colors.gray }]} numberOfLines={1}>
            {item.lastMessage?.content || 'No messages yet'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading chats...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { 
        borderBottomColor: colors.border,
        backgroundColor: colors.surface 
      }]}>
        <Text style={[styles.title, { color: colors.text }]}>Chats</Text>
      </View>
      <FlatList
        data={chatrooms}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});