import { Href } from "expo-router";

export type HomeFeature = {
  title: string;
  description: string;
  href: Href;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  bgColor: string;
  borderColor: string;
  iconColor: string;
};

export const HOME_FEATURES: HomeFeature[] = [
  {
    title: "Cây gia phả",
    description: "Xem và tương tác với sơ đồ dòng họ",
    href: "/(tabs)/tree",
    icon: "git-network-outline",
    bgColor: "#fffbeb",
    borderColor: "#fcd34d",
    iconColor: "#b45309",
  },
  {
    title: "Thành viên",
    description: "Danh sách và hồ sơ từng người trong dòng họ",
    href: "/(tabs)/members",
    icon: "people-outline",
    bgColor: "#eff6ff",
    borderColor: "#93c5fd",
    iconColor: "#2563eb",
  },
  {
    title: "Sự kiện",
    description: "Sinh nhật, ngày giỗ, lễ 49 / 100 ngày",
    href: "/(tabs)/events",
    icon: "calendar-outline",
    bgColor: "#ecfdf5",
    borderColor: "#6ee7b7",
    iconColor: "#059669",
  },
];
