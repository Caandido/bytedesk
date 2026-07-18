import { apiFetch } from '@/services/api';
import type {
  KnownError,
  CreateKnownErrorInput,
  UpdateKnownErrorInput,
} from '@devflow/shared';

/** Service da feature Banco de Erros. Reusa `apiFetch`. */
export const errorsApi = {
  list: () => apiFetch<KnownError[]>('/errors'),

  create: (input: CreateKnownErrorInput) =>
    apiFetch<KnownError>('/errors', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateKnownErrorInput) =>
    apiFetch<KnownError>(`/errors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  remove: (id: string) =>
    apiFetch<KnownError>(`/errors/${id}`, { method: 'DELETE' }),
};
