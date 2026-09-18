import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../components/Button";
import { navigate } from "../navigation/navigationRef";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

interface Feature {
  icon: FeatherName;
  text: string;
}

const FEATURES: Feature[] = [
  { icon: "check-circle", text: "Crie e gerencie tarefas facilmente" },
  { icon: "bar-chart-2", text: "Filtre por status e prioridade" },
  { icon: "zap", text: "Acompanhe seu progresso diário" },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 48 : insets.top;
  const bottomPad = Platform.OS === "web" ? 32 : insets.bottom;

  return (
    <LinearGradient
      colors={["#1E3A8A", "#2563EB", "#3B82F6"]}
      style={styles.gradient}
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: topPad + 32,
            paddingBottom: bottomPad + 24,
          },
        ]}
      >
        <View style={styles.hero}>
          <View style={styles.iconWrapper}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>TaskFlow</Text>
          <Text style={styles.tagline}>
            Organize suas tarefas, alcance seus objetivos
          </Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map((item) => (
            <View key={item.text} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Feather name={item.icon} size={18} color="#2563EB" />
              </View>
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Button
            title="Entrar"
            variant="secondary"
            onPress={navigate.toLogin}
          />
          <Button
            title="Criar Conta"
            variant="outline"
            onPress={navigate.toRegister}
            textColor="#FFFFFF"
            style={{
              borderColor: "rgba(255,255,255,0.4)",
            }}
          />
          <Text style={styles.disclaimer}>
            
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    ...(Platform.OS === "web" ? { maxWidth: 720, alignSelf: "center", width: "100%" } : {}),
  },
  hero: {
    alignItems: "center",
    marginTop: 24,
  },
  iconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  icon: {
    width: 70,
    height: 70,
    borderRadius: 16,
  },
  appName: {
    fontSize: 38,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 17,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 26,
  },
  features: {
    gap: 16,
    paddingHorizontal: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 14,
    borderRadius: 14,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    flex: 1,
    fontWeight: "500",
  },
  actions: {
    gap: 12,
  },
  disclaimer: {
    textAlign: "center",
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginTop: 8,
  },
});
