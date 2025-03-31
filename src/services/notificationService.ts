import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

// Configure notifications settings
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotifications = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      throw new Error('Permission not granted!');
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    // Save token to user's profile in Supabase
    const { error } = await supabase.from('profiles')
      .update({ push_token: token })
      .eq('id', (await supabase.auth.getUser()).data.user?.id);

    if (error) throw error;

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for notifications:', error);
    return null;
  }
};

export const sendPushNotification = async (expoPushToken: string, title: string, body: string) => {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: expoPushToken,
      title,
      body,
      sound: 'default',
    }),
  });
};
