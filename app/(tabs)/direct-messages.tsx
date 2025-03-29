import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Search, Plus, Loader2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/context/theme';
import { DEFAULT_AVATAR_URL } from '@/lib/constants';
import Avatar from '@/components/Avatar';

interface DirectMessage {
  id: string;
  sender: {
    id: string;
    username: string;  
    avatar_url: string | null;
  };
  receiver: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  content: string;
  created_at: string;
  read_at: string | null;
}

export default function DirectMessagesScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();  
  
  const fetchDirectMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          id,
          content,
          created_at,
          read_at,
          sender:profiles!sender_id(id, username, avatar_url),
          receiver:profiles!receiver_id(id, username, avatar_url)
        `)
        .or(`sender_id.eq.${session?.user.id},receiver_id.eq.${session?.user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the response to match our DirectMessage type
      const transformedData = (data?.map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        read_at: msg.read_at,
        sender: msg.sender[0],
        receiver: msg.receiver[0]
      })) || []);
      
      setMessages(transformedData);     
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user.id]);

  useEffect(() => {
    fetchDirectMessages();
  },[fetchDirectMessages]);

  const renderItem = ({ item }: { item: DirectMessage }) => {
    if (!item || !item.sender || !item.receiver) return null;
    
    const otherUser = item.sender.id === session?.user.id ? item.receiver : item.sender;
    if (!otherUser) return null;
  
    return (
      <TouchableOpacity 
        style={[styles.chatItem, { backgroundColor: colors.surface }]}
        onPress={() => router.push(`/direct-message/${item.id}`)}
      >
        <View style={styles.avatarContainer}>
          <Avatar 
            uri={otherUser.avatar_url}
            username={otherUser.username}
            size={50}
            style={styles.avatar}
          />
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.userName}>{otherUser.username}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
          <View style={styles.messageRow}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.content}
            </Text>
            {!item.read_at && item.receiver.id === session?.user.id && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>1</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Loader2 
          size={40}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { 
        borderBottomColor: colors.border,
        backgroundColor: colors.surface
      }]}>
        <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
        <TouchableOpacity onPress={() => router.push('/new-message')}>
          <Plus size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Search size={20} color={colors.gray} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search messages"
          placeholderTextColor={colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={messages}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
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
  userName: {
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
    alignItems: 'center'
  },

});
