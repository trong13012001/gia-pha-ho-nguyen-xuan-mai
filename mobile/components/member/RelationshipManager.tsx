import { AddChildrenSheet } from "@/components/member/relationships/AddChildrenSheet";
import { AddRelationshipSheet } from "@/components/member/relationships/AddRelationshipSheet";
import { AddSpouseSheet } from "@/components/member/relationships/AddSpouseSheet";
import { AnimatedPressable } from "@/components/AnimatedPressable";
import { colors } from "@/constants/theme";
import { usePersonRelationships } from "@/hooks/usePersonRelationships";
import {
  EnrichedRelationship,
  RelationshipDirection,
  deleteRelationshipById,
} from "@/services/relationshipManager";
import { Person } from "@/types";
import { getAvatarColor } from "@/utils/styleHelpers";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";

const GROUPS: {
  key: RelationshipDirection;
  title: string;
}[] = [
  { key: "parent", title: "Bố / Mẹ" },
  { key: "spouse", title: "Vợ / Chồng" },
  { key: "child", title: "Con cái" },
  { key: "child_in_law", title: "Con dâu / Con rể" },
];

function formatBirth(person: Person) {
  const parts: string[] = [];
  if (person.birth_day) parts.push(String(person.birth_day).padStart(2, "0"));
  if (person.birth_month)
    parts.push(String(person.birth_month).padStart(2, "0"));
  if (person.birth_year) parts.push(String(person.birth_year));
  return parts.length ? parts.join("/") : null;
}

export function RelationshipManager({
  person,
  canEdit,
}: {
  person: Person;
  canEdit: boolean;
}) {
  const { data: relationships = [], isLoading, refresh } =
    usePersonRelationships(person.id);

  const spouses = relationships.filter((r) => r.direction === "spouse");

  const groupBy = (direction: RelationshipDirection) =>
    relationships
      .filter((r) => r.direction === direction)
      .sort((a, b) => {
        const yearA = a.targetPerson.birth_year;
        const yearB = b.targetPerson.birth_year;
        if (yearA == null && yearB == null) return 0;
        if (yearA == null) return 1;
        if (yearB == null) return -1;
        return yearA - yearB;
      });

  const confirmDelete = (rel: EnrichedRelationship) => {
    Alert.alert(
      "Xóa quan hệ",
      `Xóa mối quan hệ với "${rel.targetPerson.full_name}"?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRelationshipById(rel.id);
              await refresh();
            } catch (e) {
              Alert.alert(
                "Lỗi",
                e instanceof Error ? e.message : "Không xóa được.",
              );
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin gia đình…</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {GROUPS.map((group) => {
        const items = groupBy(group.key);
        return (
          <View key={group.key} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            {items.length > 0 ? (
              items.map((rel) => (
                <View key={rel.id} style={styles.row}>
                  <AnimatedPressable
                    style={styles.personBtn}
                    onPress={() =>
                      router.push(`/member/${rel.targetPerson.id}`)
                    }
                  >
                    {rel.targetPerson.avatar_url ? (
                      <Image
                        source={{ uri: rel.targetPerson.avatar_url }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View
                        style={[
                          styles.avatar,
                          {
                            backgroundColor: getAvatarColor(
                              rel.targetPerson.gender,
                            ),
                          },
                        ]}
                      >
                        <Text style={styles.avatarLetter}>
                          {rel.targetPerson.full_name
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.personMeta}>
                      <Text style={styles.personName}>
                        {rel.targetPerson.full_name}
                      </Text>
                      {rel.note ? (
                        <Text style={styles.relNote}>({rel.note})</Text>
                      ) : null}
                      {rel.type === "adopted_child" ? (
                        <Text style={styles.adopted}>(Con nuôi)</Text>
                      ) : null}
                      {formatBirth(rel.targetPerson) ? (
                        <Text style={styles.birth}>
                          {formatBirth(rel.targetPerson)}
                        </Text>
                      ) : null}
                    </View>
                  </AnimatedPressable>
                  {canEdit && rel.direction !== "child_in_law" ? (
                    <AnimatedPressable
                      onPress={() => confirmDelete(rel)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={colors.danger}
                      />
                    </AnimatedPressable>
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={styles.empty}>Chưa có thông tin.</Text>
            )}
          </View>
        );
      })}

      {canEdit ? (
        <View style={styles.actions}>
          <AddRelationshipSheet person={person} onSaved={refresh} />
          <AddChildrenSheet
            person={person}
            spouses={spouses}
            onSaved={refresh}
          />
          <AddSpouseSheet person={person} onSaved={refresh} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  loading: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 10,
  },
  loadingText: { color: colors.textMuted, fontSize: 14 },
  section: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  personBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarLetter: { color: "#fff", fontWeight: "700", fontSize: 16 },
  personMeta: { flex: 1 },
  personName: { fontSize: 15, fontWeight: "600", color: colors.text },
  relNote: {
    fontSize: 12,
    color: colors.primary,
    fontStyle: "italic",
    marginTop: 2,
  },
  adopted: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  birth: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  deleteBtn: { padding: 8 },
  empty: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  actions: {
    gap: 10,
    marginTop: 12,
  },
});
