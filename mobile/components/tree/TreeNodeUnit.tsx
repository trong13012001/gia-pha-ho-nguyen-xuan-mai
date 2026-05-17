import { AnimatedPressable } from "@/components/AnimatedPressable";
import { colors } from "@/constants/theme";
import { Person } from "@/types";
import { SpouseData } from "@/utils/treeHelpers";
import { getAvatarColor, treeColors } from "@/utils/styleHelpers";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

export function TreeNodeUnit({
  person,
  spouses,
  showAvatar,
  isFirstSpouseRing,
  onPressPerson,
}: {
  person: Person;
  spouses: SpouseData[];
  showAvatar: boolean;
  isFirstSpouseRing?: boolean;
  onPressPerson: (id: string) => void;
}) {
  return (
    <View style={styles.row}>
      <PersonCard
        person={person}
        showAvatar={showAvatar}
        onPress={() => onPressPerson(person.id)}
      />
      {spouses.map((s, idx) => (
        <View key={s.person.id} style={styles.spouseWrap}>
          {idx === 0 && isFirstSpouseRing ? (
            <Text style={styles.ring}>💍</Text>
          ) : idx > 0 ? (
            <Text style={styles.ring}>+</Text>
          ) : null}
          <PersonCard
            person={s.person}
            showAvatar={showAvatar}
            onPress={() => onPressPerson(s.person.id)}
          />
        </View>
      ))}
    </View>
  );
}

function PersonCard({
  person,
  showAvatar,
  onPress,
}: {
  person: Person;
  showAvatar: boolean;
  onPress: () => void;
}) {
  const deceased = person.is_deceased;

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        styles.card,
        showAvatar && styles.cardWithAvatar,
        deceased && styles.deceased,
      ]}
    >
      {showAvatar && (
        <View
          style={[
            styles.avatar,
            { backgroundColor: getAvatarColor(person.gender) },
          ]}
        >
          {person.avatar_url ? (
            <Image
              source={{ uri: person.avatar_url }}
              style={styles.avatarImage}
              contentFit="cover"
            />
          ) : (
            <Text style={styles.initial}>
              {person.full_name.trim().charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
      )}
      <Text style={styles.name} numberOfLines={3}>
        {person.full_name}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: treeColors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: treeColors.cardBorder,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  spouseWrap: { position: "relative" },
  ring: {
    position: "absolute",
    left: -6,
    top: "35%",
    zIndex: 2,
    fontSize: 11,
  },
  card: {
    width: 88,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  cardWithAvatar: { paddingTop: 10 },
  deceased: { opacity: treeColors.deceasedOpacity },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarImage: { width: 48, height: 48, borderRadius: 24 },
  initial: { color: "#fff", fontWeight: "700", fontSize: 18 },
  name: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    lineHeight: 14,
  },
});
