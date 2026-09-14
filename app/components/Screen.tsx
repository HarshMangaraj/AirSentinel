import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../theme/tokens';

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <SafeAreaView style={[styles.base, style]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  base: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg },
});