import { CustomHeader } from "@/components/CustomHeader";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { colors } from "@/constants/theme";
import { PropsWithChildren, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  variant?: "home" | "default";
  headerRight?: ReactNode;
  fab?: ReactNode;
}>;

export function TabPageLayout({
  title,
  subtitle,
  variant = "default",
  headerRight,
  fab,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const padH = {
    paddingLeft: Math.max(insets.left, 16),
    paddingRight: Math.max(insets.right, 16),
  };

  return (
    <View style={styles.root}>
      <CustomHeader
        title={title}
        subtitle={subtitle}
        variant={variant}
        right={headerRight}
        style={padH}
      />
      <View style={[styles.content, padH]}>{children}</View>
      {fab ? (
        <View
          style={[
            styles.fabSlot,
            {
              bottom: insets.bottom + TAB_BAR_CLEARANCE,
              right: Math.max(insets.right, 16),
            },
          ]}
          pointerEvents="box-none"
        >
          {fab}
        </View>
      ) : null}
    </View>
  );
}

export function useTabListPadding(hasFab = false) {
  const insets = useSafeAreaInsets();
  return {
    paddingTop: 4,
    paddingBottom:
      insets.bottom + TAB_BAR_CLEARANCE + (hasFab ? 64 : 16),
  };
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  fabSlot: {
    position: "absolute",
    zIndex: 20,
  },
});
