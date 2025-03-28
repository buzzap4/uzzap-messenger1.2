import React, { useState } from 'react';
import { Image, StyleSheet, StyleProp, ImageStyle } from 'react-native';
import { DEFAULT_AVATAR_URL, FALLBACK_AVATAR_URL } from '@/lib/constants';

interface AvatarProps {
  uri?: string | null;
  username?: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export default function Avatar({ uri, username, size = 40, style }: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  
  const getAvatarUrl = () => {
    if (!hasError && uri) return uri;
    
    // First fallback - DiceBear Avataaars with username seed
    const primaryFallback = `${DEFAULT_AVATAR_URL}?seed=${username || 'default'}&backgroundColor=random`;
    
    // Second fallback - DiceBear Initials
    const secondaryFallback = `${FALLBACK_AVATAR_URL}?seed=${username || 'anonymous'}`;
    
    return hasError ? secondaryFallback : primaryFallback;
  };
  
  return (
    <Image
      source={{ uri: getAvatarUrl() }}
      onError={() => setHasError(true)}
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
    backgroundColor: '#f5f5f5', // Fallback background color
    alignSelf: 'center',        // Center the avatar horizontally
  },
});
