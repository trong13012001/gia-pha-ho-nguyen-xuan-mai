import { AnimatedPressable } from "@/components/AnimatedPressable";
import { TIMING_DEFAULT } from "@/constants/animation";
import { colors } from "@/constants/theme";
import { Person } from "@/types";
import { getAvatarColor } from "@/utils/styleHelpers";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export function MemberRow({
  person,
  onPress,
  index = 0,
}: {
  person: Person;
  onPress: () => void;
  index?: number;
}) {
  const metaParts: string[] = [];
  if (person.generation != null) {
    metaParts.push(`Đời thứ ${person.generation}`);
  }
  if (person.birth_year) {
    metaParts.push(`Sinh ${person.birth_year}`);
  }
  if (person.is_deceased && person.death_year) {
    metaParts.push(
      person.death_day && person.death_month
        ? `Mất ${person.death_day}/${person.death_month}/${person.death_year}`
        : `Mất ${person.death_year}`,
    );
  }
  const meta = metaParts.join(" · ");
  const avatarBg = getAvatarColor(person.gender);

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(
        TIMING_DEFAULT.duration ?? 320,
      )}
    >
      <AnimatedPressable onPress={onPress} style={styles.row}>
        {person.avatar_url ? (
          <Image
            source={{ uri: person.avatar_url }}
            style={styles.avatarImage}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
            <Text style={styles.avatarText}>
              {person.full_name.trim().charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={2}>
            {person.full_name}
          </Text>
          {meta ? (
            <Text style={styles.meta} numberOfLines={2}>
              {meta}
            </Text>
          ) : null}
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textMuted}
          style={styles.chevron}
        />
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    shadowColor: "#78716c",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  body: { flex: 1, minWidth: 0 },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 22,
  },
  meta: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  chevron: { marginLeft: 4, opacity: 0.7 },
});
