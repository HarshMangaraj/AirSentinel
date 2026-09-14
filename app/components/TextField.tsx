import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors, type, spacing, radius } from '../theme/tokens';

type Props = TextInputProps & { label: string; error?: string };

export function TextField({ label, error, style, ...rest }: Props) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.muted}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...type.label, color: colors.ink, marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: '#FFFFFF',
  },
  error: { ...type.small, color: colors.danger, marginTop: spacing.xs },
});