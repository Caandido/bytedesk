import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from './app.module';
import { configureApp } from './app.factory';

// Servidor HTTP local (dev). Em produção o app roda como função serverless (serverless.ts).
async function bootstrap(): Promise<void> {
  ConfigModule.forRoot({ isGlobal: true });

  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 DevFlow API rodando em http://localhost:${port}/api`);
}

void bootstrap();
