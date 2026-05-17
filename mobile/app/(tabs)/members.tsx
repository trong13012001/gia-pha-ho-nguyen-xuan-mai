import { AnimatedPressable } from "@/components/AnimatedPressable";
import { MemberRow } from "@/components/MemberRow";
import { TabPageLayout, useTabListPadding } from "@/components/TabPageLayout";
import { colors } from "@/constants/theme";
import { useCanEditMembers } from "@/hooks/useCanEditMembers";
import { usePersonsListQuery } from "@/hooks/usePersonsQuery";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

function FabButton({ onPress }: { onPress: () => void }) {
  return (
    <AnimatedPressable onPress={onPress} style={styles.fab}>
      <Ionicons name="add" size={28} color="#fff" />
    </AnimatedPressable>
  );
}

export default function MembersScreen() {
  const { data, isLoading, isError } = usePersonsListQuery();
  const { canEdit } = useCanEditMembers();
  const listPadding = useTabListPadding(canEdit);

  if (isLoading) {
    return (
      <TabPageLayout title="Thành viên" subtitle="Đang tải…">
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </TabPageLayout>
    );
  }

  if (isError) {
    return (
      <TabPageLayout title="Thành viên">
        <View style={styles.center}>
          <Text style={styles.error}>Không tải được danh sách thành viên.</Text>
        </View>
      </TabPageLayout>
    );
  }

  const count = data?.length ?? 0;

  return (
    <TabPageLayout
      title="Thành viên"
      subtitle={`${count} người trong gia phả`}
      fab={
        canEdit ? (
          <FabButton onPress={() => router.push("/member/new")} />
        ) : undefined
      }
    >
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[listPadding, styles.list]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <MemberRow
            person={item}
            index={index}
            onPress={() => router.push(`/member/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Chưa có thành viên nào.</Text>
        }
      />
    </TabPageLayout>
  );
}

const styles = StyleSheet.create({
  list: { flexGrow: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: { color: colors.danger, textAlign: "center" },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 40,
    fontSize: 15,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
