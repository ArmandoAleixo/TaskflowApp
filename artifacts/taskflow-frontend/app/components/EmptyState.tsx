import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import theme from "../styles/theme";
import Button from "./Button";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

interface EmptyStateProps {
  icon?: FeatherName;
  title: string;
  message: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
}

export default function EmptyState({
  icon = "inbox",
  title,
  message,
  buttonTitle,
  onButtonPress,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Feather name={icon} size={32} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {buttonTitle && onButtonPress ? (
        <View style={styles.buttonWrap}>
          <Button title={buttonTitle} onPress={onButtonPress} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold as "600",
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  message: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonWrap: {
    marginTop: theme.spacing.md,
    minWidth: 220,
  },
});
