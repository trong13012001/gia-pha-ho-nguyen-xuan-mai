import "react-native-gesture-handler";

import { Providers } from "@/components/Providers";
import { colors } from "@/constants/theme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Providers>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.background },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="member/new" options={{ headerShown: false }} />
          <Stack.Screen
            name="member/[id]/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="member/[id]/edit"
            options={{ headerShown: false }}
          />
        </Stack>
      </Providers>
    </GestureHandlerRootView>
  );
}
