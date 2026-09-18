import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Task } from "../context/TaskContext";
import theme from "../styles/theme";
import StatusBadge from "./StatusBadge";

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
}

const priorityDot: Record<string, string> = {
  high: theme.colors.priorityHigh,
  medium: theme.colors.priorityMedium,
  low: theme.colors.priorityLow,
};

export default function TaskCard({ task, onPress }: TaskCardProps) {
  const isDone = task.status === "done";

  return (
    <TouchableOpacity
      style={[styles.card, isDone && styles.cardDone]}
      onPress={() => onPress(task)}
      activeOpacity={0.75}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View
            style={[
              styles.priorityDot,
              { backgroundColor: priorityDot[task.priority] ?? theme.colors.textMuted },
            ]}
          />
          <Text
            style={[styles.title, isDone && styles.titleDone]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={theme.colors.textMuted} />
      </View>

      {task.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <StatusBadge value={task.status} type="status" />
        <View style={styles.meta}>
          {task.category ? (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{task.category}</Text>
            </View>
          ) : null}
          {task.dueDate ? (
            <View style={styles.dateRow}>
              <Feather name="calendar" size={11} color={theme.colors.textMuted} />
              <Text style={styles.dateText}>{task.dueDate}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadow.sm,
    ...(Platform.OS === "web" ? { maxWidth: 680, alignSelf: "center", width: "100%" } : {}),
  },
  cardDone: {
    opacity: 0.7,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.sm,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 2,
    flexShrink: 0,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as "600",
    color: theme.colors.text,
    flex: 1,
    lineHeight: 22,
  },
  titleDone: {
    textDecorationLine: "line-through",
    color: theme.colors.textMuted,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.md + 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceElevated,
  },
  categoryText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium as "500",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  dateText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
});
