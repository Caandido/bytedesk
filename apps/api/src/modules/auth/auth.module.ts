import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Módulo global de autenticação. Registra o `JwtAuthGuard` como guard global
 * (`APP_GUARD`) — toda rota exige token, salvo as marcadas com `@Public()`.
 */
@Global()
@Module({
  imports: [
    // registerAsync: lê JWT_SECRET em runtime (após o ConfigModule carregar o
    // .env), não na avaliação do decorator.
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET não definida');
        }
        return { secret, signOptions: { expiresIn: '30d' } };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
  exports: [JwtModule],
})
export class AuthModule {}
