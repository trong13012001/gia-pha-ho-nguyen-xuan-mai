"use client";

import { create } from "zustand";

type ThemeMode = "light" | "dark";

type AppStore = {
  theme: ThemeMode;
  isGlobalLoading: boolean;
  activeModal: string | null;
  setTheme: (theme: ThemeMode) => void;
  setGlobalLoading: (isLoading: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
};

export const useAppStore = create<AppStore>((set) => ({
  theme: "light",
  isGlobalLoading: false,
  activeModal: null,
  setTheme: (theme) => set({ theme }),
  setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),
  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal: null }),
}));

