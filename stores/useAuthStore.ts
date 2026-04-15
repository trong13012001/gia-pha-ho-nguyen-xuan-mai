"use client";

import { create } from "zustand";

type AuthStore = {
  userId: string | null;
  email: string | null;
  accessToken: string | null;
  setAuth: (payload: {
    userId: string | null;
    email: string | null;
    accessToken: string | null;
  }) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  userId: null,
  email: null,
  accessToken: null,
  setAuth: ({ userId, email, accessToken }) => set({ userId, email, accessToken }),
  clearAuth: () => set({ userId: null, email: null, accessToken: null }),
}));

