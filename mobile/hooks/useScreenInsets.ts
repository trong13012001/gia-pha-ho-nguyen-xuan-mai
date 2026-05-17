import { useMemo } from "react";
import { ViewStyle } from "react-native";
import { Edge, useSafeAreaInsets } from "react-native-safe-area-context";

export function useScreenInsets(edges: Edge[] = ["top", "left", "right"]) {
  const insets = useSafeAreaInsets();

  const paddingStyle = useMemo<ViewStyle>(
    () => ({
      paddingTop: edges.includes("top") ? insets.top : 0,
      paddingBottom: edges.includes("bottom") ? insets.bottom : 0,
      paddingLeft: edges.includes("left") ? insets.left : 0,
      paddingRight: edges.includes("right") ? insets.right : 0,
    }),
    [edges, insets.bottom, insets.left, insets.right, insets.top],
  );

  const horizontalPadding = useMemo(
    () => ({
      paddingLeft: edges.includes("left") ? Math.max(insets.left, 16) : 16,
      paddingRight: edges.includes("right") ? Math.max(insets.right, 16) : 16,
    }),
    [edges, insets.left, insets.right],
  );

  return { insets, paddingStyle, horizontalPadding };
}
