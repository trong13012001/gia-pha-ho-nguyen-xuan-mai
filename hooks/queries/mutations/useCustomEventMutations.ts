"use client";

import { QUERY_KEY } from "@/constants/queryKeys";
import {
  createCustomEvent,
  CustomEventWritePayload,
  deleteCustomEventById,
  updateCustomEvent,
} from "@/services/supabase/event.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateCustomEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CustomEventWritePayload) => {
      await createCustomEvent(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY.customEvents });
    },
    onError: (error) => {
      console.error("Failed to create custom event", error);
    },
  });
}

export function useUpdateCustomEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: { id: string; payload: CustomEventWritePayload }) => {
      await updateCustomEvent(args.id, args.payload);
    },
    onSuccess: async (_data, args) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY.customEvents });
      await queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY.customEvents, args.id],
      });
    },
    onError: (error) => {
      console.error("Failed to update custom event", error);
    },
  });
}

export function useDeleteCustomEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      await deleteCustomEventById(eventId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY.customEvents });
    },
    onError: (error) => {
      console.error("Failed to delete custom event", error);
    },
  });
}
