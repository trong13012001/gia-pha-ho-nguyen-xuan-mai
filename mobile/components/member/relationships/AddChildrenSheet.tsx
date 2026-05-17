import {
  FormField,
  FormNumberInput,
  FormTextInput,
} from "@/components/member/FormField";
import { RelationshipSheetLayout } from "@/components/member/relationships/RelationshipSheetLayout";
import { colors } from "@/constants/theme";
import {
  BulkChildRow,
  bulkCreateChildren,
  EnrichedRelationship,
} from "@/services/relationshipManager";
import { Gender, Person } from "@/types";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const EMPTY_ROW = (): BulkChildRow => ({
  name: "",
  gender: "male",
  birthYear: "",
  birthOrder: "1",
});

export function AddChildrenSheet({
  person,
  spouses,
  onSaved,
}: {
  person: Person;
  spouses: EnrichedRelationship[];
  onSaved: () => Promise<void>;
}) {
  const sheetRef = useRef<TrueSheet>(null);
  const [spouseId, setSpouseId] = useState<string | null>(null);
  const [rows, setRows] = useState<BulkChildRow[]>([EMPTY_ROW()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setSpouseId(null);
    setRows([EMPTY_ROW()]);
    setError(null);
  };

  const present = async () => {
    reset();
    await sheetRef.current?.present();
  };

  const dismiss = async () => {
    await sheetRef.current?.dismiss();
  };

  const updateRow = (index: number, patch: Partial<BulkChildRow>) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  const removeRow = (index: number) => {
    setRows((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [EMPTY_ROW()];
    });
  };

  const handleSave = async () => {
    const valid = rows.filter((r) => r.name.trim() !== "");
    if (valid.length === 0) {
      setError("Vui lòng nhập ít nhất tên của 1 người con.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await bulkCreateChildren({
        person,
        spouseId,
        children: rows,
      });
      if (result.success < result.total) {
        setError(
          `Chỉ lưu được ${result.success}/${result.total} người. Kiểm tra lại dữ liệu.`,
        );
        await onSaved();
        return;
      }
      await dismiss();
      await onSaved();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Không thêm được danh sách con.",
      );
    } finally {
      setSaving(false);
    }
  };

  const hasValidName = rows.some((r) => r.name.trim() !== "");

  return (
    <>
      <Pressable style={[styles.trigger, styles.triggerSky]} onPress={present}>
        <Text style={[styles.triggerText, styles.triggerTextSky]}>
          + Thêm con
        </Text>
      </Pressable>

      <RelationshipSheetLayout
        sheetRef={sheetRef}
        title="Thêm nhanh nhiều con"
        onClose={dismiss}
        onSave={handleSave}
        saveLabel="Lưu tất cả"
        saveDisabled={!hasValidName}
        saving={saving}
        accentColor="#0284c7"
      >
        <FormField label="Người mẹ/cha còn lại">
          <Pressable
            style={[
              styles.spouseOption,
              spouseId === null && styles.spouseOptionActive,
            ]}
            onPress={() => setSpouseId(null)}
          >
            <Text
              style={[
                styles.spouseOptionText,
                spouseId === null && styles.spouseOptionTextActive,
              ]}
            >
              Không rõ (hoặc vợ/chồng chưa thêm)
            </Text>
          </Pressable>
          {spouses.map((rel) => (
            <Pressable
              key={rel.id}
              style={[
                styles.spouseOption,
                spouseId === rel.targetPerson.id && styles.spouseOptionActive,
              ]}
              onPress={() => setSpouseId(rel.targetPerson.id)}
            >
              <Text
                style={[
                  styles.spouseOptionText,
                  spouseId === rel.targetPerson.id &&
                    styles.spouseOptionTextActive,
                ]}
              >
                {rel.targetPerson.full_name}
                {rel.note ? ` (${rel.note})` : ""}
              </Text>
            </Pressable>
          ))}
        </FormField>

        <Text style={styles.listTitle}>Danh sách các con</Text>

        {rows.map((row, index) => (
          <View key={`child-row-${index}`} style={styles.childCard}>
            <View style={styles.childHeader}>
              <Text style={styles.childBadge}>Con thứ {index + 1}</Text>
              <Pressable onPress={() => removeRow(index)} hitSlop={8}>
                <Ionicons name="close-circle" size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.childFields}>
              <View style={styles.orderCol}>
                <FormNumberInput
                  label="STT"
                  value={row.birthOrder === "" ? "" : Number(row.birthOrder)}
                  onChangeValue={(v) =>
                    updateRow(index, {
                      birthOrder: v === "" ? "" : String(v),
                    })
                  }
                />
              </View>
              <View style={styles.nameCol}>
                <FormTextInput
                  label="Họ và tên *"
                  value={row.name}
                  onChangeText={(name) => updateRow(index, { name })}
                  placeholder="Họ và tên"
                />
              </View>
            </View>

            <View style={styles.row2}>
              <FormField label="Giới tính">
                <View style={styles.genderRow}>
                  {(["male", "female", "other"] as Gender[]).map((g) => (
                    <Pressable
                      key={g}
                      style={[
                        styles.genderChip,
                        row.gender === g && styles.genderChipActive,
                      ]}
                      onPress={() => updateRow(index, { gender: g })}
                    >
                      <Text
                        style={[
                          styles.genderChipText,
                          row.gender === g && styles.genderChipTextActive,
                        ]}
                      >
                        {g === "male" ? "Nam" : g === "female" ? "Nữ" : "Khác"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </FormField>
              <FormTextInput
                label="Năm sinh"
                value={row.birthYear}
                onChangeText={(birthYear) => updateRow(index, { birthYear })}
                keyboardType="number-pad"
                placeholder="VD: 1990"
              />
            </View>
          </View>
        ))}

        <Pressable
          style={styles.addRowBtn}
          onPress={() =>
            setRows((prev) => [
              ...prev,
              { ...EMPTY_ROW(), birthOrder: String(prev.length + 1) },
            ])
          }
        >
          <Text style={styles.addRowText}>+ Thêm dòng</Text>
        </Pressable>

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
  triggerSky: { borderColor: "#bae6fd", backgroundColor: "#f0f9ff" },
  triggerText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
  },
  triggerTextSky: { color: "#0369a1" },
  spouseOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  spouseOptionActive: {
    borderColor: "#0284c7",
    backgroundColor: "#e0f2fe",
  },
  spouseOptionText: { fontSize: 14, color: colors.text },
  spouseOptionTextActive: { color: "#0369a1", fontWeight: "600" },
  listTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 10,
    marginTop: 4,
  },
  childCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12,
  },
  childHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  childBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0284c7",
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  childFields: { flexDirection: "row", gap: 8 },
  orderCol: { width: 72 },
  nameCol: { flex: 1 },
  row2: { gap: 0 },
  genderRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  genderChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genderChipActive: {
    borderColor: "#0284c7",
    backgroundColor: "#e0f2fe",
  },
  genderChipText: { fontSize: 13, color: colors.textMuted },
  genderChipTextActive: { color: "#0369a1", fontWeight: "600" },
  addRowBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#bae6fd",
    alignItems: "center",
    marginBottom: 12,
  },
  addRowText: { color: "#0284c7", fontWeight: "600", fontSize: 14 },
  error: { color: colors.danger, fontSize: 14 },
});
