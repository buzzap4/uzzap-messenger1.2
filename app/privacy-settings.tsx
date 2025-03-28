import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/theme';

export default function PrivacySettingsScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Privacy Settings</Text>
      <Text style={[styles.description, { color: colors.gray }]}>
        Here you can manage your privacy preferences.
      </Text>
      {/* Add privacy settings options here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
});
