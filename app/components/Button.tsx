import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, type, spacing, radius } from '../theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

export function Button({ label, onPress, loading, variant = 'primary' }: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        pressed && { opacity: 0.85 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.paper : colors.signal} />
      ) : (
        <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelSecondary]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.signal },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  label: { ...type.label },
  labelPrimary: { color: colors.paper },
  labelSecondary: { color: colors.ink },
});