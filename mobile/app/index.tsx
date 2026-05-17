import { colors } from "@/constants/theme";
import { useSession } from "@/hooks/useSession";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function IndexScreen() {
  const { data: session, isLoading } = useSession();

  if (!isSupabaseConfigured()) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Thiếu cấu hình Supabase</Text>
        <Text style={styles.text}>
          Kiểm tra mobile/.env: EXPO_PUBLIC_SUPABASE_URL và
          EXPO_PUBLIC_SUPABASE_ANON_KEY (hoặc EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY).
          Sau khi sửa, chạy lại: bun start --clear
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (session?.user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});
