import { INestApplication } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';

/**
 * Configuração comum do app Nest, compartilhada entre o servidor local (main.ts)
 * e a função serverless do Vercel (serverless.ts).
 */
export function configureApp(app: INestApplication): void {
  // Validação global de DTOs a partir dos schemas Zod compartilhados.
  app.useGlobalPipes(new ZodValidationPipe());

  // Prefixo comum para toda a API.
  app.setGlobalPrefix('api');

  // Em produção (Vercel) front e API compartilham origem; em dev, libera o Vite.
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? true,
    credentials: true,
  });
}
