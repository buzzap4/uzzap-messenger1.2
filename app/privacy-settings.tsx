import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Button } from 'react-native';
import { useTheme } from '@/context/theme';

export default function PrivacySettingsScreen() {
  const { colors } = useTheme();
  const [readReceiptsEnabled, setReadReceiptsEnabled] = useState(false);

  const handleResetSettings = () => {
    setReadReceiptsEnabled(false);
    // Add logic to reset other privacy settings if needed
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Privacy Settings</Text>
      <Text style={[styles.description, { color: colors.gray }]}>
        Here you can manage your privacy preferences.
      </Text>
      <View style={styles.option}>
        <Text style={[styles.optionLabel, { color: colors.text }]}>Enable Read Receipts</Text>
        <Switch
          value={readReceiptsEnabled}
          onValueChange={setReadReceiptsEnabled}
          thumbColor={readReceiptsEnabled ? colors.primary : colors.gray}
        />
      </View>
      <Button
        title="Reset to Default"
        onPress={handleResetSettings}
        color={colors.primary}
      />
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
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 16,
  },
});
