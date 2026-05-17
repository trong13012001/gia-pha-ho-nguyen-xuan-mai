import { AvatarPicker } from "@/components/AvatarPicker";
import { AnimatedPressable } from "@/components/AnimatedPressable";
import { RelationshipManager } from "@/components/member/RelationshipManager";
import { colors } from "@/constants/theme";
import { Person } from "@/types";
import { getAvatarColor } from "@/utils/styleHelpers";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatDisplayDate(
  year: number | null,
  month: number | null,
  day: number | null,
): string {
  if (!year && !month && !day) return "Chưa rõ";
  const parts: string[] = [];
  if (day) parts.push(String(day).padStart(2, "0"));
  if (month) parts.push(String(month).padStart(2, "0"));
  if (year) parts.push(String(year));
  return parts.join("/");
}

function formatLunarDate(
  year: number | null,
  month: number | null,
  day: number | null,
): string | null {
  if (!month || !day) return null;
  const y = year ? `/${year}` : "";
  return `${day}/${month}${y} ÂL`;
}

function genderCoverColor(gender: Person["gender"]) {
  if (gender === "male") return { bg: "#e0f2fe", accent: "#38bdf8" };
  if (gender === "female") return { bg: "#ffe4e6", accent: "#fb7185" };
  return { bg: "#f5f5f4", accent: "#a8a29e" };
}

function genderLabel(gender: Person["gender"]) {
  if (gender === "male") return "Nam";
  if (gender === "female") return "Nữ";
  return "Khác";
}

function birthOrderLabel(order: number | null) {
  if (order == null) return null;
  return order === 1 ? "Con trưởng" : `Con thứ ${order}`;
}

function inLawLabel(gender: Person["gender"]) {
  if (gender === "female") return "Dâu";
  if (gender === "male") return "Rể";
  return "Khách";
}

export function MemberDetailView({
  person,
  avatarUrl,
  canEdit,
  onAvatarUploaded,
  onDelete,
  deleteBusy,
}: {
  person: Person;
  avatarUrl: string | null;
  canEdit: boolean;
  onAvatarUploaded: (url: string) => void;
  onDelete: () => void;
  deleteBusy: boolean;
}) {
  const insets = useSafeAreaInsets();
  const padH = Math.max(insets.left, 16);
  const cover = genderCoverColor(person.gender);
  const isDeceased =
    person.is_deceased ||
    Boolean(person.death_year || person.death_month || person.death_day);

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.cover, { backgroundColor: cover.bg }]}>
        <View style={[styles.coverGlow, { backgroundColor: cover.accent }]} />
      </View>

      <View style={[styles.profileBlock, { paddingHorizontal: padH }]}>
        <View style={styles.avatarWrap}>
          {canEdit ? (
            <AvatarPicker
              personId={person.id}
              fullName={person.full_name}
              avatarUrl={avatarUrl}
              onUploaded={onAvatarUploaded}
              compact
            />
          ) : avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatarImage}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: getAvatarColor(person.gender) },
              ]}
            >
              <Text style={styles.avatarInitial}>
                {person.full_name.trim().charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.nameBlock}>
          <Text style={styles.name}>{person.full_name}</Text>
          {person.other_names ? (
            <Text style={styles.otherNames}>Tên khác: {person.other_names}</Text>
          ) : null}

          <View style={styles.badges}>
            <Badge text={genderLabel(person.gender)} tone="neutral" />
            {isDeceased ? <Badge text="Đã mất" tone="muted" /> : null}
            {person.is_in_law ? (
              <Badge text={inLawLabel(person.gender)} tone="rose" />
            ) : null}
            {birthOrderLabel(person.birth_order) ? (
              <Badge text={birthOrderLabel(person.birth_order)!} tone="amber" />
            ) : null}
            {person.generation != null ? (
              <Badge text={`Đời thứ ${person.generation}`} tone="green" />
            ) : null}
          </View>
        </View>
      </View>

      <View style={[styles.cards, { paddingHorizontal: padH }]}>
        <InfoCard title="Sinh" dotColor="#34d399">
          <InfoRow
            label="Ngày sinh (dương lịch)"
            value={formatDisplayDate(
              person.birth_year,
              person.birth_month,
              person.birth_day,
            )}
          />
        </InfoCard>

        {isDeceased ? (
          <InfoCard title="Mất" dotColor="#a78bfa">
            <InfoRow
              label="Ngày mất (dương lịch)"
              value={formatDisplayDate(
                person.death_year,
                person.death_month,
                person.death_day,
              )}
            />
            <InfoRow
              label="Ngày giỗ (âm lịch)"
              value={
                formatLunarDate(
                  person.death_lunar_year,
                  person.death_lunar_month,
                  person.death_lunar_day,
                ) ?? "—"
              }
            />
            <Text style={styles.hint}>
              Lễ 49 và 100 ngày tính từ ngày mất dương lịch (+49 và +100 ngày).
            </Text>
          </InfoCard>
        ) : null}

        {person.note ? (
          <InfoCard title="Ghi chú" dotColor={colors.primary}>
            <Text style={styles.noteBody}>{person.note}</Text>
          </InfoCard>
        ) : null}

        <InfoCard title="Gia đình" dotColor="#f59e0b">
          <RelationshipManager person={person} canEdit={canEdit} />
        </InfoCard>

        {canEdit ? (
          <AnimatedPressable style={styles.deleteRow} onPress={onDelete}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text style={styles.deleteText}>
              {deleteBusy ? "Đang xoá…" : "Xoá thành viên"}
            </Text>
          </AnimatedPressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Badge({
  text,
  tone,
}: {
  text: string;
  tone: "neutral" | "muted" | "rose" | "amber" | "green";
}) {
  const toneStyle = {
    neutral: { bg: "#f5f5f4", text: colors.text, border: colors.border },
    muted: { bg: "#f5f5f4", text: colors.textMuted, border: colors.border },
    rose: { bg: "#fff1f2", text: "#be123c", border: "#fecdd3" },
    amber: { bg: colors.primarySoft, text: colors.primary, border: "#fcd34d" },
    green: { bg: "#ecfdf5", text: "#059669", border: "#6ee7b7" },
  }[tone];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: toneStyle.bg,
          borderColor: toneStyle.border,
        },
      ]}
    >
      <Text style={[styles.badgeText, { color: toneStyle.text }]}>{text}</Text>
    </View>
  );
}

function InfoCard({
  title,
  dotColor,
  children,
}: {
  title: string;
  dotColor: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    height: 100,
    overflow: "hidden",
  },
  coverGlow: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.35,
  },
  profileBlock: {
    marginTop: -48,
    paddingHorizontal: 4,
  },
  avatarWrap: {
    alignItems: "flex-start",
    marginBottom: 12,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: colors.surface,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
  },
  nameBlock: { paddingBottom: 8 },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    lineHeight: 30,
  },
  otherNames: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  cards: {
    marginTop: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  infoRow: {
    marginBottom: 10,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  infoValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 4,
  },
  noteBody: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  deleteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
  },
  deleteText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.danger,
  },
});
