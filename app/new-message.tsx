import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Search, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/context/auth';
import { DEFAULT_AVATAR_URL } from '@/lib/constants';
import Avatar from '@/components/Avatar';
import { useTheme } from '@/context/theme';

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
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .limit(20);

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
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

      const { data: newConvo, error: insertError } = await supabase
        .from('conversations')
        .insert({
          user1_id: session.user.id,
          user2_id: userId
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/direct-message/${newConvo.id}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>New Message</Text>
      </View>

      <View style={[styles.searchContainer, { 
        backgroundColor: colors.inputBackground,
        borderColor: colors.border
      }]}>
        <Search size={20} color={colors.gray} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search users..."
          placeholderTextColor={colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={users}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.userItem, { 
              backgroundColor: colors.surface,
              borderColor: colors.border
            }]}
            onPress={() => startConversation(item.id)}
          >
            <Avatar
              uri={item.avatar_url}
              username={item.username}
              size={48}
              style={styles.avatar}
            />
            <Text style={[styles.username, { color: colors.text }]}>{item.username}</Text>
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
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
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
    borderRadius: 12,
    borderWidth: 1,
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
