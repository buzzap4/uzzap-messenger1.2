import { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export type Theme = 'light' | 'dark';

export const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    primary: '#2ECC71', // Green color
    secondary: '#F0F7F4',
    border: '#E8F5E9',
    messageOwn: '#2ECC71',
    messageOther: '#F0F7F4',
    textOwn: '#FFFFFF',
    textOther: '#1A1A1A',
    success: '#27AE60',
    error: '#E74C3C',
    gray: '#95A5A6',
    cardBackground: '#FFFFFF',
    inputBackground: '#F5F5F5',
    tabBar: '#FFFFFF',
  },
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    primary: '#2ECC71', // Keep same green for consistency
    secondary: '#2C2C2E',
    border: '#2C3E50',
    messageOwn: '#2ECC71',
    messageOther: '#2C2C2E',
    textOwn: '#FFFFFF',
    textOther: '#FFFFFF',
    success: '#27AE60',
    error: '#E74C3C',
    gray: '#7F8C8D',
    cardBackground: '#1E1E1E',
    inputBackground: '#2C2C2E',
    tabBar: '#1E1E1E',
  },
};

export type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: typeof colors.light;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  colors: colors.light,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(systemColorScheme || 'light');

  useEffect(() => {
    // Update theme based on system changes
    if (systemColorScheme) {
      setTheme(systemColorScheme);
    }
  }, [systemColorScheme]);

  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: themeColors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);