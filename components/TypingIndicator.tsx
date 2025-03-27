import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '@/context/theme';

export default function TypingIndicator() {
  const { colors } = useTheme();

  const dotRefs = [
    useRef(new Animated.Value(0)),
    useRef(new Animated.Value(0)),
    useRef(new Animated.Value(0)),
  ];

  const dots = dotRefs.map(ref => ref.current);

  const animations = dots.map((dot, i) => {
    return Animated.loop(
      Animated.sequence([
        Animated.delay(i * 200),
        Animated.timing(dot, {          
          toValue: 1,

          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    )
  });

  useEffect(() => {
    Animated.parallel(animations).start();
  }, [animations]);

  return (
    <View style={styles.container}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: colors.text },
            { transform: [{ scale: dot.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }] },
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
