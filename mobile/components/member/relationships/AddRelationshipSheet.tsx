import {
  FormField,
  FormTextInput,
} from "@/components/member/FormField";
import { RelationshipSheetLayout } from "@/components/member/relationships/RelationshipSheetLayout";
import { colors } from "@/constants/theme";
import {
  createRelationshipLink,
  fetchRecentPersonsForRelationship,
  searchPersonsForRelationship,
} from "@/services/relationshipManager";
import { Person, RelationshipType } from "@/types";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Direction = "parent" | "child" | "spouse";

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: "parent", label: "Người này là con của…" },
  { value: "spouse", label: "Người này là vợ/chồng của…" },
  { value: "child", label: "Người này là bố/mẹ của…" },
];

export function AddRelationshipSheet({
  person,
  onSaved,
}: {
  person: Person;
  onSaved: () => Promise<void>;
}) {
  const sheetRef = useRef<TrueSheet>(null);
  const [direction, setDirection] = useState<Direction>("parent");
  const [childType, setChildType] = useState<RelationshipType>("biological_child");
  const [note, setNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [recentMembers, setRecentMembers] = useState<Person[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<Person | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setDirection("parent");
    setChildType("biological_child");
    setNote("");
    setSearchTerm("");
    setSearchResults([]);
    setSelectedTarget(null);
    setError(null);
  };

  const present = async () => {
    reset();
    const recent = await fetchRecentPersonsForRelationship(person.id);
    setRecentMembers(recent);
    await sheetRef.current?.present();
  };

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const results = await searchPersonsForRelationship(
          person.id,
          searchTerm,
        );
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm, person.id]);

  const dismiss = async () => {
    await sheetRef.current?.dismiss();
  };

  const handleSave = async () => {
    if (!selectedTarget) return;
    setSaving(true);
    setError(null);
    try {
      await createRelationshipLink({
        person,
        targetId: selectedTarget.id,
        direction,
        childType,
        note: note.trim() || null,
      });
      await dismiss();
      await onSaved();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Không thêm được quan hệ.",
      );
    } finally {
      setSaving(false);
    }
  };

  const list =
    searchResults.length > 0
      ? searchResults
      : searchTerm.length === 0 && !selectedTarget
        ? recentMembers
        : [];

  return (
    <>
      <Pressable style={styles.trigger} onPress={present}>
        <Text style={styles.triggerText}>+ Thêm quan hệ</Text>
      </Pressable>

      <RelationshipSheetLayout
        sheetRef={sheetRef}
        title="Thêm quan hệ mới"
        onClose={dismiss}
        onSave={handleSave}
        saveDisabled={!selectedTarget}
        saving={saving}
      >
        <FormTextInput
          label="Ghi chú (tuỳ chọn)"
          value={note}
          onChangeText={setNote}
          placeholder="VD: Vợ cả, Chồng trước…"
        />

        <FormField label="Loại quan hệ">
          <View style={styles.options}>
            {DIRECTIONS.map((d) => (
              <Pressable
                key={d.value}
                style={[
                  styles.option,
                  direction === d.value && styles.optionActive,
                ]}
                onPress={() => setDirection(d.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    direction === d.value && styles.optionTextActive,
                  ]}
                >
                  {d.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </FormField>

        {(direction === "child" || direction === "parent") && (
          <FormField label="Chi tiết">
            <View style={styles.row2}>
              <Pressable
                style={[
                  styles.option,
                  styles.flex1,
                  childType === "biological_child" && styles.optionActive,
                ]}
                onPress={() => setChildType("biological_child")}
              >
                <Text
                  style={[
                    styles.optionText,
                    childType === "biological_child" && styles.optionTextActive,
                  ]}
                >
                  Con ruột
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.option,
                  styles.flex1,
                  childType === "adopted_child" && styles.optionActive,
                ]}
                onPress={() => setChildType("adopted_child")}
              >
                <Text
                  style={[
                    styles.optionText,
                    childType === "adopted_child" && styles.optionTextActive,
                  ]}
                >
                  Con nuôi
                </Text>
              </Pressable>
            </View>
          </FormField>
        )}

        <FormTextInput
          label="Tìm người thân"
          value={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
            setSelectedTarget(null);
          }}
          placeholder="Nhập tên để tìm…"
        />

        {selectedTarget ? (
          <Text style={styles.selected}>
            Đã chọn: {selectedTarget.full_name}
          </Text>
        ) : null}

        {list.length > 0 ? (
          <View style={styles.results}>
            <Text style={styles.resultsLabel}>
              {searchResults.length > 0
                ? "Kết quả tìm kiếm"
                : "Thành viên gần đây"}
            </Text>
            {list.map((p) => (
              <Pressable
                key={p.id}
                style={styles.resultRow}
                onPress={() => {
                  setSelectedTarget(p);
                  setSearchTerm(p.full_name);
                  setSearchResults([]);
                }}
              >
                <View
                  style={[
                    styles.genderDot,
                    p.gender === "male"
                      ? styles.genderMale
                      : p.gender === "female"
                        ? styles.genderFemale
                        : styles.genderOther,
                  ]}
                />
                <Text style={styles.resultName} numberOfLines={2}>
                  {p.full_name}
                </Text>
                {p.birth_year ? (
                  <Text style={styles.resultMeta}>{p.birth_year}</Text>
                ) : (
                  <View style={styles.resultMetaSpacer} />
                )}
              </Pressable>
            ))}
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </RelationshipSheetLayout>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
  },
  triggerText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
  },
  options: { gap: 8 },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  optionText: { fontSize: 14, color: colors.text },
  optionTextActive: { color: colors.primary, fontWeight: "600" },
  row2: { flexDirection: "row", gap: 8 },
  flex1: { flex: 1 },
  selected: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "600",
    marginBottom: 12,
  },
  results: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  resultsLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  genderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  genderMale: { backgroundColor: "#38bdf8" },
  genderFemale: { backgroundColor: "#fb7185" },
  genderOther: { backgroundColor: "#a8a29e" },
  resultName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  resultMeta: {
    minWidth: 44,
    fontSize: 13,
    fontWeight: "500",
    color: colors.textMuted,
    textAlign: "right",
  },
  resultMetaSpacer: { width: 44 },
  error: { color: colors.danger, fontSize: 14, marginTop: 8 },
});
