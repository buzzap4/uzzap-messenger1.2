import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/context/theme';

interface BlockedUser {
  blocked_user_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export default function BlockedUsersScreen() {
  const { colors } = useTheme();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

  const handleUnblock = async (blockedUserId: string) => {
    try {
      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('blocked_user_id', blockedUserId);

      if (error) throw error;

      setBlockedUsers((prev) =>
        prev.filter((user) => user.blocked_user_id !== blockedUserId)
      );
    } catch (err) {
      console.error('Error unblocking user:', err);
    }
  };

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData?.session?.user) throw new Error('Failed to fetch session or user');

        const { data, error } = await supabase
          .from('user_blocks')
          .select(`
            blocked_user_id,
            profiles:profiles!blocked_user_id(username, avatar_url)
          `)
          .eq('user_id', sessionData.session.user.id);

        if (error) throw error;

        // Ensure the data matches the BlockedUser type
        const transformedData = (data || []).map((item: any) => ({
          blocked_user_id: item.blocked_user_id,
          profiles: item.profiles,
        }));

        setBlockedUsers(transformedData);
      } catch (err) {
        console.error('Error fetching blocked users:', err);
      }
    };

    fetchBlockedUsers();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Blocked Users</Text>
      <FlatList
        data={blockedUsers}
        keyExtractor={(item) => item.blocked_user_id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={[styles.username, { color: colors.text }]}>
              {item.profiles.username}
            </Text>
            <TouchableOpacity onPress={() => handleUnblock(item.blocked_user_id)}>
              <Text style={[styles.unblockButton, { color: colors.primary }]}>
                Unblock
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  username: {
    fontSize: 16,
  },
  unblockButton: {
    fontSize: 14,
    fontWeight: '600',
  },
});
