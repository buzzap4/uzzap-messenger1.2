import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/context/theme';
import { Bell, Moon, Sun, Globe, Lock, Shield, HelpCircle } from 'lucide-react-native';

export default function SettingsScreen() {
  const { theme, setTheme, isDark, colors } = useTheme();
  
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    section: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.gray,
      marginBottom: 8,
      paddingHorizontal: 16,
      textTransform: 'uppercase',
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    settingIcon: {
      marginRight: 16,
    },
    settingInfo: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 14,
      color: colors.gray,
    },
    actionText: {
      fontSize: 16,
      color: colors.primary,
    },
    actionButton: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    version: {
      textAlign: 'center',
      color: colors.gray,
      padding: 20,
      fontSize: 14,
    },
  });

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    description: string,
    action?: React.ReactNode
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {action}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        {renderSettingItem(
          isDark ? <Moon size={24} color={colors.gray} /> : <Sun size={24} color={colors.gray} />,
          'Dark Mode',
          'Toggle dark mode theme',
          <Switch value={isDark} onValueChange={toggleTheme} />
        )}
        {renderSettingItem(
          <Globe size={24} color={colors.gray} />,
          'Language',
          'Change app language',
          <Text style={styles.actionText}>English</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        {renderSettingItem(
          <Bell size={24} color={colors.gray} />,
          'Push Notifications',
          'Get notified about new messages',
          <Switch value={true} onValueChange={() => {}} />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        {renderSettingItem(
          <Lock size={24} color={colors.gray} />,
          'Privacy Settings',
          'Manage your privacy preferences',
          <TouchableOpacity>
            <Text style={styles.actionButton}>Manage</Text>
          </TouchableOpacity>
        )}
        {renderSettingItem(
          <Shield size={24} color={colors.gray} />,
          'Blocked Users',
          'Manage blocked users',
          <TouchableOpacity>
            <Text style={styles.actionButton}>View</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        {renderSettingItem(
          <HelpCircle size={24} color={colors.gray} />,
          'Help Center',
          'Get help and contact support',
          <TouchableOpacity>
            <Text style={styles.actionButton}>Open</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}
