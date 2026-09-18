import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import theme from "../styles/theme";

export type ButtonVariant = "primary" | "secondary" | "danger" | "outline";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: object;
  textColor?: string;
}

const VARIANT_STYLES: Record<
  ButtonVariant,
  { bg: string; text: string; border: string; borderWidth: number }
> = {
  primary: {
    bg: theme.colors.primary,
    text: theme.colors.textOnPrimary,
    border: theme.colors.primary,
    borderWidth: 0,
  },
  secondary: {
    bg: theme.colors.surfaceElevated,
    text: theme.colors.primaryDark,
    border: theme.colors.surfaceElevated,
    borderWidth: 0,
  },
  danger: {
    bg: theme.colors.danger,
    text: "#FFFFFF",
    border: theme.colors.danger,
    borderWidth: 0,
  },
  outline: {
    bg: "transparent",
    text: theme.colors.textSecondary,
    border: theme.colors.border,
    borderWidth: 1.5,
  },
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  icon,
  style,
  textColor,
}: ButtonProps) {
  const v = VARIANT_STYLES[variant];
  const isDisabled = disabled || loading;
  const finalTextColor = textColor ?? v.text;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={isDisabled}
      style={[
        styles.button,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          borderWidth: v.borderWidth,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={finalTextColor} size="small" />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.text, { color: finalTextColor }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  text: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as "600",
  },
});
