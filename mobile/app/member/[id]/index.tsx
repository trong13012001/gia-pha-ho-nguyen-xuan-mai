import { MemberDetailView } from "@/components/member/MemberDetailView";
import { AnimatedPressable } from "@/components/AnimatedPressable";
import { StackPageLayout } from "@/components/StackPageLayout";
import { colors } from "@/constants/theme";
import { queryKeys } from "@/constants/queryKeys";
import { useCanEditMembers } from "@/hooks/useCanEditMembers";
import { useDeletePersonMutation } from "@/hooks/usePersonMutations";
import { fetchPersonById } from "@/services/persons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { canEdit } = useCanEditMembers();
  const deleteMutation = useDeletePersonMutation();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.personDetail(id ?? ""),
    enabled: Boolean(id),
    queryFn: () => fetchPersonById(id as string),
  });

  const displayAvatar = avatarUrl ?? data?.avatar_url ?? null;

  const confirmDelete = () => {
    if (!data) return;
    Alert.alert(
      "Xoá thành viên",
      `Bạn có chắc muốn xoá "${data.full_name}"? Hành động không thể hoàn tác.`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(data.id);
              router.replace("/(tabs)/members");
            } catch (e) {
              Alert.alert(
                "Lỗi",
                e instanceof Error ? e.message : "Không xoá được thành viên.",
              );
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <StackPageLayout title="Chi tiết thành viên">
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </StackPageLayout>
    );
  }

  if (isError || !data) {
    return (
      <StackPageLayout title="Chi tiết thành viên">
        <View style={styles.center}>
          <Text style={styles.error}>Không tìm thấy thành viên.</Text>
        </View>
      </StackPageLayout>
    );
  }

  return (
    <StackPageLayout
      title="Chi tiết thành viên"
      right={
        canEdit ? (
          <AnimatedPressable
            onPress={() => router.push(`/member/${data.id}/edit`)}
            style={styles.headerBtn}
          >
            <Text style={styles.headerBtnText}>Chỉnh sửa</Text>
          </AnimatedPressable>
        ) : undefined
      }
    >
      <MemberDetailView
        person={data}
        avatarUrl={displayAvatar}
        canEdit={canEdit}
        deleteBusy={deleteMutation.isPending}
        onDelete={confirmDelete}
        onAvatarUploaded={(url) => {
          setAvatarUrl(url);
          queryClient.invalidateQueries({ queryKey: queryKeys.persons });
          queryClient.invalidateQueries({
            queryKey: queryKeys.personDetail(data.id),
          });
        }}
      />
    </StackPageLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtn: { paddingHorizontal: 4, paddingVertical: 4 },
  headerBtnText: { color: colors.primary, fontWeight: "600", fontSize: 16 },
  error: { color: colors.danger },
});
