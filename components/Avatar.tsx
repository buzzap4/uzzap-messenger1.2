import React from 'react';
import { Image, StyleSheet, StyleProp, ImageStyle } from 'react-native';

interface AvatarProps {
  uri?: string | null;
  username?: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export default function Avatar({ uri, username, size = 40, style }: AvatarProps) {
  const fallbackUri = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || 'default'}&backgroundColor=random`;
  
  return (
    <Image
      source={{ uri: uri || fallbackUri }}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
        style
      ]}
    />
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#f5f5f5',
  },
});
