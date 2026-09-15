import { BlurView } from 'expo-blur';
import { StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius } from '../theme/tokens';

type Props = { children: React.ReactNode; style?: ViewStyle; intensity?: number };

export function GlassCard({ children, style, intensity = 40 }: Props) {
  const { colors } = useTheme();
  return (
    <BlurView intensity={intensity} tint={colors.blurTint} style={[
      styles.card,
      { backgroundColor: colors.glass, borderColor: colors.glassBorder },
      style,
    ]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden', padding: 16 },
});