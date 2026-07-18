/**
 * @devflow/shared
 *
 * Contratos de dados (schemas Zod) e tipos compartilhados entre o backend (NestJS)
 * e o frontend (React). Fonte única da verdade: um schema Zod aqui vira o tipo TS,
 * a validação de DTO no back e a validação de formulário no front.
 *
 * À medida que os módulos de negócio forem implementados, cada um exporta seus
 * schemas a partir deste pacote (ex.: `study.ts`, `project.ts`, `bug.ts`).
 */

export * from './common';
export * from './note';
export * from './study';
export * from './project';
export * from './task';
export * from './bug';
export * from './dashboard';
export * from './search';
export * from './doc';
export * from './version';
export * from './roadmap';
export * from './wiki';
export * from './stats';
export * from './diary';
export * from './idea';
