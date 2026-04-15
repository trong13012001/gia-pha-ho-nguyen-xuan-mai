"use client";

import {
  signInWithPassword,
  signUpWithPassword,
} from "@/services/supabase/auth.service";
import { useMutation } from "@tanstack/react-query";

export function useSignInMutation() {
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) =>
      signInWithPassword(payload),
  });
}

export function useSignUpMutation() {
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) =>
      signUpWithPassword(payload),
  });
}

