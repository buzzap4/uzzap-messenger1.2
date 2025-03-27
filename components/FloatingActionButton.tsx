import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, Animated } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@/context/theme';

interface FABProps {
  onPress: () => void;
  style?: ViewStyle;
}

export default function FloatingActionButton({ onPress, style }: FABProps) {
  const { colors } = useTheme();
  const scale = new Animated.Value(1);

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: '#28A745' }, style]} // Changed to green
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Plus size={24} color={colors.background} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
