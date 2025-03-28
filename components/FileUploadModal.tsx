import React from 'react';
import { Modal, View, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

interface FileUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUploadComplete: (url: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const validateFile = (uri: string, fileInfo: any): boolean => {
  if (fileInfo.size > MAX_FILE_SIZE) {
    Alert.alert('Error', 'File size must be less than 5MB');
    return false;
  }

  if (!ALLOWED_TYPES.includes(fileInfo.type)) {
    Alert.alert('Error', 'Only JPEG, PNG and GIF files are allowed');
    return false;
  }

  return true;
};

export function FileUploadModal({ visible, onClose, onUploadComplete }: FileUploadModalProps) {
  const [uploading, setUploading] = React.useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      if (!validateFile(result.assets[0].uri, result.assets[0])) {
        return;
      }
      try {
        setUploading(true);
        const uri = result.assets[0].uri;
        const fileName = `${Date.now()}.jpg`;
        const filePath = `chat-images/${fileName}`;

        const response = await fetch(uri);
        const blob = await response.blob();
        
        const { error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(filePath, blob);

        if (uploadError) throw new Error(uploadError.message);

        const { data: { publicUrl } } = supabase.storage
          .from('chat-images')
          .getPublicUrl(filePath);

        onUploadComplete(publicUrl);
        onClose();
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
          {uploading ? (
            <ActivityIndicator />
          ) : (
            <>
              <TouchableOpacity onPress={pickImage} style={{ padding: 10 }}>
                <Text>Choose Image</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={{ padding: 10 }}>
                <Text>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
