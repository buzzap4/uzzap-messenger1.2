import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { useAuth } from '@/context/auth';
import { MessageCircle, Users, Clock, Camera } from 'lucide-react-native';
import { createProfile, getProfile, updateProfile } from '@/src/services/profileService'; 

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  status_message: string | null;
  created_at: string;
  last_seen: string;
}

export default function ProfileScreen() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      if (!session?.user) {
        throw new Error('No authenticated user');        
      }

      const { data } = await getProfile(session.user.id);

      if (!data) {
        // Create default profile if none exists
        const defaultProfile = {
          id: session.user.id,
          username: `user_${session.user.id.slice(0, 8)}`,
          display_name: 'New User',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
        };

        const { data: newProfile, error: createError } = await createProfile(defaultProfile);
        if (createError) throw createError;
        setProfile(newProfile);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setFetchError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  },[session?.user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile,session?.user]);
  const handleProfileUpdate = async (updates: Partial<Profile>) => {    
    try {
      setLoading(true);
      if (!session?.user?.id) return;      

      // Convert updates to match the expected types
      const sanitizedUpdates: Partial<Profile> = {
        display_name: updates.display_name || null,
        status_message: updates.status_message || null,
        avatar_url: updates.avatar_url || null,
        username: updates.username,
      };
      
      const { error: updateError } = await updateProfile(session.user.id, sanitizedUpdates);
      if (updateError) throw updateError;
      
      await fetchProfile();      
      Alert.alert('Success', 'Profile updated successfully');      
    } catch (error) {
      console.error('Profile update error:', error);      
      Alert.alert('Error', 'Failed to update profile');      
    } finally {      
      setLoading(false);
    }
  };

  const promptDisplayNameUpdate = () => {
    Alert.prompt(
      'Update Display Name',
      'Enter your new display name',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: (value) => {
            if (value) handleProfileUpdate({ display_name: value });
          }
        }
      ],
      'plain-text',
      profile?.display_name || ''
    );
  };

  const promptStatusUpdate = () => {
    Alert.prompt(
      'Update Status',
      'Enter your new status',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: (value) => {
            if (value) handleProfileUpdate({ status_message: value });
          }
        }
      ],
      'plain-text',
      profile?.status_message || ''
    );    
  };
  
  const fetchAvatars = async () => {
    const seeds = Array.from({ length: 5 }, () => Math.random().toString(36).substring(7));
    const avatars = seeds.map(seed => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
    setAvatarOptions(avatars);
  };

  const handleAvatarClick = async () => {    
    await fetchAvatars();
    setShowAvatarModal(true);
  };

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    setShowAvatarModal(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (fetchError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{fetchError}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAvatarClick} style={styles.avatarContainer}>
          <Image
            source={{
              uri: selectedAvatar || profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'
            }}
            style={styles.avatar}
          />
          <View style={styles.cameraButton}>
            <Camera size={20} color="#fff" />
          </View>
        </TouchableOpacity>        
        <TouchableOpacity onPress={promptDisplayNameUpdate}>
          <Text style={styles.displayName}>{profile?.display_name || profile?.username}</Text>
        </TouchableOpacity>
        <Text style={styles.username}>@{profile?.username}</Text>
        <TouchableOpacity
          onPress={promptStatusUpdate}          
        >
          <Text style={styles.status}>{profile?.status_message || 'Tap to set a status'}</Text>
        </TouchableOpacity>
        <Text style={styles.joinedDate}>
          Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}
        </Text>
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

      {/* Avatar Selection Modal */}
      <Modal visible={showAvatarModal} onRequestClose={() => setShowAvatarModal(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select an Avatar</Text>
          <View style={styles.avatarOptions}>
            {avatarOptions.map((avatar, index) => (
              <TouchableOpacity key={index} onPress={() => handleAvatarSelect(avatar)}>
                <Image source={{ uri: avatar }} style={styles.avatarOption} />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={() => setShowAvatarModal(false)} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

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
  joinedDate: {
    fontSize: 12,
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
  errorText: {
    color: '#ff3b30',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  avatarOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  avatarOption: {
    width: 80,
    height: 80,
    margin: 10,
    borderRadius: 40,
  },
  modalButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
});
