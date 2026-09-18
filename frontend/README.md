# CRM Seu Zuca — Frontend

App Next.js 15 (App Router) + TailwindCSS + Shadcn/ui para o CRM Seu Zuca.

## Setup

```bash
npm install
cp .env.local.example .env.local   # ajuste NEXT_PUBLIC_API_URL se necessário
npm run dev
```

App disponível em `http://localhost:3001` (ou porta padrão do Next se rodado isoladamente, `3000`).

## Estrutura

```
src/
├── app/
│   ├── (auth)/          # login — layout centralizado, sem sidebar
│   └── (dashboard)/     # dashboard, contacts, companies, deals — protegido por AuthGuard
├── components/
│   ├── ui/               # componentes Shadcn/ui
│   ├── layout/           # sidebar, page header
│   ├── contacts/companies/deals/  # componentes específicos de domínio
│   └── providers/        # QueryProvider, AuthGuard
├── hooks/                # hooks TanStack Query por recurso
├── api/                  # client Axios + funções de API por recurso
├── store/                # Zustand (auth)
├── types/                # tipos compartilhados com a API
└── lib/                  # utils, formatação, labels de domínio
```

## Autenticação

Token JWT + dados do usuário são persistidos no `localStorage` via Zustand (`store/auth-store.ts`). O `AuthGuard` redireciona para `/login` quando não há token. O `apiClient` injeta o header `Authorization` automaticamente e desloga o usuário em respostas `401`.

## Kanban de Deals

Drag-and-drop nativo (HTML5 Drag and Drop API, sem dependência externa) em `components/deals/deal-kanban.tsx`. Ao soltar um card em outra coluna, chama `PATCH /deals/:id/stage` com atualização otimista via TanStack Query.
