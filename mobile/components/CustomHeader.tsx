import { colors } from "@/constants/theme";
import { ReactNode } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  variant?: "home" | "default";
  style?: ViewStyle;
};

export function CustomHeader({
  title,
  subtitle,
  right,
  variant = "default",
  style,
}: Props) {
  const insets = useSafeAreaInsets();
  const isHome = variant === "home";

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + (isHome ? 10 : 6),
        },
        style,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.textCol}>
          <Text style={[styles.title, isHome && styles.titleHome]}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingBottom: 14,
    zIndex: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  textCol: { flex: 1 },
  right: { paddingTop: 4 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.4,
  },
  titleHome: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary,
    lineHeight: 30,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
