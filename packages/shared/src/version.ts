import { z } from 'zod';
import { idSchema, timestampsSchema } from './common';

/**
 * Contratos do sub-módulo **Versionamento** de um projeto e o gerador de changelog.
 * Cada categoria de mudança (novidades, correções, melhorias, breaking) é um texto
 * com um item por linha.
 */

const changeText = z.string().max(20_000).optional().default('');

/** Payload para criar uma versão. */
export const createVersionSchema = z.object({
  version: z.string().trim().min(1, 'A versão é obrigatória').max(40),
  description: z.string().max(10_000).optional().default(''),
  releasedAt: z.coerce.date().nullable().optional(),
  features: changeText,
  fixes: changeText,
  improvements: changeText,
  breaking: changeText,
});

/** Payload para atualizar uma versão (todos os campos opcionais). */
export const updateVersionSchema = createVersionSchema.partial();

/** Entidade completa retornada pela API. */
export const versionSchema = z
  .object({
    id: idSchema,
    projectId: idSchema,
    version: z.string(),
    description: z.string(),
    releasedAt: z.coerce.date().nullable(),
    features: z.string(),
    fixes: z.string(),
    improvements: z.string(),
    breaking: z.string(),
  })
  .merge(timestampsSchema);

export type CreateVersionInput = z.input<typeof createVersionSchema>;
export type UpdateVersionInput = z.input<typeof updateVersionSchema>;
export type ProjectVersion = z.infer<typeof versionSchema>;

/** Quebra um texto multilinha em itens (uma linha = um item), sem vazios. */
function toItems(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);
}

/**
 * Gera o changelog em Markdown a partir das versões (na ordem recebida —
 * normalmente da mais recente para a mais antiga). Só inclui seções com conteúdo.
 */
export function generateChangelog(versions: ProjectVersion[]): string {
  const blocks = versions.map((v) => {
    const date = v.releasedAt
      ? ` — ${new Date(v.releasedAt).toLocaleDateString('pt-BR')}`
      : '';
    const lines: string[] = [`## v${v.version}${date}`];

    if (v.description.trim()) lines.push('', v.description.trim());

    const section = (title: string, text: string) => {
      const items = toItems(text);
      if (items.length > 0) {
        lines.push('', `### ${title}`, ...items.map((i) => `- ${i}`));
      }
    };

    section('Novidades', v.features);
    section('Correções', v.fixes);
    section('Melhorias', v.improvements);
    section('Breaking Changes', v.breaking);

    return lines.join('\n');
  });

  return blocks.join('\n\n') || '_Nenhuma versão registrada ainda._';
}
