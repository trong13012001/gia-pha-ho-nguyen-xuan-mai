import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { PropsWithChildren, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = PropsWithChildren<{
  title: string;
  right?: ReactNode;
}>;

/** Màn stack (thêm/sửa thành viên) — custom header, không dùng header Expo (tránh back "(tabs)"). */
export function StackPageLayout({ title, right, children }: Props) {
  const insets = useSafeAreaInsets();
  const padH = Math.max(insets.left, 16);

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 12) + 10,
            paddingHorizontal: padH,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
          <Text style={styles.backText}>Quay lại</Text>
        </Pressable>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.rightSlot}>{right ?? <View style={styles.rightSpacer} />}</View>
      </View>

      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minWidth: 88,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginHorizontal: 4,
  },
  rightSlot: {
    minWidth: 88,
    alignItems: "flex-end",
  },
  rightSpacer: { width: 1 },
  body: {
    flex: 1,
  },
});
