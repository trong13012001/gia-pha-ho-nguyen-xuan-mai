import { colors } from "@/constants/theme";

export function getAvatarColor(gender: string): string {
  if (gender === "male") return "#38bdf8";
  if (gender === "female") return "#fb7185";
  return "#a8a29e";
}

export function getAvatarBgStyle(gender: string) {
  return { backgroundColor: getAvatarColor(gender) };
}

export const treeColors = {
  line: "#d6d3d1",
  cardBg: colors.surface,
  cardBorder: "rgba(231, 229, 228, 0.8)",
  deceasedOpacity: 0.75,
};
