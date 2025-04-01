import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Modal, TextInput, Platform } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { useAuth } from '@/context/auth';
import { MessageCircle, Users, Clock, Camera, ImagePlus, Edit2 } from 'lucide-react-native';
import { createProfile, getProfile, updateProfile } from '@/src/services/profileService';
import { useTheme } from '@/context/theme';
import { handleError } from '@/lib/errorHandler';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { storageConfig } from '@/src/config/storage';

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
  cover_image?: string | null;
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
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      if (!session?.user?.id) {
        throw new Error('No authenticated user');        
      }

      const { data } = await getProfile(session.user.id);
      if (!data) {
        const defaultProfile = {
          id: session.user.id,
          username: `user_${session.user.id.slice(0, 8)}`,
          display_name: 'New User',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
          status_message: null,
          role: 'user' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          cover_image: null
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
        setCoverImage(data.cover_image || null);
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
  }, [fetchProfile, session?.user]);

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

  const openPrompt = (field: keyof Profile, title: string, placeholder: string, currentValue?: string) => {
    setPromptField(field);
    setPromptTitle(title);
    setPromptValue(currentValue || profile?.[field]?.toString() || placeholder);
    setIsPromptVisible(true);
  };

  const handlePromptSubmit = () => {
    if (promptField) {
      handleProfileUpdate({ [promptField]: promptValue });
    }
    setIsPromptVisible(false);
  };

  const pickImage = async (type: 'avatar' | 'cover') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'avatar' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        const uri = result.assets[0].uri;
        
        // Get file extension and ensure it's valid
        const fileExtMatch = uri.match(/\.(\w+)$/);
        const fileExt = fileExtMatch ? fileExtMatch[1].toLowerCase() : 'jpg';
        
        // Generate unique filename with timestamp
        const timestamp = new Date().getTime();
        const fileName = `${type}_${session?.user?.id}_${timestamp}.${fileExt}`;
        const filePath = `${type === 'avatar' ? 'avatars' : 'covers'}/${fileName}`;

        // Get file type from extension
        const mimeType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

        const response = await fetch(uri);
        const blob = await response.blob();
        
        // Create file with proper MIME type
        const file = new Blob([blob], { type: mimeType });

        const { error: uploadError } = await supabase.storage
          .from(storageConfig.bucketName)
          .upload(filePath, file, { 
            contentType: mimeType,
            upsert: true 
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(storageConfig.bucketName)
          .getPublicUrl(filePath);

        // Update profile with new image URL
        if (type === 'avatar') {
          await handleProfileUpdate({ avatar_url: publicUrl });
          setSelectedAvatar(publicUrl);
        } else {
          setCoverImage(publicUrl);
          await handleProfileUpdate({ cover_image: publicUrl });
        }
      }
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.coverContainer}>
        <Image
          source={{
            uri: coverImage || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809'
          }}
          style={styles.coverImage}
        />
        <TouchableOpacity 
          style={styles.changeCoverButton}
          onPress={() => pickImage('cover')}
        >
          <ImagePlus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.profileSection, { backgroundColor: colors.surface }]}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={() => pickImage('avatar')} style={styles.avatarContainer}>
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

          <View style={styles.nameSection}>
            <TouchableOpacity onPress={() => openPrompt('display_name', 'Update Display Name', 'Display Name', profile?.display_name || '')}>
              <Text style={[styles.displayName, { color: colors.text }]}>
                {profile?.display_name || profile?.username}
                <Edit2 size={16} color={colors.gray} style={styles.editIcon} />
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => openPrompt('username', 'Update Username', 'Username', profile?.username)}>
              <Text style={[styles.username, { color: colors.gray }]}>
                @{profile?.username}
                <Edit2 size={16} color={colors.gray} style={styles.editIcon} />
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => openPrompt('status_message', 'Update Bio', 'Add a bio...', profile?.status_message || '')}
          style={styles.bioContainer}
        >
          <Text style={[styles.bio, { color: colors.text }]}>
            {profile?.status_message || 'No bio yet'}
            <Edit2 size={16} color={colors.gray} style={styles.editIcon} />
          </Text>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.text }]}>128</Text>
            <Text style={[styles.statLabel, { color: colors.gray }]}>Messages</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.text }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.gray }]}>Rooms</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.text }]}>45h</Text>
            <Text style={[styles.statLabel, { color: colors.gray }]}>Active</Text>
          </View>
        </View>
      </View>

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
    </ScrollView>
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
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
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
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
  },
  bio: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  editIcon: {
    marginLeft: 8,
  },
  coverContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeCoverButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  profileSection: {
    marginTop: -50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  nameSection: {
    marginLeft: 20,
    flex: 1,
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
    backgroundColor: '#007BFF',
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
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
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
  bioContainer: {
    marginTop: 10,
    padding: 10,
  },
});
