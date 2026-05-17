import { colors } from "@/constants/theme";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Edge } from "react-native-safe-area-context";

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  edges?: Edge[];
}>;

/** @deprecated Ưu tiên CustomHeader + useSafeAreaInsets / ScreenContainer. */
export function SafeAreaScreen({
  children,
  style,
  edges = ["top", "left", "right"],
}: Props) {
  const { paddingStyle } = useScreenInsets(edges);

  return (
    <View style={[styles.screen, paddingStyle, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
