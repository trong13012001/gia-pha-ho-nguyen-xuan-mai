import { useScreenInsets } from "@/hooks/useScreenInsets";
import { AnimatedPressable } from "@/components/AnimatedPressable";
import { FadeIn } from "@/components/FadeIn";
import { colors } from "@/constants/theme";
import { queryKeys } from "@/constants/queryKeys";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginScreen() {
  const { paddingStyle } = useScreenInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  const signIn = useMutation({
    mutationFn: async () => {
      const supabase = getSupabaseClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;
      return data.session;
    },
    onSuccess: async (session) => {
      if (!session?.user) {
        setError("Đăng nhập thất bại.");
        return;
      }
      setAuth({
        userId: session.user.id,
        email: session.user.email ?? email,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
      router.replace("/(tabs)");
    },
    onError: (err: Error) => {
      setError(err.message || "Không thể đăng nhập.");
    },
  });

  return (
    <View style={[styles.screen, paddingStyle]}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FadeIn style={styles.card}>
        <Text style={styles.title}>
          {process.env.EXPO_PUBLIC_SITE_NAME ?? "Gia Phả"}
        </Text>
        <Text style={styles.subtitle}>Đăng nhập để xem gia phả dòng họ</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AnimatedPressable
          style={[styles.button, signIn.isPending && styles.buttonDisabled]}
          disabled={signIn.isPending}
          onPress={() => {
            setError(null);
            signIn.mutate();
          }}
        >
          {signIn.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng nhập</Text>
          )}
        </AnimatedPressable>
      </FadeIn>
    </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  error: {
    color: colors.danger,
    marginBottom: 8,
    fontSize: 13,
  },
});
