import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import theme from "../styles/theme";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

export interface FilterTab {
  value: string;
  label: string;
  icon?: FeatherName;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  active: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function FilterTabs({
  tabs,
  active,
  onChange,
  label,
}: FilterTabsProps) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.value;
          return (
            <TouchableOpacity
              key={tab.value}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onChange(tab.value)}
              activeOpacity={0.7}
            >
              {tab.icon ? (
                <Feather
                  name={tab.icon}
                  size={14}
                  color={
                    isActive
                      ? theme.colors.textOnPrimary
                      : theme.colors.textSecondary
                  }
                  style={styles.tabIcon}
                />
              ) : null}
              <Text
                style={[
                  styles.tabText,
                  isActive && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.sm,
    ...(Platform.OS === "web" ? { maxWidth: 720, alignSelf: "center", width: "100%" } : {}),
  },
  label: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold as "600",
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabIcon: {
    marginTop: 1,
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as "500",
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.textOnPrimary,
  },
});
