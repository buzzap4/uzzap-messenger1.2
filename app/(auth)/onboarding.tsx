import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert, ActivityIndicator, Modal } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { User, Upload } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';
import { createProfile } from '@/src/services/profileService';
import Avatar from '@/components/Avatar';
import { storageConfig } from '../../src/config/storage';
import { handleError, getErrorMessage } from '@/lib/errorHandler';
import { DEFAULT_AVATAR_URL } from '@/lib/constants';

export default function OnboardingScreen() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { session, completeOnboarding } = useAuth();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState('');

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
          .from(storageConfig.bucketName) // Use centralized bucket name
          .upload(filePath, blob);

        if (uploadError) throw new Error(uploadError.message);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(storageConfig.bucketName) // Use centralized bucket name
          .getPublicUrl(filePath);

        setAvatarUrl(publicUrl);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const handleGenerateAvatar = () => {
    setAvatarSeed(Math.random().toString());
    setAvatarUrl(`${DEFAULT_AVATAR_URL}?seed=${avatarSeed}&backgroundColor=random`);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!username.trim() || !displayName.trim()) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      if (!session?.user?.id) {
        Alert.alert('Error', 'No user session found');
        return;
      }

      const { data, error } = await createProfile({
        id: session.user.id,
        username: username.trim(),
        display_name: displayName.trim(),
        avatar_url: avatarUrl || null,
        status_message: null,
        role: 'user',
      });

      if (error) throw error;
      if (!data) throw new Error('Profile creation failed');

      await completeOnboarding();
      router.replace('/');
    } catch (error) {
      const { message } = handleError(error);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const renderAvatarModal = () => (
    <Modal
      visible={showAvatarModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAvatarModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choose Avatar</Text>
          
          <View style={styles.avatarOptions}>
            <TouchableOpacity style={styles.avatarOption} onPress={handleGenerateAvatar}>
              <Avatar
                uri={avatarUrl}
                username={username || 'default'}
                size={120}
              />
              <Text style={styles.avatarOptionText}>Random Avatar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.avatarOption} onPress={pickImage}>
              <View style={styles.uploadOption}>
                <Upload size={40} color="#666" />
                <Text style={styles.avatarOptionText}>Upload Photo</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setShowAvatarModal(false)}
          >
            <Text style={styles.modalButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>Let's get to know you better</Text>

      <TouchableOpacity 
        style={styles.avatarContainer} 
        onPress={() => setShowAvatarModal(true)}
      >
        <Avatar
          uri={avatarUrl}
          username={username || 'default'}
          size={120}
        />
        <View style={styles.uploadButton}>
          <Upload size={20} color="#fff" />
        </View>
      </TouchableOpacity>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <User size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <User size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Complete Profile</Text>
          )}
        </TouchableOpacity>
      </View>
      {renderAvatarModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 32,
    position: 'relative',
  },
  uploadButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#28A745',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
    padding: Platform.OS === 'ios' ? 12 : 4,
  },
  inputIcon: {
    marginRight: 8,
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#28A745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  avatarOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  avatarOption: {
    alignItems: 'center',
  },
  avatarOptionText: {
    marginTop: 8,
    color: '#666',
  },
  uploadOption: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: '#28A745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
