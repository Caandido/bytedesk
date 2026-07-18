import { apiFetch } from '@/services/api';
import type {
  Roadmap,
  RoadmapItem,
  RoadmapTemplateSummary,
  RoadmapTemplateDetail,
  CreateRoadmapInput,
  UpdateRoadmapInput,
  CreateRoadmapItemInput,
  UpdateRoadmapItemInput,
  ReorderRoadmapItemsInput,
} from '@devflow/shared';

/** Service da feature Roadmaps. Reusa `apiFetch`. */
export const roadmapsApi = {
  list: () => apiFetch<Roadmap[]>('/roadmaps'),

  templates: () =>
    apiFetch<RoadmapTemplateSummary[]>('/roadmaps/templates'),

  template: (templateId: string) =>
    apiFetch<RoadmapTemplateDetail>(`/roadmaps/templates/${templateId}`),

  import: (templateId: string) =>
    apiFetch<Roadmap>('/roadmaps/import', {
      method: 'POST',
      body: JSON.stringify({ templateId }),
    }),

  byId: (id: string) => apiFetch<Roadmap>(`/roadmaps/${id}`),

  create: (input: CreateRoadmapInput) =>
    apiFetch<Roadmap>('/roadmaps', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateRoadmapInput) =>
    apiFetch<Roadmap>(`/roadmaps/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  remove: (id: string) =>
    apiFetch<Roadmap>(`/roadmaps/${id}`, { method: 'DELETE' }),

  addItem: (roadmapId: string, input: CreateRoadmapItemInput) =>
    apiFetch<RoadmapItem>(`/roadmaps/${roadmapId}/items`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateItem: (
    roadmapId: string,
    itemId: string,
    input: UpdateRoadmapItemInput,
  ) =>
    apiFetch<RoadmapItem>(`/roadmaps/${roadmapId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  removeItem: (roadmapId: string, itemId: string) =>
    apiFetch<RoadmapItem>(`/roadmaps/${roadmapId}/items/${itemId}`, {
      method: 'DELETE',
    }),

  reorderItems: (roadmapId: string, input: ReorderRoadmapItemsInput) =>
    apiFetch<Roadmap>(`/roadmaps/${roadmapId}/items/reorder`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
};
