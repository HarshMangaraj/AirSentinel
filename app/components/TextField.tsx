import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { type as typeScale, spacing, radius } from '../theme/tokens';

type Props = TextInputProps & { label: string; error?: string };

export function TextField({ label, error, style, ...rest }: Props) {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={[typeScale.label, { color: colors.ink, marginBottom: spacing.xs }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { borderColor: colors.glassBorder, color: colors.ink, backgroundColor: '#FFFFFF' },
          style,
        ]}
        placeholderTextColor={colors.muted}
        {...rest}
      />
      {error ? <Text style={[typeScale.small, { color: colors.danger, marginTop: spacing.xs }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
  },
});