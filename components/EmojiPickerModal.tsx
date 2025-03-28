import React from 'react';
import { Modal, View, TouchableOpacity, Text, ScrollView } from 'react-native';

const EMOJIS = ['😀', '😂', '😊', '😍', '🥰', '😎', '🤔', '😅', '😭', '😤', '👍', '❤️', '🎉', '✨'];

interface EmojiPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPickerModal({ visible, onClose, onEmojiSelect }: EmojiPickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Pick an emoji</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 10 }}>
              {EMOJIS.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    onEmojiSelect(emoji);
                    onClose();
                  }}
                  style={{ padding: 10 }}
                >
                  <Text style={{ fontSize: 24 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={{ padding: 10, alignItems: 'center' }}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
