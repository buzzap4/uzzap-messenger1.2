import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { Send, Image as ImageIcon, Smile } from 'lucide-react-native';
import { useTheme } from '@/context/theme';

interface MessageInputProps {
  onSend: (message: string) => void;
  onImageSelect?: () => void;
}

export default function MessageInput({ onSend, onImageSelect }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const { colors } = useTheme();
  const scale = new Animated.Value(1);

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
        onSend(message.trim());
        setMessage('');
      });
    }
  };

  return (
    <View style={[styles.container, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
      <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}>
        <TouchableOpacity style={styles.button} onPress={onImageSelect}>
          <ImageIcon size={24} color={colors.gray} />
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
        <TouchableOpacity style={styles.button}>
          <Smile size={24} color={colors.gray} />
        </TouchableOpacity>
      </View>
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: message.trim() ? colors.primary : colors.gray },
          ]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Send size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
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
});