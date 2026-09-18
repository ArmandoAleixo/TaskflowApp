import React, { useEffect } from "react";
import { Animated, StyleSheet, Text, View, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import theme from "../styles/theme";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onDismiss: () => void;
}

const TOAST_CONFIG: Record<
  ToastType,
  { bg: string; text: string; icon: React.ComponentProps<typeof Feather>["name"] }
> = {
  success: {
    bg: theme.colors.success || "#10b981",
    text: "#FFFFFF",
    icon: "check-circle",
  },
  error: {
    bg: theme.colors.danger,
    text: "#FFFFFF",
    icon: "alert-circle",
  },
  info: {
    bg: theme.colors.primary,
    text: "#FFFFFF",
    icon: "info",
  },
  warning: {
    bg: "#f59e0b",
    text: "#FFFFFF",
    icon: "alert-triangle",
  },
};

export default function Toast({
  message,
  type,
  duration = 3000,
  onDismiss,
}: ToastProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const config = TOAST_CONFIG[type];

  useEffect(() => {
    // Animate in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(onDismiss);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, fadeAnim, onDismiss]);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              }),
            },
          ],
        },
        Platform.OS === "web" ? styles.toastWeb : {},
      ]}
    >
      <View style={[styles.content, { backgroundColor: config.bg }]}>
        <Feather name={config.icon} size={18} color={config.text} />
        <Text style={[styles.message, { color: config.text }]}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 16 : 0,
  },
  toastWeb: {
    paddingTop: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    maxWidth: 400,
    ...theme.shadow.md,
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
});
