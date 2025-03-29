import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { useAuth } from '@/context/auth';
import { MessageCircle, Users, Clock, Camera } from 'lucide-react-native';
import { createProfile, getProfile, updateProfile } from '@/src/services/profileService';
import { useTheme } from '@/context/theme';
import { handleError } from '@/lib/errorHandler';

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  status_message: string | null;
  role: 'user' | 'admin' | 'moderator';
  created_at: string;
  updated_at: string;
  last_seen: string | null;
}

const DICEBEAR_STYLES = [
  'adventurer',
  'adventurer-neutral',
  'avataaars',
  'avataaars-neutral',
  'big-ears',
  'big-ears-neutral',
  'big-smile',
  'bottts',
  'bottts-neutral',
  'croodles',
  'croodles-neutral',
  'fun-emoji',
  'icons',
  'identicon',
  'initials',
  'lorelei',
  'lorelei-neutral',
  'micah',
  'miniavs',
  'notionists',
  'notionists-neutral',
  'open-peeps',
  'personas',
  'pixel-art',
  'pixel-art-neutral',
  'shapes',
  'thumbs'
];

interface AvatarOption {
  url: string;
  style: string;
}

export default function ProfileScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState<AvatarOption[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [promptField, setPromptField] = useState<keyof Profile | null>(null);
  const [promptValue, setPromptValue] = useState('');
  const [promptTitle, setPromptTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryAvatars, setCategoryAvatars] = useState<AvatarOption[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      if (!session?.user?.id) {
        throw new Error('No authenticated user');        
      }

      const { data } = await getProfile(session.user.id);
      if (!data) {
        // Create default profile with all required fields
        const defaultProfile = {
          id: session.user.id,
          username: `user_${session.user.id.slice(0, 8)}`,
          display_name: 'New User',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
          status_message: null,
          role: 'user' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: newProfile, error: createError } = await createProfile(defaultProfile);
        if (createError) {
          console.error('Profile creation error:', createError);
          throw createError;
        }
        if (!newProfile) {
          throw new Error('Failed to create profile: No profile data returned');
        }
        setProfile(newProfile as Profile);
      } else {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      setFetchError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile,session?.user]);

  const handleProfileUpdate = async (updates: Partial<Profile>) => {
    try {
      setLoading(true);
      if (!session?.user?.id || !profile) return;

      await updateProfile(session.user.id, updates);

      setProfile({ ...profile, ...updates });
    } catch (error) {
      const { message } = handleError(error);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const openPrompt = (field: keyof Profile, title: string, placeholder: string) => {
    setPromptField(field);
    setPromptTitle(title);
    setPromptValue(profile?.[field] || placeholder);
    setIsPromptVisible(true);
  };

  const handlePromptSubmit = () => {
    if (promptField) {
      handleProfileUpdate({ [promptField]: promptValue });
    }
    setIsPromptVisible(false);
  };

  const handleAvatarClick = async () => {
    // Pre-load categories instead of individual avatars
    const categories = DICEBEAR_STYLES.reduce((acc, style) => {
      const mainCategory = style.split('-')[0];
      if (!acc.includes(mainCategory)) acc.push(mainCategory);
      return acc;
    }, [] as string[]);
    
    setAvatarOptions(categories.map(category => ({
      url: `https://api.dicebear.com/7.x/${category}/svg?seed=${Math.random()}`,
      style: category
    })));
    setShowAvatarModal(true);
  };

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    const seed = Math.random().toString(36).substring(7);
    const styles = DICEBEAR_STYLES.filter(style => style.startsWith(category));
    
    const avatars = styles.map(style => ({
      url: `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`,
      style: style
    }));
    
    setCategoryAvatars(avatars);
    setShowCategoryModal(true);
    setShowAvatarModal(false);
  };

  const handleAvatarSelect = async (avatarUrl: string) => {
    try {
      setLoading(true);
      setSelectedAvatar(avatarUrl);
      setShowCategoryModal(false);
      await handleProfileUpdate({ avatar_url: avatarUrl });
    } catch (error) {
      Alert.alert('Error', 'Failed to update avatar');
    } finally {
      setLoading(false);
    }
  };

  const renderAvatarPreview = (url: string) => {
    if (url.includes('.svg')) {
      return (
        <SvgUri
          width="100%"
          height="100%"
          uri={url}
          style={styles.avatarPreview}
        />
      );
    }
    return (
      <Image 
        source={{ uri: url }} 
        style={styles.avatarPreview}
        defaultSource={require('../../assets/avatar-placeholder.png')}
      />
    );
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
    <>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { 
          backgroundColor: colors.surface,
          borderBottomColor: colors.border
        }]}>
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
          <TouchableOpacity onPress={() => openPrompt('display_name', 'Update Display Name', 'Display Name')}>
            <Text style={[styles.displayName, { color: colors.text }]}>
              {profile?.display_name || profile?.username}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openPrompt('username', 'Update Username', 'Username')}>
            <Text style={[styles.username, { color: colors.gray }]}>@{profile?.username}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openPrompt('status_message', 'Update Status Message', 'Status Message')}>
            <Text style={[styles.status, { color: colors.gray }]}>
              {profile?.status_message || 'Tap to set a status'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.joinedDate, { color: colors.gray }]}>
            Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}
          </Text>
        </View>

        <View style={[styles.stats, { borderBottomColor: colors.border }]}>
          <View style={styles.statItem}>
            <MessageCircle size={24} color={colors.gray} />
            <Text style={[styles.statNumber, { color: colors.text }]}>128</Text>
            <Text style={[styles.statLabel, { color: colors.gray }]}>Messages</Text>
          </View>
          <View style={styles.statItem}>
            <Users size={24} color={colors.gray} />
            <Text style={[styles.statNumber, { color: colors.text }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.gray }]}>Rooms</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={24} color={colors.gray} />
            <Text style={[styles.statNumber, { color: colors.text }]}>45h</Text>
            <Text style={[styles.statLabel, { color: colors.gray }]}>Time Spent</Text>
          </View>
        </View>

        <View style={styles.avatarOptions}>
          {DICEBEAR_STYLES.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={styles.avatarOptionContainer}
              onPress={() => handleCategorySelect(category)}
            >
              <Text style={[styles.avatarStyleLabel, { color: colors.text }]}>
                {category.replace(/-/g, ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Main Avatar Categories Modal */}
      <Modal 
        visible={showAvatarModal} 
        onRequestClose={() => setShowAvatarModal(false)}
        animationType="slide"
        transparent
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Avatar Style</Text>
            <ScrollView contentContainerStyle={styles.avatarGrid}>
              {avatarOptions.map((avatar, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.avatarGridItem}
                  onPress={() => handleCategorySelect(avatar.style)}
                >
                  <Image 
                    source={{ uri: avatar.url }} 
                    style={styles.categoryPreview}
                    defaultSource={require('../../assets/avatar-placeholder.png')}
                  />
                  <Text style={[styles.categoryLabel, { color: colors.text }]}>
                    {avatar.style.charAt(0).toUpperCase() + avatar.style.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAvatarModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Avatar Style Variants Modal */}
      <Modal 
        visible={showCategoryModal} 
        onRequestClose={() => setShowCategoryModal(false)}
        animationType="slide"
        transparent
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase()}${selectedCategory.slice(1)} Styles` : 'Avatar Styles'}
            </Text>
            <ScrollView contentContainerStyle={styles.avatarGrid}>
              {categoryAvatars.map((avatar, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.avatarGridItem}
                  onPress={() => handleAvatarSelect(avatar.url)}
                >
                  {renderAvatarPreview(avatar.url)}
                  <Text style={[styles.variantLabel, { color: colors.gray }]}>
                    {avatar.style.split('-').slice(1).join(' ') || 'Default'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalButtonGroup}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.gray }]}
                onPress={() => {
                  setShowCategoryModal(false);
                  setShowAvatarModal(true);
                }}
              >
                <Text style={styles.modalButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowCategoryModal(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Prompt Modal */}
      <Modal visible={isPromptVisible} transparent={true} animationType="fade">
        <View style={styles.promptOverlay}>
          <View style={styles.promptContainer}>
            <Text style={styles.promptTitle}>{promptTitle}</Text>
            <TextInput
              style={styles.promptInput}
              value={promptValue}
              onChangeText={setPromptValue}
              placeholder="Enter value"
            />
            <View style={styles.promptButtons}>
              <TouchableOpacity onPress={() => setIsPromptVisible(false)} style={styles.promptButton}>
                <Text style={styles.promptButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePromptSubmit} style={styles.promptButton}>
                <Text style={styles.promptButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

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
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    justifyContent: 'center', // Center the avatar vertically
    alignItems: 'center',    // Center the avatar horizontally
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    backgroundColor: '#f5f5f5', // Add fallback background color
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
  },
  username: {
    fontSize: 16,
    marginTop: 4,
  },
  status: {
    fontSize: 16,
    marginTop: 8,
  },
  joinedDate: {
    fontSize: 14,
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderBottomWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    color: '#ff3b30',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  avatarOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
  },
  avatarOptionContainer: {
    alignItems: 'center',
    margin: 8,
    width: 100,
  },
  avatarOption: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  avatarStyleLabel: {
    fontSize: 12,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#007BFF', // Moved from duplicate definition
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  promptOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  promptContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  promptInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  promptButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  promptButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  promptButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  avatarGridItem: {
    width: '30%',
    aspectRatio: 1,
    marginBottom: 20,
    alignItems: 'center',
  },
  categoryPreview: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    borderRadius: 15,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  avatarPreview: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    borderRadius: 15,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  variantLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  modalButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
