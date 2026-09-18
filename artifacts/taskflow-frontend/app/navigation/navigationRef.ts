import { createNavigationContainerRef } from "@react-navigation/native";

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  CreateTask: undefined;
  TaskDetails: { id: string };
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const Routes = {
  WELCOME: "Welcome" as const,
  LOGIN: "Login" as const,
  REGISTER: "Register" as const,
  DASHBOARD: "Dashboard" as const,
  CREATE_TASK: "CreateTask" as const,
  TASK_DETAILS: "TaskDetails" as const,
};

export const navigate = {
  toWelcome: () => {
    if (navigationRef.isReady()) {
      navigationRef.reset({ index: 0, routes: [{ name: "Welcome" }] });
    }
  },
  toLogin: () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate("Login");
    }
  },
  toRegister: () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate("Register");
    }
  },
  toDashboard: () => {
    if (navigationRef.isReady()) {
      navigationRef.reset({ index: 0, routes: [{ name: "Dashboard" }] });
    }
  },
  toCreateTask: () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate("CreateTask");
    }
  },
  toTaskDetails: (id: string) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate("TaskDetails", { id });
    }
  },
  back: () => {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  },
};

export default navigate;
