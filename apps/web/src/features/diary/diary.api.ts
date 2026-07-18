import { apiFetch } from '@/services/api';
import type {
  DiaryEntry,
  CreateDiaryEntryInput,
  UpdateDiaryEntryInput,
} from '@devflow/shared';

/** Service da feature Diário de Desenvolvimento. Reusa `apiFetch`. */
export const diaryApi = {
  list: () => apiFetch<DiaryEntry[]>('/diary'),

  create: (input: CreateDiaryEntryInput) =>
    apiFetch<DiaryEntry>('/diary', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateDiaryEntryInput) =>
    apiFetch<DiaryEntry>(`/diary/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  remove: (id: string) =>
    apiFetch<DiaryEntry>(`/diary/${id}`, { method: 'DELETE' }),
};
