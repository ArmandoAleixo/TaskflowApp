import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { navigationRef, RootStackParamList } from "./navigationRef";
import WelcomeScreen from "../screens/welcome";
import LoginScreen from "../screens/login";
import RegisterScreen from "../screens/register";
import DashboardScreen from "../screens/dashboard";
import CreateTaskScreen from "../screens/create-task";
import TaskDetailsScreen from "../screens/task-details";

export { navigationRef, RootStackParamList };
export { navigate, Routes } from "./navigationRef";

const Stack = createNativeStackNavigator<RootStackParamList>();

const SCREEN_OPTIONS = {
  headerStyle: { backgroundColor: "#FFFFFF" },
  headerTintColor: "#4F46E5",
  headerTitleStyle: {
    fontWeight: "600" as const,
    color: "#1E1B4B",
    fontSize: 17,
  },
  headerShadowVisible: false,
  headerBackTitle: "Voltar",
};

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Entrar" }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: "Criar Conta" }}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{ title: "Nova Tarefa" }}
      />
      <Stack.Screen
        name="TaskDetails"
        component={TaskDetailsScreen}
        options={{ title: "Detalhes da Tarefa" }}
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;
