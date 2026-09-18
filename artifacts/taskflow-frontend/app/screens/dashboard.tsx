import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyState from "../components/EmptyState";
import FilterTabs from "../components/FilterTabs";
import TaskCard from "../components/TaskCard";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { useToast } from "../context/ToastContext";
import { navigate } from "../navigation/navigationRef";
import theme from "../styles/theme";

const STATUS_TABS = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendentes", icon: "clock" as const },
  { value: "in_progress", label: "Em Andamento", icon: "loader" as const },
  { value: "done", label: "Concluídas", icon: "check-circle" as const },
];

const PRIORITY_TABS = [
  { value: "all", label: "Qualquer" },
  { value: "high", label: "Alta", icon: "flag" as const },
  { value: "medium", label: "Média" },
  { value: "low", label: "Baixa" },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 48 : insets.top;
  const bottomPad = Platform.OS === "web" ? 32 : insets.bottom;

  const { user, logout } = useAuth();
  const { tasks, filterTasks, getStats, loadTasks, clearTasks } = useTasks();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // Carregar tarefas quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      const loadUserTasks = async () => {
        try {
          setIsLoadingTasks(true);
          await loadTasks();
        } catch (err) {
          console.error("Erro ao carregar tarefas:", err);
          showToast("✗ Erro ao carregar tarefas", "error");
        } finally {
          setIsLoadingTasks(false);
        }
      };

      loadUserTasks();
    }, [loadTasks, showToast])
  );

  const stats = getStats();
  const filtered = filterTasks({ status: statusFilter, priority: priorityFilter });
  const greetingName = user?.name ?? "usuário";

  const handleTaskPress = useCallback((task: typeof filtered[0]) => {
    navigate.toTaskDetails(task.id);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshKey((k) => k + 1);
    try {
      setIsLoadingTasks(true);
      await loadTasks();
      showToast("✓ Tarefas atualizadas!", "success", 1500);
    } catch (err) {
      console.error("Erro ao atualizar tarefas:", err);
      showToast("✗ Erro ao atualizar tarefas", "error");
    } finally {
      setIsLoadingTasks(false);
    }
  }, [loadTasks, showToast]);

  const handleLogout = async () => {
    try {
      clearTasks();
      await logout();
      navigate.toWelcome();
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
      showToast("✗ Erro ao fazer logout", "error");
    }
  };

  const ListHeader = (
    <View>
      <View style={[styles.topBar, { paddingTop: topPad + 12 }]}>
        <View style={styles.greetingWrap}>
          <Text style={styles.greeting}>Olá, {greetingName}!</Text>
          <Text style={styles.subtitle}>Organize suas tarefas de hoje.</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.createTaskBtn}
            onPress={navigate.toCreateTask}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, styles.logoutBtn]}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Feather name="log-out" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: "Total", value: stats.total, color: theme.colors.primary },
          {
            label: "Pendentes",
            value: stats.pending,
            color: theme.colors.statusPending,
          },
          {
            label: "Em Andamento",
            value: stats.in_progress,
            color: theme.colors.statusInProgress,
          },
          { label: "Concluídas", value: stats.done, color: theme.colors.statusDone },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statNumber, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.filtersSection}>
        <FilterTabs
          label="Status"
          tabs={STATUS_TABS}
          active={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            handleRefresh();
          }}
        />
        <FilterTabs
          label="Prioridade"
          tabs={PRIORITY_TABS}
          active={priorityFilter}
          onChange={(v) => {
            setPriorityFilter(v);
            handleRefresh();
          }}
        />
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          {filtered.length} {filtered.length === 1 ? "tarefa" : "tarefas"}
        </Text>
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={isLoadingTasks}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather
            name="refresh-cw"
            size={16}
            color={theme.colors.textMuted}
            style={{ opacity: isLoadingTasks ? 0.5 : 1 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isLoadingTasks && tasks.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando suas tarefas...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard task={item} onPress={handleTaskPress} />
          )}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <EmptyState
              title="Nenhuma tarefa encontrada"
              message="Tente ajustar os filtros ou crie uma nova tarefa"
              buttonTitle="Criar primeira tarefa"
              onButtonPress={navigate.toCreateTask}
            />
          }
          contentContainerStyle={[
            { paddingBottom: bottomPad + 24 },
            Platform.OS === "web"
              ? { maxWidth: 720, alignSelf: "center", width: "100%" }
              : {},
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          extraData={refreshKey}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: theme.colors.primary,
  },
  greetingWrap: {
    flex: 1,
    paddingRight: 12,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    flexShrink: 1,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
    lineHeight: 20,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  createTaskBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.statusDone,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    gap: 4,
    ...theme.shadow.md,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: 2,
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 16,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 8,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
});
