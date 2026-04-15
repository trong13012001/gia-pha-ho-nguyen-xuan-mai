"use client";

import { queryKeys } from "@/constants/queryKeys";
import {
  adminCreateUser,
  removeUserById,
  setUserActiveStatus,
  setUserRole,
} from "@/services/supabase/user.service";
import { AdminUserData, UserRole } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type CreateUserPayload = {
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
};

export function useSetUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: { userId: string; role: UserRole }) =>
      setUserRole(args.userId, args.role),
    onMutate: async ({ userId, role }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users });
      const previous = queryClient.getQueryData<AdminUserData[]>(queryKeys.users);
      if (previous) {
        queryClient.setQueryData<AdminUserData[]>(
          queryKeys.users,
          previous.map((u) => (u.id === userId ? { ...u, role } : u)),
        );
      }
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.users, context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useSetUserActiveStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: { userId: string; isActive: boolean }) =>
      setUserActiveStatus(args.userId, args.isActive),
    onMutate: async ({ userId, isActive }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users });
      const previous = queryClient.getQueryData<AdminUserData[]>(queryKeys.users);
      if (previous) {
        queryClient.setQueryData<AdminUserData[]>(
          queryKeys.users,
          previous.map((u) => (u.id === userId ? { ...u, is_active: isActive } : u)),
        );
      }
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.users, context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => removeUserById(userId),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users });
      const previous = queryClient.getQueryData<AdminUserData[]>(queryKeys.users);
      if (previous) {
        queryClient.setQueryData<AdminUserData[]>(
          queryKeys.users,
          previous.filter((u) => u.id !== userId),
        );
      }
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.users, context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateUserPayload) => adminCreateUser(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

