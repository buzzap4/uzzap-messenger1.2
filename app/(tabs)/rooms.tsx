import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ChevronRight } from 'lucide-react-native';

interface Region {
  id: string;
  name: string;
  provinces: Province[];
}

interface Province {
  id: string;
  name: string;
  chatrooms: Chatroom[];
}

interface Chatroom {
  id: string;
  name: string;
}

export default function RoomsScreen() {
  const router = useRouter();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderRegion = ({ item: region }: { item: Region }) => (
    <View style={styles.regionContainer}>
      <Text style={styles.regionName}>{region.name}</Text>
      {region.provinces?.map((province) => (
        <TouchableOpacity
          key={province.id}
          style={styles.provinceItem}
          onPress={() => router.push(`/chatroom/${province.chatrooms[0]?.id}`)}
        >
          <Image
            source={{
              uri: `https://images.unsplash.com/photo-${Math.random().toString().slice(2, 11)}?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3`
            }}
            style={styles.provinceImage}
          />
          <View style={styles.provinceInfo}>
            <Text style={styles.provinceName}>{province.name}</Text>
            <Text style={styles.chatCount}>
              {province.chatrooms?.length || 0} active chats
            </Text>
          </View>
          <ChevronRight size={20} color="#999" />
        </TouchableOpacity>
      ))}
    </View>
  );

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
        <Text style={styles.subtitle}>Join conversations across the Philippines</Text>
      </View>
      <FlatList
        data={regions}
        renderItem={renderRegion}
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
  errorText: {
    color: '#ff3b30',
    textAlign: 'center',
  },
});