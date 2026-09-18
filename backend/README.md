# CRM Seu Zuca — Backend

API Nest.js + TypeORM + PostgreSQL para o CRM Seu Zuca. Veja a especificação completa em [`../CRM_ESPECIFICACAO_COMPLETA.md`](../CRM_ESPECIFICACAO_COMPLETA.md).

## Requisitos

- Node.js 18+
- PostgreSQL 15+ (local via `docker-compose up -d` na raiz do repo, ou serviço gerenciado)

## Setup

```bash
npm install
cp .env.example .env   # ajuste DATABASE_URL, JWT_SECRET etc
npm run db:migrate
npm run db:seed
npm run dev
```

API disponível em `http://localhost:3000/api`. Swagger em `http://localhost:3000/docs`.

## Scripts

| Script | Descrição |
| --- | --- |
| `npm run dev` | Inicia em modo watch |
| `npm run build` | Build de produção (`dist/`) |
| `npm run start:prod` | Roda o build |
| `npm run test` | Testes unitários (Jest) |
| `npm run test:e2e` | Testes end-to-end |
| `npm run db:migrate` | Roda migrations pendentes |
| `npm run db:migrate:generate -- src/database/migrations/NomeDaMigration` | Gera nova migration a partir das entidades |
| `npm run db:migrate:revert` | Reverte última migration |
| `npm run db:seed` | Popula banco com dados de exemplo |

## Módulos (Fase 1)

- `auth` — login, JWT (usuários são criados apenas por admins em `/users`, sem autocadastro)
- `users` — listagem de usuários da organização
- `contacts` — CRUD de contatos
- `companies` — CRUD de empresas
- `deals` — CRUD de deals + kanban (`PATCH /deals/:id/stage`) + resumo de pipeline
- `activities` — notas, ligações, eventos automáticos de sistema (timeline)
- `reporting` — endpoint `/dashboard` agregando pipeline + atividades recentes

Todas as rotas (exceto `/auth/login`) exigem `Authorization: Bearer <token>` e são automaticamente escopadas por `org_id` a partir do usuário autenticado.

## Login de teste (após seed)

- Email: `admin@crm.local`
- Senha: `password123`
