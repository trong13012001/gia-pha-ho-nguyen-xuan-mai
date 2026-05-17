import { TabPageLayout } from "@/components/TabPageLayout";
import { FamilyTreeView } from "@/components/tree/FamilyTreeView";
import { colors } from "@/constants/theme";
import { useTreeQuery } from "@/hooks/useTreeQuery";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function TreeScreen() {
  const { persons, relationships, isLoading, isError } = useTreeQuery();

  return (
    <TabPageLayout
      title="Gia phả"
      subtitle="Chạm thẻ để xem hồ sơ · Thu phóng để xem cây"
    >
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.error}>Không tải được cây gia phả.</Text>
        </View>
      ) : (
        <FamilyTreeView persons={persons} relationships={relationships} />
      )}
    </TabPageLayout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: colors.danger },
});
