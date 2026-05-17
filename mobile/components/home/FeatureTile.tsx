import { AnimatedPressable } from "@/components/AnimatedPressable";
import { HomeFeature } from "@/constants/homeFeatures";
import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export function FeatureTile({ feature }: { feature: HomeFeature }) {
  return (
    <AnimatedPressable
      style={[
        styles.tile,
        { borderColor: feature.borderColor, backgroundColor: colors.surface },
      ]}
      onPress={() => router.push(feature.href)}
    >
      <View style={[styles.iconWrap, { backgroundColor: feature.bgColor }]}>
        <Ionicons name={feature.icon} size={32} color={feature.iconColor} />
      </View>
      <Text style={styles.title}>{feature.title}</Text>
      <Text style={styles.desc}>{feature.description}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
