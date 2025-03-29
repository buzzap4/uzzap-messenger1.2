import React from 'react';
import { Modal, View, TouchableOpacity, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/context/theme';

const EMOJIS = [
  // Smileys & Emotion
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😚', '😋', '😛', 
  '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫',
  // Love & Hearts
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💕', '💞', '💓', '💗', '💖', '💝',
  // Gestures & People
  '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎',
  // Animals
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵',
  // Food & Drink
  '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥝',
  // Activities
  '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🎮', '🎲', '🧩', '🎭', '🎨', '🎬',
  // Travel & Places
  '✈️', '🚗', '🚕', '🚙', '🚌', '🏎️', '🏍️', '🚲', '🚂', '🚁', '⛵', '🚤', '🛥️', '⛴️', '🚢',
  // Objects
  '💡', '📱', '💻', '⌨️', '🖥️', '🖨️', '📸', '📷', '🎥', '🎮', '🕹️', '🎧', '🎤', '🎵', '🎶',
  // Symbols
  '❗', '❓', '❕', '❔', '💯', '✅', '❌', '⭕', '✨', '💫', '🌟', '⚡', '💥', '🔥', '🎉'
];

interface EmojiPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPickerModal({ visible, onClose, onEmojiSelect }: EmojiPickerModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>Pick an emoji</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.emojiGrid}>
              {EMOJIS.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    onEmojiSelect(emoji);
                    onClose();
                  }}
                  style={styles.emojiButton}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <TouchableOpacity 
            onPress={onClose} 
            style={styles.closeButton}
          >
            <Text style={[styles.closeText, { color: colors.text }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  emojiButton: {
    padding: 10,
  },
  emojiText: {
    fontSize: 24,
  },
  closeButton: {
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
