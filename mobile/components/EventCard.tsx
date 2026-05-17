import { AnimatedPressable } from "@/components/AnimatedPressable";
import { colors } from "@/constants/theme";
import { FamilyEvent } from "@shared/utils/eventHelpers";
import { StyleSheet, Text, View } from "react-native";
import { TIMING_DEFAULT } from "@/constants/animation";
import Animated, { FadeInDown } from "react-native-reanimated";

const TYPE_LABEL: Record<FamilyEvent["type"], string> = {
  birthday: "Sinh nhật",
  death_anniversary: "Ngày giỗ",
  memorial_49: "Lễ 49 ngày",
  memorial_100: "Lễ 100 ngày",
  custom_event: "Sự kiện",
};

function daysUntilLabel(days: number): string {
  if (days === 0) return "Hôm nay";
  if (days === 1) return "Ngày mai";
  if (days === -1) return "Hôm qua";
  if (days > 0) return `Còn ${days} ngày`;
  return `${Math.abs(days)} ngày trước`;
}

export function EventCard({
  event,
  onPress,
  index = 0,
}: {
  event: FamilyEvent;
  onPress?: () => void;
  index?: number;
}) {
  const isMemorial =
    event.type === "memorial_49" || event.type === "memorial_100";
  const isToday = event.daysUntil === 0;
  const isPast = event.daysUntil < 0;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 45).duration(
        TIMING_DEFAULT.duration ?? 320,
      )}
    >
      <AnimatedPressable
        onPress={onPress}
        style={[
          styles.card,
          isMemorial && styles.memorialCard,
          isToday && styles.todayCard,
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.type}>{TYPE_LABEL[event.type]}</Text>
          <View
            style={[
              styles.badge,
              isToday && styles.badgeToday,
              isPast && styles.badgePast,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isToday && styles.badgeTextToday,
                isPast && styles.badgeTextPast,
              ]}
            >
              {daysUntilLabel(event.daysUntil)}
            </Text>
          </View>
        </View>
        <Text style={styles.name}>{event.personName}</Text>
        <Text style={styles.date}>{event.eventDateLabel}</Text>
        {event.content ? (
          <Text style={styles.content} numberOfLines={2}>
            {event.content}
          </Text>
        ) : null}
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  memorialCard: {
    borderColor: "#fcd34d",
    backgroundColor: colors.primarySoft,
  },
  todayCard: {
    borderColor: colors.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  type: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#f5f5f4",
  },
  badgeToday: {
    backgroundColor: colors.primary,
  },
  badgePast: {
    backgroundColor: "#e7e5e4",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  badgeTextToday: {
    color: "#fff",
  },
  badgeTextPast: {
    color: colors.textMuted,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colors.textMuted,
  },
  content: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textMuted,
  },
});
