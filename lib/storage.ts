import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class WebStorageAdapter {
  async getItem(key: string) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item with key "${key}":`, error);
      return null;
    }
  }

  async setItem(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item with key "${key}":`, error);
    }
  }

  async removeItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item with key "${key}":`, error);
    }
  }
}

export const storage = Platform.OS === 'web' ? new WebStorageAdapter() : {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};
