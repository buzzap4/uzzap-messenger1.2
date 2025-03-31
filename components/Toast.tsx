import React from 'react';
import { Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  style?: any;
}

export default function Toast({ message, type = 'info', onClose, style }: ToastProps) {
  const getBgColor = () => {
    switch (type) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      default:
        return '#2196f3';
    }
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: getBgColor() }, style]}>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={onClose}>
        <X size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0px 2px 3.84px rgba(0,0,0,0.25)',
    elevation: 6,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
});
