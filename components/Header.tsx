import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/context/theme';

export default function Header() {
  const { colors } = useTheme();
  return (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <Image source={require('@/assets/images/favicon.png')} style={styles.favicon} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  favicon: {
    width: 40,
    height: 40,
    borderRadius: 20, // Make it circular
    borderWidth: 2,
    borderColor: '#fff', // White border
  },
});
