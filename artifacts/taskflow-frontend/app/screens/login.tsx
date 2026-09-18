import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../components/Button";
import Header from "../components/Header";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { navigate } from "../navigation/navigationRef";
import theme from "../styles/theme";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email.trim()) {
      setError("Por favor, informe seu e-mail.");
      showToast("E-mail é obrigatório", "error");
      return;
    }
    if (!password.trim()) {
      setError("Por favor, informe sua senha.");
      showToast("Senha é obrigatória", "error");
      return;
    }
    try {
      setLoading(true);
      await login(email.trim(), password);
      showToast("✓ Login realizado com sucesso!", "success");
      setTimeout(() => navigate.toDashboard(), 500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao fazer login";
      setError(errorMsg);
      showToast("✗ " + errorMsg, "error");
    } finally {
      setLoading(false);
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
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Header
          title="Bem-vindo de volta!"
          subtitle="Acesse sua conta para gerenciar suas tarefas"
        />

        <View style={styles.form}>
          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            icon="mail"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Sua senha"
            icon="lock"
            secureTextEntry
          />

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
             
            </Text>
          </View>

          <Button
            title={loading ? "Entrando..." : "Entrar"}
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem uma conta? </Text>
          <TouchableOpacity onPress={navigate.toRegister}>
            <Text style={styles.footerLink}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    ...(Platform.OS === "web" ? { maxWidth: 720, alignSelf: "center", width: "100%" } : {}),
  },
  form: {
    gap: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  errorBox: {
    backgroundColor: theme.colors.dangerLight,
    padding: 12,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.danger,
  },
  infoBox: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: 12,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  footerLink: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
