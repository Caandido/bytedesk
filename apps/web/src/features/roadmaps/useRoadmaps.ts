import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  CreateRoadmapInput,
  UpdateRoadmapInput,
  CreateRoadmapItemInput,
  UpdateRoadmapItemInput,
} from '@devflow/shared';
import { roadmapsApi } from './roadmaps.api';

/** Chaves de cache da feature Roadmaps. */
export const roadmapsKeys = {
  all: ['roadmaps'] as const,
  detail: (id: string) => ['roadmaps', id] as const,
};

export function useRoadmaps() {
  return useQuery({ queryKey: roadmapsKeys.all, queryFn: roadmapsApi.list });
}

export function useRoadmap(id: string | undefined) {
  return useQuery({
    queryKey: roadmapsKeys.detail(id ?? ''),
    queryFn: () => roadmapsApi.byId(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateRoadmap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoadmapInput) => roadmapsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: roadmapsKeys.all }),
  });
}

/** Catálogo de templates (roadmap.sh curado). */
export function useRoadmapTemplates() {
  return useQuery({
    queryKey: ['roadmap-templates'],
    queryFn: roadmapsApi.templates,
    staleTime: Infinity,
  });
}

/** Detalhe de um template (guia completo com itens/descrições/links). */
export function useRoadmapTemplate(templateId: string | undefined) {
  return useQuery({
    queryKey: ['roadmap-template', templateId],
    queryFn: () => roadmapsApi.template(templateId as string),
    enabled: Boolean(templateId),
    staleTime: Infinity,
  });
}

export function useImportRoadmap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => roadmapsApi.import(templateId),
    onSuccess: () => qc.invalidateQueries({ queryKey: roadmapsKeys.all }),
  });
}

export function useUpdateRoadmap(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateRoadmapInput) => roadmapsApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roadmapsKeys.all });
      qc.invalidateQueries({ queryKey: roadmapsKeys.detail(id) });
    },
  });
}

export function useDeleteRoadmap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roadmapsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: roadmapsKeys.all }),
  });
}

// ─── Itens ─────────────────────────────────────────────────────────────────

export function useAddRoadmapItem(roadmapId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoadmapItemInput) =>
      roadmapsApi.addItem(roadmapId, input),
    onSuccess: () => invalidate(qc, roadmapId),
  });
}

export function useUpdateRoadmapItem(roadmapId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      input,
    }: {
      itemId: string;
      input: UpdateRoadmapItemInput;
    }) => roadmapsApi.updateItem(roadmapId, itemId, input),
    onSuccess: () => invalidate(qc, roadmapId),
  });
}

export function useDeleteRoadmapItem(roadmapId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => roadmapsApi.removeItem(roadmapId, itemId),
    onSuccess: () => invalidate(qc, roadmapId),
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>, roadmapId: string) {
  qc.invalidateQueries({ queryKey: roadmapsKeys.detail(roadmapId) });
  qc.invalidateQueries({ queryKey: roadmapsKeys.all });
}
