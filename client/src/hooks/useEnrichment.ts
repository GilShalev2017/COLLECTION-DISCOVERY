import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enrichArtwork } from "../api/client";
import type { Artwork } from "../types";

export function useEnrichment() {
  const queryClient = useQueryClient();

  const enrichMutation = useMutation<Artwork, Error, string>({
    mutationFn: async (id: string) => {
      const enrichedArtwork = await enrichArtwork(id);
      return enrichedArtwork;
    },
    onSuccess: (enrichedArtwork) => {
      // Update the cached artwork in all relevant queries
      queryClient.setQueriesData(
        { queryKey: ["items"] },
        (oldData: any) => {
          if (!oldData) return oldData;

          // Handle paginated response
          if (oldData.items && Array.isArray(oldData.items)) {
            return {
              ...oldData,
              items: oldData.items.map((item: Artwork) =>
                item.id === enrichedArtwork.id ? enrichedArtwork : item
              ),
            };
          }

          // Handle array response
          if (Array.isArray(oldData)) {
            return oldData.map((item: Artwork) =>
              item.id === enrichedArtwork.id ? enrichedArtwork : item
            );
          }

          return oldData;
        }
      );

      // Invalidate all items queries to ensure fresh data across all pages
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (error) => {
      console.error("Enrichment failed:", error);
    },
  });

  const enrich = async (id: string): Promise<Artwork> => {
    return enrichMutation.mutateAsync(id);
  };

  const isEnriching = (id: string): boolean => {
    return enrichMutation.variables === id && enrichMutation.isPending;
  };

  return {
    enrich,
    isEnriching,
    error: enrichMutation.error,
    isLoading: enrichMutation.isPending,
  };
}
