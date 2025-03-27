import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';
import { MessageCircle, Users, Clock, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface Profile {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  status_message: string | null;
}

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url, status_message')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      try {
        const uri = result.assets[0].uri;
        const fileExt = uri.substring(uri.lastIndexOf('.') + 1);
        const fileName = `${session?.user.id}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Upload to Supabase Storage
        const response = await fetch(uri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, blob);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Update profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', session?.user.id);

        if (updateError) throw updateError;

        // Refresh profile data
        fetchProfile();
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          <Image
            source={{
              uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800'
            }}
            style={styles.avatar}
          />
          <View style={styles.cameraButton}>
            <Camera size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.displayName}>{profile?.display_name || profile?.username}</Text>
        <Text style={styles.username}>@{profile?.username}</Text>
        <Text style={styles.status}>{profile?.status_message || 'No status message'}</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <MessageCircle size={24} color="#666" />
          <Text style={styles.statNumber}>128</Text>
          <Text style={styles.statLabel}>Messages</Text>
        </View>
        <View style={styles.statItem}>
          <Users size={24} color="#666" />
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Rooms</Text>
        </View>
        <View style={styles.statItem}>
          <Clock size={24} color="#666" />
          <Text style={styles.statNumber}>45h</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
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
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  status: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  signOutButton: {
    margin: 20,
    padding: 16,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff3b30',
    textAlign: 'center',
  },
});
