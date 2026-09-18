import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
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
import Header from "../components/Header";
import Input from "../components/Input";
import { useTasks, type TaskInput } from "../context/TaskContext";
import { useToast } from "../context/ToastContext";
import { navigate } from "../navigation/navigationRef";
import theme from "../styles/theme";
import { getAutomaticPriority } from "../utils/priority";

const STATUSES = [
  { value: "pending", label: "Pendente", color: theme.colors.statusPending },
  { value: "in_progress", label: "Em Andamento", color: theme.colors.statusInProgress },
  { value: "done", label: "Concluída", color: theme.colors.statusDone },
];

const CATEGORIES = [
  "Acadêmico",
  "Pessoal",
  "Desenvolvimento",
  "Saúde",
  "Trabalho",
  "Outro",
];

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDisplayDate = (dateKey: string) => {
  if (!dateKey) return "Selecionar data";
  const [year, month, day] = dateKey.split("-");
  return `${day}/${month}/${year}`;
};

const getMonthDays = (year: number, month: number) => {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
};

export default function CreateTaskScreen() {
  const insets = useSafeAreaInsets();
  const { createTask } = useTasks();
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [dueDate, setDueDate] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [category, setCategory] = useState("Pessoal");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const computedPriority = getAutomaticPriority(
    dueDate,
    "medium"
  );
  const todayKey = toDateKey(new Date());
  const monthDays = getMonthDays(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth()
  );
  const isCurrentMonth =
    visibleMonth.getFullYear() === new Date().getFullYear() &&
    visibleMonth.getMonth() === new Date().getMonth();

  const handleOpenCalendar = () => {
    const baseDate = dueDate ? parseDateKey(dueDate) : new Date();
    setVisibleMonth(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));
    setIsCalendarOpen(true);
  };

  const handleSelectDate = (day: number) => {
    const selected = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      day
    );
    const dateKey = toDateKey(selected);
    if (dateKey < todayKey) return;
    setDueDate(dateKey);
    setIsCalendarOpen(false);
  };

  const changeMonth = (amount: number) => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + amount, 1)
    );
  };

  const handleCreate = async () => {
    setError("");
    if (!title.trim()) {
      setError("O título é obrigatório.");
      showToast("O título é obrigatório", "error");
      return;
    }
    if (!description.trim()) {
      setError("A descrição é obrigatória.");
      showToast("A descrição é obrigatória", "error");
      return;
    }
    if (dueDate && dueDate < todayKey) {
      setError("A data de vencimento nao pode estar no passado.");
      showToast("Escolha uma data de hoje em diante", "error");
      return;
    }
    try {
      setIsLoading(true);
      await createTask({
        title: title.trim(),
        description: description.trim(),
        priority: computedPriority,
        status: status as TaskInput["status"],
        dueDate: dueDate.trim() || undefined,
        category,
      });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      showToast("✓ Tarefa criada com sucesso!", "success");
      setTimeout(() => navigate.toDashboard(), 500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao criar tarefa";
      setError(errorMsg);
      showToast("✗ Erro ao criar tarefa", "error");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              (Platform.OS === "web" ? 32 : insets.bottom) + 32,
          },
          Platform.OS === "web" ? { maxWidth: 720, alignSelf: "center", width: "100%" } : {},
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Header title="Nova Tarefa" subtitle="Preencha os dados da tarefa" />

        <View style={styles.form}>
          <Input
            label="Título *"
            value={title}
            onChangeText={setTitle}
            placeholder="O que precisa ser feito?"
            maxLength={100}
            error={error && !title.trim() ? error : undefined}
          />

          <Input
            label="Descrição *"
            value={description}
            onChangeText={setDescription}
            placeholder="Adicione mais detalhes sobre a tarefa..."
            multiline
            numberOfLines={4}
            maxLength={500}
            error={error && title.trim() && !description.trim() ? error : undefined}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.priorityRow}>
              {STATUSES.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[
                    styles.priorityBtn,
                    status === s.value && {
                      backgroundColor: s.color,
                      borderColor: s.color,
                    },
                  ]}
                  onPress={() => setStatus(s.value)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.priorityLabel,
                      status === s.value && styles.priorityLabelActive,
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categoria</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryBtn,
                    category === cat && styles.categoryBtnActive,
                  ]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.categoryLabel,
                      category === cat && styles.categoryLabelActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data de Vencimento</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={handleOpenCalendar}
              activeOpacity={0.75}
            >
              <View style={styles.dateButtonContent}>
                <Feather name="calendar" size={18} color={theme.colors.primary} />
                <Text
                  style={[
                    styles.dateButtonText,
                    !dueDate && styles.dateButtonPlaceholder,
                  ]}
                >
                  {formatDisplayDate(dueDate)}
                </Text>
              </View>
              <Feather name="chevron-down" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={navigate.back}
              style={{ flex: 1 }}
              disabled={isLoading}
            />
            <Button
              title={isLoading ? "Criando..." : "Criar Tarefa"}
              variant="primary"
              onPress={handleCreate}
              icon={<Feather name="plus" size={18} color="#FFFFFF" />}
              style={{ flex: 2 }}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={isCalendarOpen}
        onRequestClose={() => setIsCalendarOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarSheet}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={[
                  styles.calendarNavButton,
                  isCurrentMonth && styles.calendarNavButtonDisabled,
                ]}
                onPress={() => changeMonth(-1)}
                disabled={isCurrentMonth}
                activeOpacity={0.75}
              >
                <Feather
                  name="chevron-left"
                  size={22}
                  color={isCurrentMonth ? theme.colors.textMuted : theme.colors.text}
                />
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>
                {MONTHS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
              </Text>
              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={() => changeMonth(1)}
                activeOpacity={0.75}
              >
                <Feather name="chevron-right" size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekdayGrid}>
              {WEEKDAYS.map((weekday, index) => (
                <Text key={`${weekday}-${index}`} style={styles.weekdayText}>
                  {weekday}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {monthDays.map((day, index) => {
                if (!day) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const dateKey = toDateKey(
                  new Date(
                    visibleMonth.getFullYear(),
                    visibleMonth.getMonth(),
                    day
                  )
                );
                const isPast = dateKey < todayKey;
                const isSelected = dateKey === dueDate;
                const isToday = dateKey === todayKey;

                return (
                  <TouchableOpacity
                    key={dateKey}
                    style={[
                      styles.dayCell,
                      isToday && styles.dayToday,
                      isSelected && styles.daySelected,
                      isPast && styles.dayDisabled,
                    ]}
                    onPress={() => handleSelectDate(day)}
                    disabled={isPast}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isToday && styles.dayTodayText,
                        isSelected && styles.daySelectedText,
                        isPast && styles.dayDisabledText,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.calendarActions}>
              <Button
                title="Limpar"
                variant="outline"
                onPress={() => {
                  setDueDate("");
                  setIsCalendarOpen(false);
                }}
                style={{ flex: 1 }}
              />
              <Button
                title="Fechar"
                variant="primary"
                onPress={() => setIsCalendarOpen(false)}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    ...(Platform.OS === "web" ? { maxWidth: 720, alignSelf: "center", width: "100%" } : {}),
  },
  form: {
    gap: 16,
    marginTop: 8,
  },
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  charCount: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: "right",
    marginTop: -12,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
  },
  priorityBtn: {
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
  priorityLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  priorityLabelActive: {
    color: "#FFFFFF",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  categoryBtnActive: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.primary,
  },
  categoryLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  categoryLabelActive: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  dateButton: {
    minHeight: 52,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  dateButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium as "500",
  },
  dateButtonPlaceholder: {
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeight.regular as "400",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    padding: 20,
  },
  calendarSheet: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadow.lg,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as "700",
    color: theme.colors.text,
  },
  calendarNavButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceElevated,
  },
  calendarNavButtonDisabled: {
    opacity: 0.45,
  },
  weekdayGrid: {
    flexDirection: "row",
  },
  weekdayText: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold as "600",
    color: theme.colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.full,
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  daySelected: {
    backgroundColor: theme.colors.primary,
  },
  dayDisabled: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium as "500",
    color: theme.colors.text,
  },
  dayTodayText: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold as "700",
  },
  daySelectedText: {
    color: theme.colors.textOnPrimary,
    fontWeight: theme.fontWeight.bold as "700",
  },
  dayDisabledText: {
    color: theme.colors.textMuted,
  },
  calendarActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
});
