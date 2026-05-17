import { AnimatedPressable } from "@/components/AnimatedPressable";
import { FadeIn } from "@/components/FadeIn";
import { TabPageLayout, useTabListPadding } from "@/components/TabPageLayout";
import { colors } from "@/constants/theme";
import { queryKeys } from "@/constants/queryKeys";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import {
  cancelAllEventNotifications,
  ensureNotificationPermissions,
  syncEventNotifications,
} from "@/lib/notifications";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCustomEventsQuery } from "@/hooks/useCustomEventsQuery";
import { usePersonsForEventsQuery } from "@/hooks/usePersonsQuery";
import { UserRole } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function roleLabel(role: UserRole | undefined): string {
  switch (role) {
    case "admin":
      return "Quản trị viên";
    case "editor":
      return "Biên tập viên";
    default:
      return "Thành viên";
  }
}

function roleBadgeStyle(role: UserRole | undefined) {
  switch (role) {
    case "admin":
      return { bg: "#fff1f2", text: "#be123c", border: "#fecdd3" };
    case "editor":
      return { bg: colors.primarySoft, text: colors.primary, border: "#fcd34d" };
    default:
      return { bg: "#f5f5f4", text: colors.textMuted, border: colors.border };
  }
}

export default function SettingsScreen() {
  const email = useAuthStore((s) => s.email);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { data: profile } = useProfileQuery();
  const queryClient = useQueryClient();
  const listPadding = useTabListPadding();
  const personsQuery = usePersonsForEventsQuery();
  const customEventsQuery = useCustomEventsQuery();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const badge = roleBadgeStyle(profile?.role);
  const initial = (email ?? "?").charAt(0).toUpperCase();

  const signOut = async () => {
    setBusy(true);
    await cancelAllEventNotifications();
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    clearAuth();
    await queryClient.invalidateQueries({ queryKey: queryKeys.session });
    setBusy(false);
    router.replace("/login");
  };

  const refreshNotifications = async () => {
    setBusy(true);
    setMessage(null);
    const granted = await ensureNotificationPermissions();
    if (!granted) {
      setMessage("Cần cấp quyền thông báo trong cài đặt hệ thống.");
      setBusy(false);
      return;
    }
    if (!personsQuery.data) {
      setMessage("Chưa có dữ liệu thành viên.");
      setBusy(false);
      return;
    }
    const { scheduled, cancelled } = await syncEventNotifications(
      personsQuery.data,
      customEventsQuery.data ?? [],
    );
    setMessage(
      `Đã hủy ${cancelled} thông báo cũ, lên lịch ${scheduled} thông báo mới.`,
    );
    setBusy(false);
  };

  return (
    <TabPageLayout
      title="Cài đặt"
      subtitle="Tài khoản và thông báo"
    >
      <ScrollView
        contentContainerStyle={[listPadding, styles.scroll]}
        showsVerticalScrollIndicator={false}
      >
        <FadeIn>
          <View style={styles.card}>
            <View style={styles.accountRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <View style={styles.accountBody}>
                <Text style={styles.accountLabel}>Tài khoản</Text>
                <Text style={styles.email} numberOfLines={2}>
                  {email ?? "—"}
                </Text>
                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor: badge.bg,
                      borderColor: badge.border,
                    },
                  ]}
                >
                  <Text style={[styles.roleText, { color: badge.text }]}>
                    {roleLabel(profile?.role)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={60}>
          <Text style={styles.sectionTitle}>Thông báo</Text>
          <View style={styles.card}>
            <View style={styles.rowTop}>
              <View style={styles.iconWrap}>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>Nhắc sự kiện</Text>
                <Text style={styles.rowDesc}>
                  Tự động đồng bộ khi có thay đổi ngày sinh, ngày mất hoặc sự
                  kiện. Nhắc lúc 8:00, từ 3 ngày trước đến đúng ngày.
                </Text>
              </View>
            </View>

            <AnimatedPressable
              style={[styles.actionBtn, busy && styles.actionBtnDisabled]}
              onPress={refreshNotifications}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Ionicons
                    name="refresh-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.actionBtnText}>Lên lịch lại thông báo</Text>
                </>
              )}
            </AnimatedPressable>

            {message ? (
              <Text style={styles.message}>{message}</Text>
            ) : null}
          </View>
        </FadeIn>

        <FadeIn delay={120}>
          <View style={styles.card}>
            <AnimatedPressable
              style={styles.logoutRow}
              onPress={signOut}
              disabled={busy}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              <Text style={styles.logoutText}>
                {busy ? "Đang xử lý…" : "Đăng xuất"}
              </Text>
            </AnimatedPressable>
          </View>
        </FadeIn>
      </ScrollView>
    </TabPageLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, gap: 0 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fde68a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fcd34d",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#b45309",
  },
  accountBody: { flex: 1, minWidth: 0 },
  accountLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginTop: 2,
    lineHeight: 22,
  },
  roleBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  rowTop: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: { flex: 1 },
  rowTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  rowDesc: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  actionBtnDisabled: { opacity: 0.7 },
  actionBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  message: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 19,
    color: colors.success,
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.danger,
  },
});
