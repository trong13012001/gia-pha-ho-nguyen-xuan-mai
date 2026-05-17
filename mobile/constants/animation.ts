import { Easing, WithTimingConfig } from "react-native-reanimated";

export const TIMING_DEFAULT: WithTimingConfig = {
  duration: 320,
  easing: Easing.out(Easing.cubic),
};

export const TIMING_FAST: WithTimingConfig = {
  duration: 180,
  easing: Easing.out(Easing.quad),
};

export const TIMING_PRESS: WithTimingConfig = {
  duration: 120,
  easing: Easing.out(Easing.quad),
};
