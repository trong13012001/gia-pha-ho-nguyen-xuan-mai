import { MemberForm } from "@/components/member/MemberForm";
import { StackPageLayout } from "@/components/StackPageLayout";
import { colors } from "@/constants/theme";
import { useCanEditMembers } from "@/hooks/useCanEditMembers";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { router } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function NewMemberScreen() {
  const { canEdit, isLoading: roleLoading } = useCanEditMembers();
  const { data: profile, isLoading: profileLoading } = useProfileQuery();
  const isAdmin = profile?.role === "admin";

  if (roleLoading || profileLoading) {
    return (
      <StackPageLayout title="Thêm thành viên">
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </StackPageLayout>
    );
  }

  if (!canEdit) {
    return (
      <StackPageLayout title="Thêm thành viên">
        <View style={styles.center}>
          <Text style={styles.denied}>
            Bạn không có quyền thêm thành viên. Liên hệ quản trị để được cấp
            quyền biên tập.
          </Text>
        </View>
      </StackPageLayout>
    );
  }

  return (
    <StackPageLayout title="Thêm thành viên">
      <MemberForm
        isAdmin={isAdmin}
        onSuccess={(id) => router.replace(`/member/${id}`)}
        onCancel={() => router.back()}
      />
    </StackPageLayout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  denied: { color: colors.textMuted, textAlign: "center", lineHeight: 22 },
});
