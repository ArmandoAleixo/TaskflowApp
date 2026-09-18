const theme = {
  colors: {
    primary: "#2563EB",
    primaryDark: "#1E3A8A",
    primaryLight: "#DBEAFE",

    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceElevated: "#EFF6FF",

    text: "#334155",
    textSecondary: "#64748B",
    textMuted: "#94A3B8",
    textOnPrimary: "#FFFFFF",

    border: "#E2E8F0",
    borderLight: "#DBEAFE",

    success: "#22C55E",
    successLight: "#DCFCE7",
    warning: "#F59E0B",
    warningLight: "#FEF3C7",
    danger: "#EF4444",
    dangerLight: "#FEE2E2",

    statusPending: "#F59E0B",
    statusPendingBg: "#FEF3C7",
    statusInProgress: "#2563EB",
    statusInProgressBg: "#DBEAFE",
    statusDone: "#22C55E",
    statusDoneBg: "#DCFCE7",

    priorityLow: "#22C55E",
    priorityLowBg: "#DCFCE7",
    priorityMedium: "#F59E0B",
    priorityMediumBg: "#FEF3C7",
    priorityHigh: "#EF4444",
    priorityHighBg: "#FEE2E2",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },

  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  shadow: {
    sm: {
      shadowColor: "#1E3A8A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: "#1E3A8A",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: "#1E3A8A",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  statusLabels: {
    pending: "Pendente",
    in_progress: "Em Andamento",
    done: "Concluída",
  },

  priorityLabels: {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
  },
};

export default theme;
