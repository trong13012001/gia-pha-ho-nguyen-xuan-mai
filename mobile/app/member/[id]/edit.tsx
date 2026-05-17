import { MemberForm } from "@/components/member/MemberForm";
import { StackPageLayout } from "@/components/StackPageLayout";
import { colors } from "@/constants/theme";
import { queryKeys } from "@/constants/queryKeys";
import { useCanEditMembers } from "@/hooks/useCanEditMembers";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { fetchPersonById } from "@/services/persons";
import { fetchPersonPrivateDetails } from "@/services/personPrivate";
import { Person } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function EditMemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { canEdit, isLoading: roleLoading } = useCanEditMembers();
  const { data: profile, isLoading: profileLoading } = useProfileQuery();
  const isAdmin = profile?.role === "admin";

  const personQuery = useQuery({
    queryKey: queryKeys.personDetail(id ?? ""),
    enabled: Boolean(id),
    queryFn: () => fetchPersonById(id as string),
  });

  const privateQuery = useQuery({
    queryKey: queryKeys.personPrivate(id ?? ""),
    enabled: Boolean(id) && isAdmin,
    queryFn: () => fetchPersonPrivateDetails(id as string),
  });

  const initialPerson = useMemo((): Person | undefined => {
    const person = personQuery.data;
    if (!person) return undefined;
    const priv = privateQuery.data;
    if (!priv) return person;
    return {
      ...person,
      phone_number: priv.phone_number,
      occupation: priv.occupation,
      current_residence: priv.current_residence,
    };
  }, [personQuery.data, privateQuery.data]);

  const loading =
    roleLoading ||
    profileLoading ||
    personQuery.isLoading ||
    (isAdmin && privateQuery.isLoading);

  if (loading) {
    return (
      <StackPageLayout title="Chỉnh sửa thành viên">
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </StackPageLayout>
    );
  }

  if (!canEdit) {
    return (
      <StackPageLayout title="Chỉnh sửa thành viên">
        <View style={styles.center}>
          <Text style={styles.denied}>Bạn không có quyền sửa thành viên.</Text>
        </View>
      </StackPageLayout>
    );
  }

  if (personQuery.isError || !initialPerson) {
    return (
      <StackPageLayout title="Chỉnh sửa thành viên">
        <View style={styles.center}>
          <Text style={styles.denied}>Không tìm thấy thành viên.</Text>
        </View>
      </StackPageLayout>
    );
  }

  return (
    <StackPageLayout title="Chỉnh sửa thành viên">
      <MemberForm
        initialPerson={initialPerson}
        isAdmin={isAdmin}
        onSuccess={() => router.back()}
        onCancel={() => router.back()}
      />
    </StackPageLayout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  denied: { color: colors.textMuted, textAlign: "center", lineHeight: 22 },
});
