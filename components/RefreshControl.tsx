import React from 'react';
import { RefreshControl as RNRefreshControl, RefreshControlProps } from 'react-native';

interface Props extends Omit<RefreshControlProps, 'refreshing' | 'onRefresh'> {
  refreshing: boolean;
  onRefresh: () => Promise<void>;
}

export const RefreshControl: React.FC<Props> = ({ refreshing, onRefresh, ...props }) => {
  return (
    <RNRefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={['#4285F4']} // Android
      tintColor="#4285F4" // iOS
      {...props}
    />
  );
};
