import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { ReactNode, RefObject, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function RelationshipSheetLayout({
  sheetRef,
  title,
  children,
  onClose,
  onSave,
  saveLabel = "Lưu",
  saveDisabled = false,
  saving = false,
  accentColor = colors.primary,
}: {
  sheetRef: RefObject<TrueSheet | null>;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSave: () => void;
  saveLabel?: string;
  saveDisabled?: boolean;
  saving?: boolean;
  accentColor?: string;
}) {
  const insets = useSafeAreaInsets();

  const header = useMemo(
    () => (
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={colors.textMuted} />
        </Pressable>
      </View>
    ),
    [title, onClose],
  );

  const footer = useMemo(
    () => (
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <Pressable style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelText}>Huỷ</Text>
        </Pressable>
        <Pressable
          style={[
            styles.saveBtn,
            { backgroundColor: accentColor },
            (saveDisabled || saving) && styles.saveDisabled,
          ]}
          onPress={onSave}
          disabled={saveDisabled || saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>{saveLabel}</Text>
          )}
        </Pressable>
      </View>
    ),
    [
      accentColor,
      insets.bottom,
      onClose,
      onSave,
      saveDisabled,
      saveLabel,
      saving,
    ],
  );

  return (
    <TrueSheet
      ref={sheetRef}
      detents={[0.62, 0.92]}
      cornerRadius={20}
      grabber
      backgroundColor={colors.surface}
      scrollable
      header={header}
      headerStyle={styles.headerWrap}
      footer={footer}
      footerStyle={styles.footerWrap}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </TrueSheet>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
    paddingRight: 12,
  },
  closeBtn: { padding: 4 },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: colors.surface,
  },
  footerWrap: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.background,
  },
  cancelText: { fontSize: 15, fontWeight: "600", color: colors.textMuted },
  saveBtn: {
    flex: 1.4,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveDisabled: { opacity: 0.5 },
  saveText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
