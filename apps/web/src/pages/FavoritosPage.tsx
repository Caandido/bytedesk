import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Loader2, Trash2 } from 'lucide-react';
import {
  FAVORITE_TYPE_LABELS,
  type Favorite,
  type FavoriteType,
} from '@devflow/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFavorites, useRemoveFavorite } from '@/features/favorites/useFavorites';

const ORDER: FavoriteType[] = ['PROJECT', 'STUDY', 'ROADMAP', 'WIKI', 'ERROR'];

/** Página de Favoritos transversais, agrupados por tipo. */
export function FavoritosPage() {
  const favorites = useFavorites();
  const remove = useRemoveFavorite();

  const grouped = useMemo(() => {
    const byType = new Map<FavoriteType, Favorite[]>();
    for (const f of favorites.data ?? []) {
      const list = byType.get(f.type) ?? [];
      list.push(f);
      byType.set(f.type, list);
    }
    return ORDER.map((type) => ({ type, items: byType.get(type) ?? [] })).filter(
      (g) => g.items.length > 0,
    );
  }, [favorites.data]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Favoritos</h1>
        <p className="text-muted-foreground">
          Acesso rápido ao que você marcou como favorito.
        </p>
      </div>

      {favorites.isLoading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando…
        </p>
      )}
      {favorites.isError && (
        <p className="text-sm text-danger">Erro ao carregar os favoritos.</p>
      )}

      {favorites.isSuccess && (favorites.data?.length ?? 0) === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Star className="size-10 text-warning" />
            <p className="text-sm text-muted-foreground">
              Nada favoritado ainda. Use a estrela ⭐ nos estudos, projetos e
              roadmaps.
            </p>
          </CardContent>
        </Card>
      )}

      {grouped.map((group) => (
        <div key={group.type} className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {FAVORITE_TYPE_LABELS[group.type]}
          </h2>
          {group.items.map((fav) => (
            <Card key={fav.id} className="transition-colors hover:border-primary/50">
              <CardContent className="flex items-center justify-between gap-3 p-3">
                <Link to={fav.url} className="flex min-w-0 items-center gap-2">
                  <Star className="size-4 shrink-0 fill-warning text-warning" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{fav.title}</p>
                    {fav.subtitle && (
                      <p className="truncate text-xs text-muted-foreground">
                        {fav.subtitle}
                      </p>
                    )}
                  </div>
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline">
                    {FAVORITE_TYPE_LABELS[fav.type]}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label="Remover dos favoritos"
                    onClick={() =>
                      remove.mutate({ type: fav.type, entityId: fav.entityId })
                    }
                    disabled={remove.isPending}
                  >
                    <Trash2 className="size-4 text-danger" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}
