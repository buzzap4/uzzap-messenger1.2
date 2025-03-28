import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Search, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/context/auth';

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface Conversation {
  id: string;
  created_at: string;
  user1_id: string;
  user2_id: string;
}

export default function NewMessageScreen() {
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .limit(20);

    if (!error && data) {
      setUsers(data);
    }
  }, []);

  const searchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${searchQuery}%`)
      .limit(20);

    if (!error && data) {
      setUsers(data);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers();
    } else {
      fetchUsers();
    }
  }, [searchQuery, searchUsers, fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const startConversation = async (userId: string) => {
    try {
      if (!session?.user) return;

      // Check if conversation already exists using parameterized query
      const { data: existingConvo, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingConvo) {
        router.push(`/direct-message/${existingConvo.id}`);
        return;
      }

      // Create new conversation with explicit values
      const { data: newConvo, error: insertError } = await supabase
        .from('conversations')
        .insert({
          user1_id: session.user.id,
          user2_id: userId
        })
        .select()
        .single();

      if (insertError) throw insertError;
      if (newConvo) {
        router.push(`/direct-message/${newConvo.id}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>New Message</Text>
      </View>
      <View style={styles.searchContainer}>
        <Search size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => startConversation(item.id)}
          >
            <Image
              source={{
                uri: item.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800'
              }}
              style={styles.avatar}
            />
            <Text style={styles.username}>{item.username}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 16,
    color: '#1a1a1a',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
