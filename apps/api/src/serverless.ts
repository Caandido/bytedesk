import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Express } from 'express';
import { AppModule } from './app.module';
import { configureApp } from './app.factory';

/**
 * Fábrica do app Nest sobre um Express "cru", para rodar como função serverless
 * (Vercel). A instância é cacheada entre invocações do mesmo container (warm start).
 * A função HTTP fica em /api/[...path].ts na raiz do repositório e importa o JS
 * compilado deste arquivo (apps/api/dist/serverless.js).
 */
let cachedApp: Express | null = null;

export async function getExpressApp(): Promise<Express> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: ['error', 'warn'] },
  );
  configureApp(app);
  await app.init();

  cachedApp = expressApp;
  return cachedApp;
}
