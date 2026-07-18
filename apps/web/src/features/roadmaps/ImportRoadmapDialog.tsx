import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Download, ListChecks } from 'lucide-react';
import type { RoadmapTemplateSummary } from '@devflow/shared';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRoadmapTemplates, useImportRoadmap } from './useRoadmaps';

interface ImportRoadmapDialogProps {
  open: boolean;
  onClose: () => void;
}

/** Modal para importar um roadmap do catálogo curado (roadmap.sh). */
export function ImportRoadmapDialog({ open, onClose }: ImportRoadmapDialogProps) {
  const templates = useRoadmapTemplates();
  const importRoadmap = useImportRoadmap();
  const navigate = useNavigate();
  const [importingId, setImportingId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const byCat = new Map<string, RoadmapTemplateSummary[]>();
    for (const t of templates.data ?? []) {
      const list = byCat.get(t.category) ?? [];
      list.push(t);
      byCat.set(t.category, list);
    }
    return [...byCat.entries()];
  }, [templates.data]);

  const handleImport = (template: RoadmapTemplateSummary) => {
    setImportingId(template.id);
    importRoadmap.mutate(template.id, {
      onSuccess: (roadmap) => {
        onClose();
        navigate(`/roadmaps/${roadmap.id}`);
      },
      onSettled: () => setImportingId(null),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Importar roadmap"
      className="max-w-xl"
    >
      <p className="mb-3 text-sm text-muted-foreground">
        Trilhas curadas baseadas no roadmap.sh. Importar cria um roadmap com os
        tópicos como itens de checklist.
      </p>

      {templates.isLoading && (
        <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando catálogo…
        </p>
      )}
      {templates.isError && (
        <p className="py-4 text-sm text-danger">Erro ao carregar o catálogo.</p>
      )}

      <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
        {grouped.map(([category, list]) => (
          <div key={category} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {category}
            </h3>
            {list.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{template.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {template.description}
                  </p>
                  <Badge variant="default" className="mt-1">
                    <ListChecks className="size-3" /> {template.itemCount} itens
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleImport(template)}
                  disabled={importRoadmap.isPending}
                >
                  {importingId === template.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  Importar
                </Button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Dialog>
  );
}
