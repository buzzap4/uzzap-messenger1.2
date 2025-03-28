import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Toast, { ToastType } from '@/components/Toast';
import { Animated } from 'react-native';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const [visible, setVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showToast = useCallback((newMessage: string, newType: ToastType = 'info') => {
    setMessage(newMessage);
    setType(newType);
    setVisible(true);

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  }, [fadeAnim]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <Toast
          message={message}
          type={type}
          onClose={() => setVisible(false)}
          style={{ opacity: fadeAnim }}
        />
      )}
    </ToastContext.Provider>
  );
}
