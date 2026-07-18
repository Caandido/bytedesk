import { Star } from 'lucide-react';
import type { CreateFavoriteInput } from '@devflow/shared';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  useFavorites,
  useAddFavorite,
  useRemoveFavorite,
} from './useFavorites';

/**
 * Botão de favoritar transversal — funciona para qualquer entidade (estudo,
 * projeto, roadmap…). Deriva o estado da lista de favoritos e alterna.
 */
export function FavoriteButton(props: CreateFavoriteInput) {
  const { type, entityId } = props;
  const favorites = useFavorites();
  const add = useAddFavorite();
  const remove = useRemoveFavorite();

  const isFavorite = (favorites.data ?? []).some(
    (f) => f.type === type && f.entityId === entityId,
  );

  const toggle = () => {
    if (isFavorite) {
      remove.mutate({ type, entityId });
    } else {
      add.mutate(props);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
      aria-pressed={isFavorite}
      onClick={toggle}
      disabled={add.isPending || remove.isPending}
    >
      <Star
        className={cn('size-4', isFavorite && 'fill-warning text-warning')}
      />
    </Button>
  );
}
