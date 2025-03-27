import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import FloatingActionButton from '@/components/FloatingActionButton';
import RegionDropdown from '@/components/RegionDropdown';
import { MapPin, MessageCircle, Users } from 'lucide-react-native';
import { Region } from '@/types/Region';

export default function RoomsScreen() {
  const router = useRouter();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select(`
          id,
          name,
          provinces (
            id,
            name,
            chatrooms (
              id,
              name
            )
          )
        `)
        .order('name');

      if (error) throw error;
      setRegions(data || []);
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error('An unknown error occurred');
      }
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat Rooms</Text>
        <RegionDropdown
          regions={regions}
          selectedRegion={selectedRegion}
          onSelect={(region: Region) => setSelectedRegion(region)}
        />
      </View>

      <FlatList
        data={filteredProvinces}
        renderItem={({ item: province }) => (
          <TouchableOpacity
            key={province.id}
            style={styles.provinceItem}
            onPress={() => router.push(`/chatroom/${province.chatrooms[0]?.id}`)}
          >
            <View style={styles.provinceIconContainer}>
              <MapPin size={24} color="#007AFF" />
            </View>
            <View style={styles.provinceInfo}>
              <Text style={styles.provinceName}>{province.name}</Text>
              <View style={styles.statsContainer}>
                <View style={styles.stat}>
                  <MessageCircle size={16} color="#666" />
                  <Text style={styles.statText}>
                    {province.chatrooms?.length || 0} chats
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Users size={16} color="#666" />
                  <Text style={styles.statText}>0 online</Text>
                </View>
              </View>
            </View>
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>2</Text>
            </View>
          </TouchableOpacity>
        )}
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
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
    marginRight: 16,
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
});