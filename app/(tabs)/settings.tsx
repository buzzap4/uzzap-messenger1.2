import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useTheme } from '@/context/theme';
import { Bell, Moon, Sun, Globe, Lock, Shield, HelpCircle, LogOut } from 'lucide-react-native';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase'; // Ensure you have a Supabase client setup
import { useRouter } from 'expo-router'; // Import router for navigation

export default function SettingsScreen() {
  const { setTheme, isDark, colors } = useTheme();
  const { signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [helpCenterVisible, setHelpCenterVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchNotificationPreference = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) throw new Error('Failed to fetch session or user');

        const { data, error } = await supabase
          .from('user_preferences')
          .select('notifications_enabled')
          .eq('user_id', session.user.id)
          .single();

        if (error) throw error;
        setNotificationsEnabled(data?.notifications_enabled || false);
      } catch (err) {
        console.error('Error fetching notification preference:', err);
      }
    };

    fetchNotificationPreference();
  }, []);

  const toggleNotifications = async (value: boolean) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) throw new Error('Failed to fetch session or user');

      setNotificationsEnabled(value);
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          notifications_enabled: value,
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error updating notification preference:', err);
    }
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const navigateToPrivacySettings = () => {
    router.push('/privacy-settings'); // Navigate to the Privacy Settings screen
  };

  const navigateToBlockedUsers = () => {
    router.push('/blocked-users'); // Navigate to the Blocked Users screen
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16, // Add padding for better spacing
    },
    section: {
      paddingVertical: 20, // Increase padding for better spacing
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 16, // Add margin between sections
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700', // Make section titles bold
      color: colors.gray,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 1, // Add letter spacing for better readability
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12, // Add vertical padding for better touch targets
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
      lineHeight: 20, // Add line height for better readability
    },
    actionText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '500', // Add weight for emphasis
    },
    actionButton: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '700', // Make buttons bold
    },
    version: {
      textAlign: 'center',
      color: colors.gray,
      padding: 20,
      fontSize: 14,
      fontStyle: 'italic', // Add a subtle style for version text
    },
    error: {
      color: '#ff3b30',
      fontWeight: '600', // Make error messages bold
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '90%',
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 20,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    modalText: {
      fontSize: 14,
      color: colors.gray,
      textAlign: 'center',
      marginBottom: 16,
    },
    closeButton: {
      marginTop: 16,
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    closeButtonText: {
      color: colors.background,
      fontWeight: '600',
      fontSize: 16,
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
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        {renderSettingItem(
          <Lock size={24} color={colors.gray} />,
          'Privacy Settings',
          'Manage your privacy preferences',
          <TouchableOpacity onPress={navigateToPrivacySettings}>
            <Text style={styles.actionButton}>Manage</Text>
          </TouchableOpacity>
        )}
        {renderSettingItem(
          <Shield size={24} color={colors.gray} />,
          'Blocked Users',
          'Manage blocked users',
          <TouchableOpacity onPress={navigateToBlockedUsers}>
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
          <TouchableOpacity onPress={() => setHelpCenterVisible(true)}>
            <Text style={styles.actionButton}>Open</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {renderSettingItem(
          <LogOut size={24} color={colors.error} />,
          'Log Out',
          'Sign out of your account',
          <TouchableOpacity onPress={signOut}>
            <Text style={[styles.actionButton, { color: '#28A745' }]}>Log Out</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.version}>Version 1.0.0</Text>

      <Modal
        visible={helpCenterVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setHelpCenterVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Help Center</Text>
            <Text style={styles.modalText}>
              Welcome to the Uzzap Messenger Help Center. If you have any questions or need assistance, feel free to contact us.
            </Text>
            <Text style={styles.modalText}>
              <Text style={{ fontWeight: '700' }}>Creator:</Text> Uzzap Cy
            </Text>
            <Text style={styles.modalText}>
              <Text style={{ fontWeight: '700' }}>License:</Text> MIT License
            </Text>
            <Text style={styles.modalText}>
              <Text style={{ fontWeight: '700' }}>Version:</Text> 1.0.0
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setHelpCenterVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
