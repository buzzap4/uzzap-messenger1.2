import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class WebStorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return Promise.resolve(localStorage.getItem(key)); // Wrap in Promise for async behavior
    } catch (error) {
      console.error(`Error getting item with key "${key}":`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      return Promise.resolve(localStorage.setItem(key, value)); // Wrap in Promise for async behavior
    } catch (error) {
      console.error(`Error setting item with key "${key}":`, error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      return Promise.resolve(localStorage.removeItem(key)); // Wrap in Promise for async behavior
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
