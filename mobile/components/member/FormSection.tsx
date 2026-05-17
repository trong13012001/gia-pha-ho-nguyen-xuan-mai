import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

export function FormSection({
  title,
  icon,
  children,
  variant = "default",
  badge,
  style,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
  variant?: "default" | "private";
  badge?: string;
  style?: ViewStyle;
}) {
  const isPrivate = variant === "private";

  return (
    <View
      style={[
        styles.card,
        isPrivate && styles.cardPrivate,
        style,
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, isPrivate && styles.iconWrapPrivate]}>
          <Ionicons
            name={icon}
            size={18}
            color={isPrivate ? "#b45309" : colors.primary}
          />
        </View>
        <Text style={[styles.title, isPrivate && styles.titlePrivate]}>
          {title}
        </Text>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  cardPrivate: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapPrivate: {
    backgroundColor: "#fef3c7",
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  titlePrivate: {
    color: "#92400e",
  },
  badge: {
    backgroundColor: "#fde68a",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#92400e",
    letterSpacing: 0.5,
  },
});
