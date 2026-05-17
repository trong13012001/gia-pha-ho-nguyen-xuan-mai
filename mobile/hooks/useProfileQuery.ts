import { queryKeys } from "@/constants/queryKeys";
import { fetchProfileByUserId } from "@/services/profile";
import { useSession } from "@/hooks/useSession";
import { useQuery } from "@tanstack/react-query";

export function useProfileQuery() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: queryKeys.profile(userId ?? ""),
    queryFn: () => fetchProfileByUserId(userId as string),
    enabled: Boolean(userId),
  });
}
