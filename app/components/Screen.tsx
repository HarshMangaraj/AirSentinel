import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/tokens';

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors } = useTheme();
  return <SafeAreaView style={[styles.base, { backgroundColor: colors.paper }, style]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  base: { flex: 1, padding: spacing.lg },
});