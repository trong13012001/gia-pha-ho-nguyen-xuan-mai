import { AnimatedPressable } from "@/components/AnimatedPressable";
import { colors } from "@/constants/theme";
import { getTodayLunar } from "@/utils/dateHelpers";
import { FamilyEvent, EventType } from "@shared/utils/eventHelpers";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const EVENT_META: Record<
  EventType,
  { label: string; icon: keyof typeof Ionicons.glyphMap; bg: string; color: string }
> = {
  birthday: {
    label: "Sinh nhật",
    icon: "gift-outline",
    bg: "#fffbeb",
    color: "#b45309",
  },
  death_anniversary: {
    label: "Ngày giỗ",
    icon: "flower-outline",
    bg: "#faf5ff",
    color: "#7c3aed",
  },
  memorial_49: {
    label: "49 ngày",
    icon: "flame-outline",
    bg: "#f5f3ff",
    color: "#6d28d9",
  },
  memorial_100: {
    label: "100 ngày",
    icon: "flame-outline",
    bg: "#f5f3ff",
    color: "#6d28d9",
  },
  custom_event: {
    label: "Sự kiện",
    icon: "star-outline",
    bg: "#ecfdf5",
    color: "#059669",
  },
};

function daysLabel(days: number) {
  if (days === 0) return "Hôm nay";
  if (days === 1) return "Ngày mai";
  return `${days} ngày nữa`;
}

export function TodayEventsCard({ events }: { events: FamilyEvent[] }) {
  const lunar = getTodayLunar();
  const preview = events.slice(0, 4);

  return (
    <AnimatedPressable
      style={styles.card}
      onPress={() => router.push("/(tabs)/events")}
    >
      <View style={styles.dateCol}>
        <View style={styles.dateIcon}>
          <Ionicons name="calendar-outline" size={28} color={colors.textMuted} />
        </View>
        <Text style={styles.solar}>{lunar.solarStr}</Text>
        <View style={styles.lunarPill}>
          <Text style={styles.lunarLabel}>Âm lịch</Text>
          <Text style={styles.lunarValue}>{lunar.lunarDayStr}</Text>
        </View>
        <Text style={styles.lunarYear}>Năm {lunar.lunarYear}</Text>
      </View>

      <View style={styles.eventsCol}>
        {preview.length > 0 ? (
          <>
            <View style={styles.eventsHeader}>
              <View style={styles.liveDot} />
              <Text style={styles.eventsTitle}>
                Sự kiện 30 ngày tới ({events.length})
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
            {preview.map((evt, i) => {
              const meta = EVENT_META[evt.type];
              return (
                <View key={`${evt.type}-${evt.personId}-${i}`} style={styles.eventRow}>
                  <View style={[styles.eventIcon, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.icon} size={18} color={meta.color} />
                  </View>
                  <View style={styles.eventText}>
                    <Text style={styles.eventName} numberOfLines={1}>
                      {evt.personName}
                    </Text>
                    <Text style={styles.eventMeta} numberOfLines={1}>
                      {daysLabel(evt.daysUntil)} · {evt.eventDateLabel}
                    </Text>
                  </View>
                </View>
              );
            })}
            {events.length > 4 ? (
              <Text style={styles.more}>
                + {events.length - 4} sự kiện khác
              </Text>
            ) : null}
          </>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="calendar-outline" size={24} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyText}>
              Không có sự kiện nào trong 30 ngày tới.
            </Text>
            <Text style={styles.emptyLink}>Xem tất cả sự kiện →</Text>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 24,
  },
  dateCol: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
  },
  dateIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  solar: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  lunarPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lunarLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  lunarValue: { fontSize: 13, fontWeight: "600", color: colors.text },
  lunarYear: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "500",
  },
  eventsCol: { padding: 16 },
  eventsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  eventsTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  eventText: { flex: 1, minWidth: 0 },
  eventName: { fontSize: 14, fontWeight: "600", color: colors.text },
  eventMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  more: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: "500",
  },
  empty: { alignItems: "center", paddingVertical: 16 },
  emptyIcon: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    fontWeight: "500",
  },
  emptyLink: {
    marginTop: 8,
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },
});
