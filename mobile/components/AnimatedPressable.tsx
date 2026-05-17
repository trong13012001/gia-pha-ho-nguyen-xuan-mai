import { TIMING_PRESS } from "@/constants/animation";
import { PropsWithChildren, useCallback } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = PropsWithChildren<{
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}>;

export function AnimatedPressable({
  children,
  onPress,
  style,
  disabled,
}: Props) {
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  const tap = Gesture.Tap()
    .enabled(!disabled && Boolean(onPress))
    .onBegin(() => {
      scale.value = withTiming(0.97, TIMING_PRESS);
    })
    .onFinalize(() => {
      scale.value = withTiming(1, TIMING_PRESS);
    })
    .onEnd(() => {
      runOnJS(handlePress)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[style, animatedStyle]} accessibilityRole="button">
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
