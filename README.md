# DevFlow

**Programming Study & Project Manager** — um ambiente único para programadores organizarem
estudos, projetos, bugs, roadmaps, documentação e mais. Tema escuro, foco em velocidade e
produtividade.

> Este repositório contém a **fundação** do projeto: monorepo configurado, backend + frontend
> integrados e o esqueleto de navegação. Os módulos de negócio (Estudos, Projetos, Bugs...)
> ainda serão implementados. Veja a especificação completa em [`CLAUDE.md`](./CLAUDE.md).

## Stack

| Camada   | Tecnologias                                                                 |
| -------- | --------------------------------------------------------------------------- |
| Frontend | React, TypeScript, Vite, TailwindCSS, shadcn/ui, React Router, TanStack Query, Zustand, Zod |
| Backend  | NestJS, Prisma, PostgreSQL (Neon), nestjs-zod                              |
| Shared   | Schemas Zod + tipos compartilhados (`@devflow/shared`)                      |
| Deploy   | Vercel (frontend estático + API serverless na mesma origem)                |

## Estrutura

```
ByteDesk/
├─ api/           # Função serverless do Vercel (delega ao Nest compilado)
├─ apps/
│  ├─ api/        # Backend NestJS + Prisma + Postgres
│  └─ web/        # Frontend React + Vite
├─ packages/
│  └─ shared/     # Contratos Zod/tipos compartilhados
├─ vercel.json    # Configuração do deploy (build web + função /api)
└─ package.json   # npm workspaces
```

## Setup local

Requer **Node.js >= 20** e um banco **PostgreSQL** (recomendado: um banco Neon dedicado
chamado `bytedesk` — não reutilize bancos de outros projetos).

```bash
# 1. Instalar dependências (todos os workspaces)
npm install

# 2. Configurar o banco: copie o exemplo e preencha as URLs do Neon
cp apps/api/.env.example apps/api/.env
#   edite DATABASE_URL (pooled, host -pooler) e DIRECT_URL (direto)

# 3. Aplicar as migrations
npm run db:migrate

# 4. Subir API (:3000) e Web (:5173) juntos
npm run dev
```

Abra <http://localhost:5173>. Em dev, o Vite faz proxy de `/api` para a API.

## Scripts (raiz)

| Comando               | O que faz                                              |
| --------------------- | ------------------------------------------------------ |
| `npm run dev`         | Sobe API + Web em paralelo                             |
| `npm run build`       | Build de shared → api → web                            |
| `npm run vercel-build`| Build usado pelo Vercel (inclui `prisma migrate deploy`) |
| `npm run lint`        | Lint da API e da Web                                   |
| `npm run db:migrate`  | Cria/aplica migration em dev (`prisma migrate dev`)    |
| `npm run db:deploy`   | Aplica migrations em produção (`prisma migrate deploy`)|
| `npm run db:generate` | Regenera o Prisma Client                               |

## Deploy (Vercel)

Projeto **único** no Vercel:

- **Frontend** (Vite) é publicado como estático a partir de `apps/web/dist`.
- **API** roda como função serverless em `/api/*`, delegando ao app NestJS. Usa o
  **driver adapter da Neon** (sem binário de query engine — ideal para serverless).

Variáveis de ambiente (injetadas automaticamente pela **integração Neon do Vercel**):

| Variável                | Descrição                                            |
| ----------------------- | ---------------------------------------------------- |
| `DATABASE_URL`          | Conexão **pooled** do Neon (host com `-pooler`)      |
| `DATABASE_URL_UNPOOLED` | Conexão **direta** do Neon (para as migrations)      |
| `WEB_ORIGIN`            | (opcional) origem para CORS — mesma origem em prod   |

O `vercel-build` roda `prisma migrate deploy` no build, aplicando as migrations do
diretório `apps/api/prisma/migrations` ao banco.

## Versionamento e Releases

Releases são publicadas automaticamente no GitHub a partir de uma **tag de versão**
(`.github/workflows/release.yml`):

```bash
npm run release:patch   # 0.0.1 → 0.0.2   (ou release:minor / release:major)
```

O comando faz `npm version`, cria o commit + a tag `vX.Y.Z` e dá push com a tag.
O GitHub Actions então cria a Release com o número da versão e notas geradas
automaticamente a partir dos commits.

## Convenções

- **TypeScript estrito** em todos os pacotes.
- Todo dado persistido tem `createdAt` / `updatedAt`.
- Contratos de dados vivem em `@devflow/shared` (Zod → tipo TS → validação no back e no front).
- Cores sempre via design tokens do Tailwind (nunca hardcoded).
