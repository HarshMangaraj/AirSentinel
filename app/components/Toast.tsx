import { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/tokens';

export function Toast({ message, visible }: { message: string; visible: boolean }) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : -80,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [visible]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        { backgroundColor: colors.signal, transform: [{ translateY }], opacity: visible ? 1 : 0 },
      ]}
    >
      <Feather name="check-circle" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    zIndex: 999,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});