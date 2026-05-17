import { EventNotificationsSync } from "@/components/EventNotificationsSync";
import { useSession } from "@/hooks/useSession";
import { useAuthStore } from "@/stores/useAuthStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function SessionSync({ children }: PropsWithChildren) {
  const { data: session } = useSession();
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    if (session?.user) {
      setAuth({
        userId: session.user.id,
        email: session.user.email ?? null,
      });
    } else if (session === null) {
      clearAuth();
    }
  }, [session, setAuth, clearAuth]);

  return (
    <>
      <EventNotificationsSync />
      {children}
    </>
  );
}

export function Providers({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SessionSync>{children}</SessionSync>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
