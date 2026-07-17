import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Em ambiente Node (Vercel serverless / dev), a Neon usa WebSocket para o pool.
neonConfig.webSocketConstructor = ws;

/**
 * Prisma Client como provider injetável do Nest, usando o driver adapter da Neon.
 * O adapter conecta ao Postgres sem depender do binário do query engine — o que
 * torna o deploy em funções serverless (Vercel) confiável.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL não definida');
    }
    const adapter = new PrismaNeon({ connectionString });
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
