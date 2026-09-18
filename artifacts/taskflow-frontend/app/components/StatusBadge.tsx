import React from "react";
import { StyleSheet, Text, View } from "react-native";
import theme from "../styles/theme";

type Status = "pending" | "in_progress" | "done";
type Priority = "low" | "medium" | "high";

interface StatusBadgeProps {
  value: Status | Priority;
  type?: "status" | "priority";
}

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  pending: {
    label: "Pendente",
    color: theme.colors.statusPending,
    bg: theme.colors.statusPendingBg,
  },
  in_progress: {
    label: "Em Andamento",
    color: theme.colors.statusInProgress,
    bg: theme.colors.statusInProgressBg,
  },
  done: {
    label: "Concluída",
    color: theme.colors.statusDone,
    bg: theme.colors.statusDoneBg,
  },
};

const priorityConfig: Record<Priority, { label: string; color: string; bg: string }> = {
  low: {
    label: "Baixa",
    color: theme.colors.priorityLow,
    bg: theme.colors.priorityLowBg,
  },
  medium: {
    label: "Média",
    color: theme.colors.priorityMedium,
    bg: theme.colors.priorityMediumBg,
  },
  high: {
    label: "Alta",
    color: theme.colors.priorityHigh,
    bg: theme.colors.priorityHighBg,
  },
};

export default function StatusBadge({ value, type = "status" }: StatusBadgeProps) {
  const config =
    type === "status"
      ? statusConfig[value as Status]
      : priorityConfig[value as Priority];

  if (!config) return null;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold as "600",
  },
});
