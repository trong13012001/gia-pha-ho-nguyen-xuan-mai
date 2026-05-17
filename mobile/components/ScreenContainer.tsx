import { colors } from "@/constants/theme";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { PropsWithChildren, ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Edge } from "react-native-safe-area-context";

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  edges?: Edge[];
  header?: ReactNode;
}>;

/** Bọc màn hình bằng View + useSafeAreaInsets (không dùng SafeAreaView). */
export function ScreenContainer({
  children,
  style,
  edges = ["left", "right"],
  header,
}: Props) {
  const { paddingStyle } = useScreenInsets(
    header ? edges : (["top", "left", "right"] as Edge[]),
  );

  return (
    <View style={[styles.root, !header && paddingStyle, style]}>
      {header}
      <View style={[styles.body, header ? paddingStyle : undefined]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
});
