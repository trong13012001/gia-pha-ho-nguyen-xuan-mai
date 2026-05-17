import { queryKeys } from "@/constants/queryKeys";
import { fetchRelationships } from "@/services/relationships";
import { fetchPersonsList } from "@/services/persons";
import { useQuery } from "@tanstack/react-query";

export function useTreeQuery() {
  const personsQuery = useQuery({
    queryKey: queryKeys.persons,
    queryFn: fetchPersonsList,
  });

  const relationshipsQuery = useQuery({
    queryKey: queryKeys.relationships,
    queryFn: fetchRelationships,
  });

  return {
    persons: personsQuery.data ?? [],
    relationships: relationshipsQuery.data ?? [],
    isLoading: personsQuery.isLoading || relationshipsQuery.isLoading,
    isError: personsQuery.isError || relationshipsQuery.isError,
    refetch: () => {
      personsQuery.refetch();
      relationshipsQuery.refetch();
    },
  };
}
