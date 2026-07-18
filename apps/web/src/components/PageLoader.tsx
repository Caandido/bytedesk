import { Loader2 } from 'lucide-react';

/** Fallback de carregamento para rotas lazy (code-splitting). */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20 text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
    </div>
  );
}
