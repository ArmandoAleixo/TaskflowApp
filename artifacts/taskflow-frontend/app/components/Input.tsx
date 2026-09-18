import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import theme from "../styles/theme";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

interface InputProps extends Omit<TextInputProps, "onChangeText"> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  icon?: FeatherName;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
}

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  icon,
  multiline = false,
  numberOfLines,
  maxLength,
  keyboardType,
  autoCapitalize,
  autoCorrect = false,
  textAlignVertical,
  ...rest
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const hasError = !!error;
  const isPassword = secureTextEntry;
  const isRevealed = isPassword && showPassword;

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputContainer,
          hasError && styles.inputContainerError,
          multiline && styles.inputContainerMultiline,
        ]}
      >
        {icon ? (
          <Feather
            name={icon}
            size={18}
            color={theme.colors.textMuted}
            style={styles.leftIcon}
          />
        ) : null}
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            isPassword && styles.inputWithAction,
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword ? !isRevealed : false}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          textAlignVertical={textAlignVertical}
          {...rest}
        />
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn}
          >
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              size={18}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.xs,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as "600",
    color: theme.colors.text,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  inputContainerError: {
    borderColor: theme.colors.danger,
  },
  inputContainerMultiline: {
    alignItems: "flex-start",
    paddingTop: theme.spacing.sm,
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: 2,
    textAlignVertical: "top",
  },
  inputWithAction: {
    paddingRight: theme.spacing.sm,
  },
  eyeBtn: {
    padding: theme.spacing.xs,
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.danger,
  },
});
