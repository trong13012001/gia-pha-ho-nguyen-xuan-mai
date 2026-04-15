"use client";

import { queryKeys } from "@/constants/queryKeys";
import { getAdminUsers } from "@/services/supabase/user.service";
import { AdminUserData } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useUsersQuery(initialUsers?: AdminUserData[]) {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => getAdminUsers(),
    initialData: initialUsers,
  });
}

