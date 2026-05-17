import { EventCard } from "@/components/EventCard";
import { colors } from "@/constants/theme";
import {
  computeEvents,
  CustomEventRecord,
  PersonEventInput,
} from "@shared/utils/eventHelpers";
import { ReactElement, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

type Filter = "all" | "memorial" | "upcoming";

export function EventsList({
  persons,
  customEvents,
  filter = "all",
  onSelectPerson,
  listHeader,
  contentContainerStyle,
}: {
  persons: PersonEventInput[];
  customEvents: CustomEventRecord[];
  filter?: Filter;
  onSelectPerson?: (personId: string) => void;
  listHeader?: ReactElement | null;
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  const events = useMemo(
    () => computeEvents(persons, customEvents),
    [persons, customEvents],
  );

  const filtered = useMemo(() => {
    if (filter === "memorial") {
      return events.filter(
        (e) => e.type === "memorial_49" || e.type === "memorial_100",
      );
    }
    if (filter === "upcoming") {
      return events.filter((e) => e.daysUntil >= 0);
    }
    return events;
  }, [events, filter]);

  if (!persons.length && !customEvents.length) {
    return (
      <Animated.View entering={FadeIn} style={styles.empty}>
        <Text style={styles.emptyTitle}>Chưa có dữ liệu sự kiện</Text>
        <Text style={styles.emptyText}>
          Thêm ngày mất (dương lịch) cho thành viên đã mất để tính lễ 49 và 100
          ngày.
        </Text>
      </Animated.View>
    );
  }

  return (
    <FlatList
      style={styles.listFlex}
      data={filtered}
      keyExtractor={(item, index) =>
        `${item.type}-${item.personId ?? "custom"}-${item.nextOccurrence.toISOString()}-${index}`
      }
      contentContainerStyle={[styles.list, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={listHeader ?? undefined}
      renderItem={({ item, index }) => (
        <EventCard
          event={item}
          index={index}
          onPress={
            item.personId && item.type !== "custom_event"
              ? () => onSelectPerson?.(item.personId as string)
              : undefined
          }
        />
      )}
      ListEmptyComponent={
        <Text style={styles.emptyText}>Không có sự kiện trong nhóm này.</Text>
      }
    />
  );
}

export function EventsListLoading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  listFlex: { flex: 1 },
  list: { paddingBottom: 24 },
  empty: { padding: 24, alignItems: "center" },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  loading: { flex: 1, padding: 40, alignItems: "center", justifyContent: "center" },
});
