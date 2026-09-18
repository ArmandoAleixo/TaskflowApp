import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRoute, RouteProp } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import { useTasks } from "../context/TaskContext";
import { useToast } from "../context/ToastContext";
import type { RootStackParamList } from "../navigation/navigationRef";
import { navigate } from "../navigation/navigationRef";
import theme from "../styles/theme";

type Status = "pending" | "in_progress" | "done";
type Priority = "low" | "medium" | "high";

const STATUS_OPTIONS: { value: Status; label: string; icon: React.ComponentProps<typeof Feather>["name"]; color: string }[] = [
  { value: "pending", label: "Pendente", icon: "clock", color: theme.colors.statusPending },
  { value: "in_progress", label: "Em Andamento", icon: "loader", color: theme.colors.statusInProgress },
  { value: "done", label: "Concluída", icon: "check-circle", color: theme.colors.statusDone },
];

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low: { label: "Baixa", color: theme.colors.priorityLow },
  medium: { label: "Média", color: theme.colors.priorityMedium },
  high: { label: "Alta", color: theme.colors.priorityHigh },
};

function isStatus(value: string): value is Status {
  return value === "pending" || value === "in_progress" || value === "done";
}

function isPriority(value: string): value is Priority {
  return value === "low" || value === "medium" || value === "high";
}

export default function TaskDetailsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "TaskDetails">>();
  const { id } = route.params;
  const { getById, updateStatus, deleteTask } = useTasks();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 32 : insets.bottom;

  const [task, setTask] = useState(() => getById(id ?? ""));
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!task) {
    return (
      <View style={styles.notFound}>
        <Feather name="alert-circle" size={48} color={theme.colors.textMuted} />
        <Text style={styles.notFoundTitle}>Tarefa não encontrada</Text>
        <View style={styles.notFoundBtnWrap}>
          <Button title="Voltar ao Dashboard" onPress={navigate.toDashboard} />
        </View>
      </View>
    );
  }

  const taskStatus: Status = isStatus(task.status) ? task.status : "pending";
  const taskPriority: Priority = isPriority(task.priority) ? task.priority : "medium";
  const pc = PRIORITY_CONFIG[taskPriority];

  const handleStatusChange = async (newStatus: Status) => {
    try {
      setIsUpdatingStatus(true);
      const updated = await updateStatus(task.id, newStatus);
      if (updated) {
        setTask(updated);
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        showToast("✓ Status atualizado com sucesso!", "success", 2000);
      }
    } catch (error) {
      showToast("✗ Erro ao atualizar status", "error");
      console.error("Erro ao atualizar status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Excluir tarefa",
      "Tem certeza que deseja excluir esta tarefa? Essa ação não pode ser desfeita.",
      [
        {
          text: "Cancelar",
          onPress: () => { },
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteTask(task.id);
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              showToast("✓ Tarefa excluída com sucesso!", "success");
              setTimeout(() => navigate.toDashboard(), 500);
            } catch (error) {
              console.error("Erro ao deletar tarefa:", error);
              showToast("✗ Erro ao excluir tarefa", "error");
              setIsDeleting(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return "—";
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Retorna a string original se não for uma data válida
      }
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString; // Retorna a string original em caso de erro
    }
  };

  const infoRows = [
    { icon: "flag" as const, label: "Prioridade", value: pc.label, valueColor: pc.color },
    { icon: "tag" as const, label: "Categoria", value: task.category || "—", valueColor: theme.colors.text },
    {
      icon: "clock" as const,
      label: "Criado em",
      value: formatDate(task.createdAt),
      valueColor: theme.colors.textSecondary,
    },
    {
      icon: "calendar" as const,
      label: "Vencimento",
      value: formatDate(task.dueDate),
      valueColor: theme.colors.text,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          { paddingBottom: bottomPad + 24 },
          Platform.OS === "web" ? { maxWidth: 720, alignSelf: "center", width: "100%" } : {},
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <TouchableOpacity
            onPress={navigate.back}
            style={styles.backButton}
            activeOpacity={0.75}
          >
            <Feather name="arrow-left" size={22} color={theme.colors.textOnPrimary} />
          </TouchableOpacity>
          <Text style={styles.heroLabel}>Detalhes da tarefa</Text>
          <Text style={styles.heroTitle}>{task.title}</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionLabel}>Descrição</Text>
            <Text style={styles.descriptionText}>
              {task.description || "Sem descrição"}
            </Text>
          </View>
          <View style={styles.badgesRow}>
            <StatusBadge value={taskStatus} type="status" />
            <StatusBadge value={taskPriority} type="priority" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações</Text>
          <View style={styles.infoList}>
            {infoRows.map((row, i) => (
              <View
                key={row.label}
                style={[
                  styles.infoRow,
                  i < infoRows.length - 1 && styles.infoRowBorder,
                ]}
              >
                <View style={styles.infoLeft}>
                  <Feather
                    name={row.icon}
                    size={16}
                    color={theme.colors.textMuted}
                  />
                  <Text style={styles.infoLabel}>{row.label}</Text>
                </View>
                <Text style={[styles.infoValue, { color: row.valueColor }]}>
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Alterar Status</Text>
          <View style={styles.statusButtons}>
            {STATUS_OPTIONS.map((s) => {
              const isActive = taskStatus === s.value;
              return (
                <TouchableOpacity
                  key={s.value}
                  style={[
                    styles.statusBtn,
                    isActive && { backgroundColor: s.color, borderColor: s.color },
                    isUpdatingStatus && styles.statusBtnDisabled,
                  ]}
                  onPress={() => handleStatusChange(s.value)}
                  activeOpacity={0.75}
                  disabled={isUpdatingStatus}
                >
                  <Feather
                    name={s.icon}
                    size={16}
                    color={isActive ? "#FFFFFF" : s.color}
                    style={{ opacity: isUpdatingStatus ? 0.5 : 1 }}
                  />
                  <Text
                    style={[
                      styles.statusBtnText,
                      isActive && { color: "#FFFFFF" },
                      isUpdatingStatus && { opacity: 0.5 },
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.deleteCard, { marginBottom: bottomPad + 16 }]}>
          <Button
            title={isDeleting ? "Excluindo..." : "Excluir Tarefa"}
            variant="danger"
            onPress={handleDelete}
            loading={isDeleting}
            disabled={isDeleting || isUpdatingStatus}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  heroCard: {
    backgroundColor: theme.colors.primary,
    padding: 24,
    paddingBottom: 32,
    gap: 14,
    ...(Platform.OS === "web" ? { maxWidth: 720, alignSelf: "center", width: "100%" } : {}),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    marginBottom: 2,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: theme.fontWeight.semibold as "600",
    color: "rgba(255, 255, 255, 0.78)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: theme.fontWeight.bold as "700",
    color: theme.colors.textOnPrimary,
  },
  descriptionBox: {
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: theme.fontWeight.semibold as "600",
    color: "rgba(255, 255, 255, 0.78)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: theme.fontSize.lg,
    lineHeight: 26,
    fontWeight: theme.fontWeight.medium as "500",
    color: theme.colors.textOnPrimary,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  card: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    ...theme.shadow.sm,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoList: {
    gap: 0,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoLabel: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  statusButtons: {
    flexDirection: "row",
    gap: 8,
  },
  statusBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  statusBtnDisabled: {
    opacity: 0.6,
  },
  statusBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  deleteCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    ...theme.shadow.sm,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: theme.colors.background,
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 17,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  notFoundBtnWrap: {
    marginTop: 8,
    minWidth: 220,
  },
});
