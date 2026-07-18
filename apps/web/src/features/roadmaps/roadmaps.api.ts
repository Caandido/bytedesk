import { apiFetch } from '@/services/api';
import type {
  Roadmap,
  RoadmapItem,
  CreateRoadmapInput,
  UpdateRoadmapInput,
  CreateRoadmapItemInput,
  UpdateRoadmapItemInput,
} from '@devflow/shared';

/** Service da feature Roadmaps. Reusa `apiFetch`. */
export const roadmapsApi = {
  list: () => apiFetch<Roadmap[]>('/roadmaps'),

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
};
