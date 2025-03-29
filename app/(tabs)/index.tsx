import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import Avatar from '@/components/Avatar';
import { useTheme } from '@/context/theme';
import { useAuth } from '@/context/auth'; // Import useAuth
import { fetchSceneryImages } from '@/src/services/imageService'; // Update the import path
import { format } from 'date-fns'; // Add this import

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

const formatTimestamp = (timestamp: string | null): string => {
  if (!timestamp) return '';
  try {
    return format(new Date(timestamp), 'MMM d, h:mm a');
  } catch (error) {
    return '';
  }
};

export default function ChatsScreen() {
  const { colors } = useTheme();
  const { session } = useAuth(); // Access session from useAuth
  const [loading, setLoading] = useState(true);
  const [chatrooms, setChatrooms] = useState<ChatroomWithMessages[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchChatrooms();
  }, []);

  const fetchChatrooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chatroom_memberships')
        .select(`
          chatroom:chatrooms (
            id,
            name
          )
        `)
        .eq('user_id', session?.user?.id); // Filter by the current user's membership

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      const unsplashImages = await fetchSceneryImages('scenery'); // Fetch random images from Unsplash

      const transformedData = data?.map((item: any, index: number) => ({
        id: item.chatroom.id,
        name: item.chatroom.name,
        lastMessage: {
          content: 'No messages yet',
          created_at: '',
          sender: {
            username: 'Unknown',
            avatar_url: unsplashImages[index % unsplashImages.length] || null, // Use Unsplash image if avatar_url is null
          },
        },
      })) || [];

      setChatrooms(transformedData);
    } catch (err) {
      console.error('Error fetching chatrooms:', err); // Log the error object
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
            {formatTimestamp(item.lastMessage?.created_at ?? null)}
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