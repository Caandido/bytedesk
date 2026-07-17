import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

/**
 * Página genérica "em construção" usada pelos módulos ainda não implementados,
 * para que a navegação já funcione desde a fundação.
 */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <Construction className="size-10 text-warning" />
          <p className="text-sm text-muted-foreground">
            Módulo em construção. Será implementado em uma próxima etapa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
