import { colors } from "@/constants/theme";
import { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

export function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function FormTextInput({
  label,
  value,
  onChangeText,
  error,
  ...rest
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
} & TextInputProps) {
  return (
    <FormField label={label} error={error}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        placeholderTextColor={colors.textMuted}
        {...rest}
      />
    </FormField>
  );
}

export function FormNumberInput({
  label,
  value,
  onChangeValue,
  error,
  placeholder,
}: {
  label: string;
  value: number | "";
  onChangeValue: (v: number | "") => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <FormField label={label} error={error}>
      <TextInput
        value={value === "" ? "" : String(value)}
        onChangeText={(text) => {
          const trimmed = text.trim();
          if (trimmed === "") {
            onChangeValue("");
            return;
          }
          const num = Number(trimmed);
          if (!Number.isNaN(num)) onChangeValue(num);
        }}
        keyboardType="number-pad"
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
      />
    </FormField>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  error: { marginTop: 4, fontSize: 12, color: colors.danger },
});
