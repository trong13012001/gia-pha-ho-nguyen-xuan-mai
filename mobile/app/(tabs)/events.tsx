import { AnimatedPressable } from "@/components/AnimatedPressable";
import { EventsList, EventsListLoading } from "@/components/EventsList";
import { TabPageLayout, useTabListPadding } from "@/components/TabPageLayout";
import { colors } from "@/constants/theme";
import { useCustomEventsQuery } from "@/hooks/useCustomEventsQuery";
import { usePersonsForEventsQuery } from "@/hooks/usePersonsQuery";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type Filter = "all" | "memorial" | "upcoming";

export default function EventsScreen() {
  const [filter, setFilter] = useState<Filter>("all");
  const listPadding = useTabListPadding();
  const personsQuery = usePersonsForEventsQuery();
  const customEventsQuery = useCustomEventsQuery();

  const isLoading = personsQuery.isLoading || customEventsQuery.isLoading;
  const isError = personsQuery.isError || customEventsQuery.isError;

  const listHeader = useMemo(
    () => (
      <View style={styles.filters}>
        {(
          [
            ["all", "Tất cả"],
            ["memorial", "49 / 100"],
            ["upcoming", "Sắp tới"],
          ] as const
        ).map(([key, label]) => (
          <AnimatedPressable
            key={key}
            onPress={() => setFilter(key)}
            style={[styles.chip, filter === key && styles.chipActive]}
          >
            <Text
              style={[styles.chipText, filter === key && styles.chipTextActive]}
            >
              {label}
            </Text>
          </AnimatedPressable>
        ))}
      </View>
    ),
    [filter],
  );

  return (
    <TabPageLayout title="Sự kiện" subtitle="Sinh nhật, ngày giỗ, lễ 49 / 100 ngày">
      {isLoading ? (
        <EventsListLoading />
      ) : isError ? (
        <View style={styles.errorWrap}>
          <Text style={styles.error}>Không tải được sự kiện.</Text>
        </View>
      ) : (
        <EventsList
          persons={personsQuery.data ?? []}
          customEvents={customEventsQuery.data ?? []}
          filter={filter}
          listHeader={listHeader}
          contentContainerStyle={listPadding}
          onSelectPerson={(id) => router.push(`/member/${id}`)}
        />
      )}
    </TabPageLayout>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
    paddingTop: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.textMuted },
  chipTextActive: { color: colors.primary },
  errorWrap: { flex: 1, justifyContent: "center", padding: 24 },
  error: { color: colors.danger, textAlign: "center" },
});
