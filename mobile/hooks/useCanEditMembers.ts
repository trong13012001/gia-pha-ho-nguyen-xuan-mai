import { canEditMembers } from "@/services/profile";
import { useProfileQuery } from "@/hooks/useProfileQuery";

export function useCanEditMembers() {
  const { data: profile, isLoading } = useProfileQuery();
  return {
    canEdit: canEditMembers(profile?.role),
    isLoading,
    role: profile?.role,
  };
}
