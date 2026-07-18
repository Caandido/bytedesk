import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  Favorite,
  CreateFavoriteInput,
  FavoriteType,
} from '@devflow/shared';
import { apiFetch } from '@/services/api';

const FAVORITES_KEY = ['favorites'] as const;

export function useFavorites() {
  return useQuery({
    queryKey: FAVORITES_KEY,
    queryFn: () => apiFetch<Favorite[]>('/favorites'),
  });
}

export function useAddFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFavoriteInput) =>
      apiFetch<Favorite>('/favorites', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: FAVORITES_KEY }),
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, entityId }: { type: FavoriteType; entityId: string }) =>
      apiFetch(`/favorites/${type}/${entityId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: FAVORITES_KEY }),
  });
}
