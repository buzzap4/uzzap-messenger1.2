import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import FloatingActionButton from '@/components/FloatingActionButton';
import RegionDropdown from '@/components/RegionDropdown';
import { MapPin, MessageCircle, Users, LogIn, LogOut } from 'lucide-react-native';
import { Region, Province } from '@/types/Region';
import { useTheme } from '@/context/theme';
import { useAuth } from '@/context/auth';
import { joinChatroom, leaveChatroom, isUserInChatroom } from '@/src/services/chatroomService';

export default function RoomsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { session } = useAuth();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [membershipStatus, setMembershipStatus] = useState<{[key: string]: boolean}>({});
  const [joiningRoom, setJoiningRoom] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: boolean }>({});
  const [chatMessages, setChatMessages] = useState<{ [key: string]: number }>({});

  const fetchRegions = async () => {
    try {
      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      const { data: regions, error: regionsError } = await supabase
        .from('regions')
        .select(`
          id,
          name,
          provinces:provinces (
            id,
            name,
            chatrooms:chatrooms (
              id,
              name
            )
          )
        `)
        .order('name');

      if (regionsError) throw regionsError;

      // Fix the data transformation to match types
      const processedRegions: Region[] = regions?.map(region => ({
        id: region.id,
        name: region.name,
        provinces: region.provinces.map(province => ({
          id: province.id,
          name: province.name,
          chatrooms: province.chatrooms ? [province.chatrooms].flat() : []
        }))
      })) || [];

      // Create missing chatrooms
      for (const region of processedRegions) {
        for (const province of region.provinces) {
          if (!province.chatrooms?.length) {
            try {
              const { data: chatroom, error: chatError } = await supabase
                .from('chatrooms')
                .upsert({
                  name: `${province.name} Chat`,
                  province_id: province.id
                })
                .select()
                .single();

              if (chatError) {
                throw chatError;
              } else {
                province.chatrooms = [chatroom];
              }
            } catch (err) {
              throw err;
            }
          }
        }
      }

      setRegions(processedRegions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  useEffect(() => {
    const initializeMembershipStatus = async () => {
      if (!session?.user?.id) return;

      const membershipPromises = regions.flatMap(region =>
        region.provinces.flatMap(province =>
          (province.chatrooms || []).map(async chatroom => {
            const { data } = await isUserInChatroom(chatroom.id, session.user.id);
            return { [chatroom.id]: !!data };
          })
        )
      );

      const membershipResults = await Promise.all(membershipPromises);
      const initialStatus = membershipResults.reduce((acc, status) => ({ ...acc, ...status }), {});
      setMembershipStatus(initialStatus);
    };

    if (regions.length > 0) {
      initializeMembershipStatus();
    }
  }, [regions, session?.user?.id]);

  useEffect(() => {
    const onlineUsersSubscription = supabase
      .channel('online-users')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: 'is_online=eq.true' }, (payload) => {
        const userId = payload.new.id;
        setOnlineUsers((prev) => ({ ...prev, [userId]: true }));
      })
      .subscribe();

    const chatMessagesSubscription = supabase
      .channel('new-message')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const { chatroom_id } = payload.new;
        setChatMessages((prev) => ({
          ...prev,
          [chatroom_id]: (prev[chatroom_id] || 0) + 1,
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(onlineUsersSubscription);
      supabase.removeChannel(chatMessagesSubscription);
    };
  }, []);

  const handleJoinRoom = async (chatroomId: string) => {
    try {
      setJoiningRoom(chatroomId);
      await joinChatroom(chatroomId);
      setMembershipStatus(prev => ({ ...prev, [chatroomId]: true }));
      // Auto-navigate after joining
      router.push(`/chatroom/${chatroomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      Alert.alert('Error', 'Failed to join room');
    } finally {
      setJoiningRoom(null);
    }
  };

  const handleLeaveRoom = async (chatroomId: string) => {
    try {
      await leaveChatroom(chatroomId);
      setMembershipStatus(prev => ({ ...prev, [chatroomId]: false }));
      Alert.alert('Success', 'You have left the room');
    } catch (error) {
      console.error('Error leaving room:', error);
      Alert.alert('Error', 'Failed to leave room');
    }
  };

  const handleProvincePress = async (province: Province) => {
    const chatroomId = province.chatrooms?.[0]?.id;
    const isMember = chatroomId ? membershipStatus[chatroomId] : false;

    if (!chatroomId) {
      Alert.alert('No Chatroom', `No chat room available for ${province.name}`);
      return;
    }

    try {
      if (isMember) {
        await router.push({
          pathname: '/chatroom/[id]',
          params: { id: chatroomId }
        });
      } else {
        Alert.alert(
          'Join Room',
          `Would you like to join the chat room for ${province.name}?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Join',
              onPress: async () => {
                try {
                  await handleJoinRoom(chatroomId);
                } catch (error) {
                  console.error('Failed to join room:', error);
                  Alert.alert('Error', 'Failed to join the room. Please try again.');
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to open the chatroom. Please try again.');
    }
  };

  const filteredProvinces = selectedRegion
    ? regions.find(r => r.id === selectedRegion.id)?.provinces || []
    : regions.flatMap(r => r.provinces);

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading rooms...</Text>
      </View>
    );
  }

  const renderProvinceItem = ({ item }: { item: Province }) => {
    const chatroomId = item.chatrooms?.[0]?.id;
    const isMember = chatroomId ? membershipStatus[chatroomId] : false;
    const isJoining = joiningRoom === chatroomId;
    const onlineCount = Object.keys(onlineUsers).length;
    const messageCount = chatroomId ? chatMessages[chatroomId] || 0 : 0;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.provinceItem,
          { backgroundColor: colors.surface }
        ]}
        onPress={() => handleProvincePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.provinceIconContainer}>
          <MapPin size={24} color="#007AFF" />
        </View>
        <View style={styles.provinceInfo}>
          <Text style={styles.provinceName}>{item.name}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <MessageCircle size={16} color="#666" />
              <Text style={styles.statText}>
                {messageCount} chats
              </Text>
            </View>
            <View style={styles.stat}>
              <Users size={16} color="#666" />
              <Text style={styles.statText}>{onlineCount} online</Text>
            </View>
          </View>
        </View>
        {chatroomId && (
          <TouchableOpacity
            style={[
              styles.roomButton,
              { backgroundColor: isMember ? '#dc3545' : '#28a745' }
            ]}
            disabled={isJoining}
            onPress={() => isMember ? handleLeaveRoom(chatroomId) : handleJoinRoom(chatroomId)}
          >
            {isJoining ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : isMember ? (
              <LogOut size={20} color="#fff" />
            ) : (
              <LogIn size={20} color="#fff" />
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Chat Rooms</Text>
        <RegionDropdown
          regions={regions}
          selectedRegion={selectedRegion}
          onSelect={(region: Region) => setSelectedRegion(region)}
        />
      </View>

      <FlatList
        data={filteredProvinces}
        renderItem={renderProvinceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <FloatingActionButton
        onPress={() => router.push('/new-message')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  regionContainer: {
    marginBottom: 24,
  },
  regionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  provinceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  provinceImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  provinceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  provinceInfo: {
    flex: 1,
  },
  provinceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chatCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff3b30',
    textAlign: 'center',
  },
  roomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});