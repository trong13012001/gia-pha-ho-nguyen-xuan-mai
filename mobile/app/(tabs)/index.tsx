import { FadeIn } from "@/components/FadeIn";
import { FeatureTile } from "@/components/home/FeatureTile";
import { TodayEventsCard } from "@/components/home/TodayEventsCard";
import { TabPageLayout, useTabListPadding } from "@/components/TabPageLayout";
import { HOME_FEATURES } from "@/constants/homeFeatures";
import { colors } from "@/constants/theme";
import { useCustomEventsQuery } from "@/hooks/useCustomEventsQuery";
import { usePersonsForEventsQuery, usePersonsListQuery } from "@/hooks/usePersonsQuery";
import { computeEvents } from "@shared/utils/eventHelpers";
import { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const SITE_NAME =
  process.env.EXPO_PUBLIC_SITE_NAME ?? "Gia Phả Họ Nguyễn Xuân Mai";

export default function HomeScreen() {
  const listPadding = useTabListPadding();
  const personsQuery = usePersonsListQuery();
  const eventsPersonsQuery = usePersonsForEventsQuery();
  const customEventsQuery = useCustomEventsQuery();

  const upcomingEvents = useMemo(() => {
    if (!eventsPersonsQuery.data) return [];
    return computeEvents(
      eventsPersonsQuery.data,
      customEventsQuery.data ?? [],
    ).filter((e) => e.daysUntil >= 0 && e.daysUntil <= 30);
  }, [eventsPersonsQuery.data, customEventsQuery.data]);

  const isLoading =
    personsQuery.isLoading ||
    eventsPersonsQuery.isLoading ||
    customEventsQuery.isLoading;

  return (
    <TabPageLayout
      variant="home"
      title={SITE_NAME}
      subtitle="Bảng điều khiển gia phả"
    >
      <ScrollView
        contentContainerStyle={[listPadding, styles.scroll]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator
            color={colors.primary}
            style={{ marginVertical: 32 }}
          />
        ) : (
          <FadeIn>
            <TodayEventsCard events={upcomingEvents} />
          </FadeIn>
        )}

        <FadeIn delay={80}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {personsQuery.data?.length ?? "—"}
              </Text>
              <Text style={styles.statLabel}>Thành viên</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{upcomingEvents.length}</Text>
              <Text style={styles.statLabel}>Sự kiện 30 ngày</Text>
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={120}>
          <Text style={styles.sectionLabel}>Chức năng</Text>
          {HOME_FEATURES.map((feature) => (
            <FeatureTile key={feature.href as string} feature={feature} />
          ))}
        </FadeIn>
      </ScrollView>
    </TabPageLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.primary,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 12,
  },
});
