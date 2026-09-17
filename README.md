# CRM Seu Zuca

CRM SaaS nativo para marketplaces B2B, construído para o Seu Zuca. Veja a especificação completa em [`CRM_ESPECIFICACAO_COMPLETA.md`](./CRM_ESPECIFICACAO_COMPLETA.md).

## Status

**Fase 1 (Núcleo) em andamento** — auth, CRUD de contatos/empresas/deals/atividades, kanban básico e dashboard.

## Stack

- **Backend:** Nest.js 10 + TypeORM + PostgreSQL, JWT auth, Swagger
- **Frontend:** Next.js 15 (App Router) + TailwindCSS + Shadcn/ui + Zustand + TanStack Query
- **Infra local:** Docker Compose (Postgres + Redis)

## Setup

### Pré-requisitos

- Node.js 18+
- Docker + Docker Compose (ou uma instância PostgreSQL 15 acessível)

### 1. Instalar dependências

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Subir banco de dados

```bash
docker-compose up -d
```

Se você não tiver Docker, aponte `DATABASE_URL` (em `backend/.env`) para qualquer Postgres 15+ (ex: Supabase, Railway).

### 3. Rodar migrations e seed

```bash
cd backend
npm run db:migrate
npm run db:seed
```

### 4. Rodar local

```bash
# Terminal 1
cd backend && npm run dev
# API: http://localhost:3000/api
# Swagger: http://localhost:3000/docs

# Terminal 2
cd frontend && npm run dev
# App: http://localhost:3001
```

### 5. Login de teste (após seed)

- Email: `admin@crm.local`
- Senha: `password123`

## Estrutura

```
crm_seuzuca/
├── backend/     # Nest.js API
├── frontend/    # Next.js app
└── docker-compose.yml
```

Veja `backend/README.md` e `frontend/README.md` para detalhes de cada app.
