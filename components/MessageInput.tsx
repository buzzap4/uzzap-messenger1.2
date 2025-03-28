import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { Send, Image as ImageIcon, Smile } from 'lucide-react-native';
import { useTheme } from '@/context/theme';
import { Ionicons } from '@expo/vector-icons';
import { FileUploadModal } from './FileUploadModal';
import { EmojiPickerModal } from './EmojiPickerModal';

interface MessageInputProps {
  onSend: (message: string, type?: 'text' | 'image') => void;
  onImageSelect?: () => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, onImageSelect, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const { colors } = useTheme();
  const scale = new Animated.Value(1);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showEmojiModal, setShowEmojiModal] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onSend(message.trim(), 'text');
        setMessage('');
      });
    }
  };

  const handleFileUpload = (url: string) => {
    onSend(url, 'image');
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  return (
    <View style={[styles.container, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
      <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}>
        <TouchableOpacity onPress={() => setShowEmojiModal(true)} style={styles.icon}>
          <Ionicons name="happy-outline" size={24} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setShowFileModal(true)} style={styles.icon}>
          <Ionicons name="attach-outline" size={24} color="#666" />
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Type a message..."
          placeholderTextColor={colors.gray}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
      </View>
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: message.trim() && !disabled ? '#28A745' : colors.gray }, // Changed to green
          ]}
          onPress={handleSend}
          disabled={!message.trim() || disabled}
        >
          <Send size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      <FileUploadModal
        visible={showFileModal}
        onClose={() => setShowFileModal(false)}
        onUploadComplete={handleFileUpload}
      />

      <EmojiPickerModal
        visible={showEmojiModal}
        onClose={() => setShowEmojiModal(false)}
        onEmojiSelect={handleEmojiSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 8,
    marginRight: 8,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingHorizontal: 8,
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    color: '#333',
  },
  button: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e5e5',
  },
  icon: {
    padding: 5,
  },
});