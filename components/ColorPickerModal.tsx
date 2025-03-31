import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/theme';

const BUBBLE_COLORS = [
  '#2ECC71', // Green
  '#3498DB', // Blue
  '#9B59B6', // Purple
  '#E74C3C', // Red
  '#F1C40F', // Yellow
  '#E67E22', // Orange
  '#1ABC9C', // Turquoise
  '#34495E', // Dark Blue
];

interface ColorPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onColorSelect: (color: string) => void;
}

export function ColorPickerModal({ visible, onClose, onColorSelect }: ColorPickerModalProps) {
  const { colors } = useTheme();
  
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Select Bubble Color</Text>
          <View style={styles.colorsGrid}>
            {BUBBLE_COLORS.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.colorButton, { backgroundColor: color }]}
                onPress={() => {
                  onColorSelect(color);
                  onClose();
                }}
              />
            ))}
          </View>
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 10,
    borderWidth: 2,
    borderColor: '#fff',
    boxShadow: '0px 2px 3.84px rgba(0,0,0,0.25)',
    elevation: 3,
  },
});
