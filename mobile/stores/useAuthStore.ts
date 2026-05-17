import { create } from "zustand";

type AuthStore = {
  userId: string | null;
  email: string | null;
  setAuth: (payload: { userId: string | null; email: string | null }) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  userId: null,
  email: null,
  setAuth: ({ userId, email }) => set({ userId, email }),
  clearAuth: () => set({ userId: null, email: null }),
}));
