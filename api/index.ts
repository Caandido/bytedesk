import type { IncomingMessage, ServerResponse } from 'node:http';
// Importa o app Nest JÁ COMPILADO (nest build → tsc preserva os metadados dos
// decorators). Compilar aqui com esbuild perderia esses metadados e quebraria a DI.
import { getExpressApp } from '../apps/api/dist/serverless.js';

/**
 * Função serverless do Vercel que atende todas as rotas /api/* delegando ao app
 * Nest sobre Express. O prefixo global "/api" do Nest casa com o caminho recebido.
 */
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const app = await getExpressApp();
  app(req, res);
}
