import { FormTextInput } from "@/components/member/FormField";
import { RelationshipSheetLayout } from "@/components/member/relationships/RelationshipSheetLayout";
import { colors } from "@/constants/theme";
import { quickCreateSpouse } from "@/services/relationshipManager";
import { Person } from "@/types";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export function AddSpouseSheet({
  person,
  onSaved,
}: {
  person: Person;
  onSaved: () => Promise<void>;
}) {
  const sheetRef = useRef<TrueSheet>(null);
  const [fullName, setFullName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const oppositeGender =
    person.gender === "male"
      ? "Nữ"
      : person.gender === "female"
        ? "Nam"
        : "Nữ";

  const reset = () => {
    setFullName("");
    setBirthYear("");
    setNote("");
    setError(null);
  };

  const present = async () => {
    reset();
    await sheetRef.current?.present();
  };

  const dismiss = async () => {
    await sheetRef.current?.dismiss();
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError("Vui lòng nhập tên vợ/chồng.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await quickCreateSpouse({
        person,
        fullName,
        birthYear,
        note: note.trim() || null,
      });
      await dismiss();
      await onSaved();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Không thêm được vợ/chồng.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Pressable style={[styles.trigger, styles.triggerRose]} onPress={present}>
        <Text style={[styles.triggerText, styles.triggerTextRose]}>
          + Thêm vợ/chồng
        </Text>
      </Pressable>

      <RelationshipSheetLayout
        sheetRef={sheetRef}
        title="Thêm nhanh vợ/chồng"
        onClose={dismiss}
        onSave={handleSave}
        saveDisabled={!fullName.trim()}
        saving={saving}
        accentColor="#e11d48"
      >
        <FormTextInput
          label="Họ và tên *"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Nhập họ và tên…"
        />

        <FormTextInput
          label="Năm sinh (tuỳ chọn)"
          value={birthYear}
          onChangeText={setBirthYear}
          keyboardType="number-pad"
          placeholder="VD: 1980"
        />

        <FormTextInput
          label="Ghi chú quan hệ"
          value={note}
          onChangeText={setNote}
          placeholder="VD: Vợ cả, Chồng thứ…"
        />

        <Text style={styles.hint}>
          Giới tính tự gán là {oppositeGender} (theo giới tính người hiện tại).
        </Text>

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
  triggerRose: { borderColor: "#fecdd3", backgroundColor: "#fff1f2" },
  triggerText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
  },
  triggerTextRose: { color: "#be123c" },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: "italic",
    lineHeight: 18,
    marginTop: 4,
  },
  error: { color: colors.danger, fontSize: 14, marginTop: 12 },
});
