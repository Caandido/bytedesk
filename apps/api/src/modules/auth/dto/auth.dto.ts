import { createZodDto } from 'nestjs-zod';
import { registerSchema, loginSchema } from '@devflow/shared';

/** DTOs de auth derivados dos schemas Zod compartilhados (`@devflow/shared`). */
export class RegisterDto extends createZodDto(registerSchema) {}
export class LoginDto extends createZodDto(loginSchema) {}
