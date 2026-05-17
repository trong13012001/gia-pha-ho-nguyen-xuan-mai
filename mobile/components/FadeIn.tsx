import { TIMING_DEFAULT } from "@/constants/animation";
import { PropsWithChildren } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export function FadeIn({
  children,
  delay = 0,
  style,
  direction = "down",
}: PropsWithChildren<{
  delay?: number;
  style?: StyleProp<ViewStyle>;
  direction?: "up" | "down";
}>) {
  const duration = TIMING_DEFAULT.duration ?? 320;
  const entering =
    direction === "up"
      ? FadeInUp.delay(delay).duration(duration)
      : FadeInDown.delay(delay).duration(duration);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
