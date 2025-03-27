import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '@/context/theme';

export default function TypingIndicator() {
  const { colors } = useTheme();
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.sequence([
        Animated.delay(i * 200),
        Animated.loop(
          Animated.sequence([
            Animated.spring(dot, { toValue: 1, useNativeDriver: true }),
            Animated.spring(dot, { toValue: 0, useNativeDriver: true }),
          ])
        ),
      ])
    );

    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={styles.container}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: colors.text },
            { transform: [{ scale: dot }] },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
});
