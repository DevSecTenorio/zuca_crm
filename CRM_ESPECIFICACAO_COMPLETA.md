# CRM SaaS - Seu Zuca e Beyond

**Data:** 16 de Setembro, 2026 | **Status:** MVP v1 | **Autor:** Vitor Tenório

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Escopo MVP](#escopo-mvp)
3. [Arquitetura Técnica](#arquitetura-técnica)
4. [Modelo de Dados](#modelo-de-dados)
5. [Roadmap (8 Semanas)](#roadmap-8-semanas)
6. [Padrões de Código](#padrões-de-código)
7. [Setup & Primeiro Run](#setup--primeiro-run)

---

## Visão Geral

### Problema
Marketplaces B2B como Seu Zuca precisam gerenciar relacionamentos com fornecedores/compradores, mas CRMs genéricos (Hubspot, Pipedrive) são caros ($50-300/mês), complexos e não integram nativamente com a plataforma.

### Solução
CRM nativo, intuitivo e integrado — comece em Seu Zuca, escale para qualquer marketplace B2B de construção. Foco em:

- **Zero-friction onboarding** (< 30 segundos primeira ação)
- **Integração profunda com plataforma** (pedidos → deals automático)
- **Automações inteligentes sem código**
- **Interface mobile-first**
- **Preço justo para PMEs** (vs Hubspot $50-300/mês/usuário)

### Nicho Estratégico
Marketplaces B2B + negócios consultivos Brasil (construção, indústria, distribuição) — espaço pouco explorado com CRMs genéricos ruins.

### Meta Seu Zuca
Validar usabilidade com vendedores reais, coletar feedback, iterar em 8 semanas de MVP. Usar como case study para próximos clientes.

---

## Escopo MVP

### Para Seu Zuca (Primeira Iteração)

#### Contatos & Empresas
- CRUD básico (nome, email, telefone, tags)
- Importação de clientes Seu Zuca (CNPJ, histórico de compras)
- Timeline de interações por contato
- Notas rápidas (< 5 segundos)
- Avatares/iniciais

#### Pipeline / Deals
- Kanban visual (drag-drop entre estágios: lead → proposal → negotiation → won/lost)
- Sincronização automática: novo pedido Seu Zuca = novo deal criado
- Valor em BRL, data esperada, probabilidade automática
- Histórico de deals (gained/lost, archived)
- Vinculação bidirecional (CRM ↔ Seu Zuca)

#### Atividades
- Notas por contato (rápidas, sem formulário)
- Registro manual de ligações (duração, notas)
- Histórico automático (será integração de email depois)
- Timestamps + assigned_to

#### Dashboard
- Pipeline summary (total value em aberto, qty deals por stage)
- Atividades recentes
- Próximos follow-ups (deals travados há 7+ dias)
- Seu Zuca sync status

#### Permissões
- **Admin:** Full access, gerenciar usuários
- **Sales Manager:** Ver relatórios do time, gerenciar team
- **Sales Rep:** Seu próprio pipeline + companhia

#### Integração Seu Zuca
- OAuth para autenticação (primeiro acesso)
- Webhook: novo pedido → criar/atualizar deal
- Dados cliente: CNPJ, razão social, histórico de compras
- Link bidirecional: from deal → pedido Seu Zuca

---

## Arquitetura Técnica

### Frontend
- **Framework:** Next.js 15 (App Router, React 19)
- **Styling:** TailwindCSS + Shadcn/ui (componentes prontos)
- **State:** Zustand (simplicidade) + TanStack Query (sync com server)
- **Real-time:** Socket.io (updates ao vivo de deals)
- **Forms:** React Hook Form (performance)
- **Icons:** Tabler (outline)

### Backend
- **Framework:** Nest.js 10 (modular, escalável)
- **ORM:** TypeORM + PostgreSQL (tipo-seguro, migrations)
- **Auth:** Passport.js + JWT (stateless)
- **Jobs:** Bull/BullMQ + Redis (automações assincronamente)
- **Real-time:** Socket.io server (WebSocket)
- **Docs:** Swagger (auto-gerado)

### Banco de Dados
- **Principal:** PostgreSQL 15+ (Supabase ou Railway recomendado)
- **Cache:** Redis 7+ (sessions, cache, queues)
- **Multi-tenancy:** Schema isolado por tenant (row-level security)

### Infraestrutura
- **Frontend:** Vercel (deploy automático, cache, edge functions)
- **Backend:** Railway ou Render (Docker, CI/CD integrado)
- **Banco:** Supabase (PostgreSQL managed) ou Railway
- **CI/CD:** GitHub Actions (build → test → deploy)
- **Local:** Docker Compose (postgres + redis)

### Ferramentas Externas
- **IA:** OpenAI API (resumos, sugestões de next step)
- **Email:** SendGrid (transacional) ou Resend
- **Seu Zuca:** API + Webhooks
- **Stripe:** Pagamentos (SaaS tier, depois)
- **Sentry:** Error tracking (production)

---

## Modelo de Dados

### Estrutura Multi-tenant

Todo dado é isolado por `org_id`. Row-level security no PostgreSQL garante isolamento.

```sql
-- Organization (Tenant)
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,  -- seu-zuca-crm-001
  plan VARCHAR(50) DEFAULT 'free',     -- free / pro / enterprise
  branding JSONB,                       -- logo_url, colors, etc
  settings JSONB,                       -- timezone, language
  created_at TIMESTAMP DEFAULT NOW()
);

-- User (per organization)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),           -- bcrypt
  name VARCHAR(255),
  avatar_url VARCHAR(500),
  role VARCHAR(50) DEFAULT 'rep',       -- admin / manager / rep
  status VARCHAR(50) DEFAULT 'active',  -- active / inactive
  permissions JSONB,                    -- granular permissions
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contact (pessoa física)
CREATE TABLE contacts (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type VARCHAR(50) DEFAULT 'individual', -- individual / company_contact
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  cnpj_cpf VARCHAR(20),                 -- se aplicável
  avatar_url VARCHAR(500),
  tags TEXT[],                          -- ['vip', 'decision-maker']
  custom_fields JSONB,                  -- flexible attributes
  linked_company_id UUID REFERENCES companies(id),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Company (pessoa jurídica)
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  cnpj VARCHAR(20) UNIQUE,              -- unique per org
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  segment VARCHAR(100),                 -- construção, indústria...
  website VARCHAR(500),
  phone VARCHAR(20),
  email VARCHAR(255),
  address JSONB,                        -- {rua, numero, cep, cidade...}
  seu_zuca_id VARCHAR(100),             -- external reference
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Deal (oportunidade de venda)
CREATE TABLE deals (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  company_id UUID REFERENCES companies(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  value DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'BRL',
  stage VARCHAR(50) DEFAULT 'lead',     -- lead/proposal/negotiation/won/lost
  probability INT DEFAULT 50,           -- 1-100, auto-calculated
  expected_close_date DATE,
  owner_id UUID REFERENCES users(id),   -- vendedor responsável
  status VARCHAR(50) DEFAULT 'active',  -- active/archived
  linked_seu_zuca_pedido_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Activity (ligação, email, nota, reunião)
CREATE TABLE activities (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  deal_id UUID REFERENCES deals(id),
  company_id UUID REFERENCES companies(id),
  type VARCHAR(50) NOT NULL,           -- call/email/note/meeting/task
  title VARCHAR(255),
  description TEXT,
  duration_minutes INT,                -- se call
  transcription TEXT,                  -- se call (future)
  assigned_to UUID REFERENCES users(id),
  completed_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Automation (workflows)
CREATE TABLE automations (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger VARCHAR(100),                -- deal_stage_changed / days_inactive / etc
  trigger_config JSONB,                -- {stage_id: '...', days_count: 7}
  actions JSONB,                       -- [{type: 'send_email', to: '...'}, ...]
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Integration (auth tokens para APIs externas)
CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,          -- seu_zuca / gmail / outlook / zapier
  access_token TEXT ENCRYPTED,         -- pgcrypto extension
  refresh_token TEXT ENCRYPTED,
  config JSONB,
  last_sync TIMESTAMP,
  sync_status VARCHAR(50) DEFAULT 'idle',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Índices Críticos

```sql
CREATE INDEX idx_deals_org_stage_owner ON deals(org_id, stage, owner_id);
CREATE INDEX idx_activities_org_contact_created ON activities(org_id, contact_id, created_at DESC);
CREATE INDEX idx_contacts_org_company ON contacts(org_id, linked_company_id);
CREATE INDEX idx_users_org_email ON users(org_id, email);
```

---

## Roadmap (8 Semanas)

### Fase 1: Núcleo (Semana 1-2)

**Backend**
- [ ] Setup Nest.js + TypeORM + PostgreSQL
- [ ] Schema Prisma (migration inicial)
- [ ] Auth module (JWT, login/register, refresh token)
- [ ] CRUD endpoints (contacts, companies, deals, activities)
- [ ] Seeding de dados fake para testes
- [ ] Permissões básicas (role-based access)
- [ ] Seu Zuca OAuth integration (stub)
- [ ] Unit tests (auth, CRUD)

**Frontend**
- [ ] Setup Next.js 15 + Shadcn/ui
- [ ] Auth pages (login, register, forgot password)
- [ ] Main layout (sidebar nav, header, logout)
- [ ] Contacts page (list view + create modal)
- [ ] Companies page (list + detail page)
- [ ] Deals Kanban (basic drag-drop, stage change)
- [ ] API client (fetch, mutations com React Query)
- [ ] Loading states + error handling

**Deliverable:** App MVP funciona end-to-end: login, criar contato/deal, visualizar pipeline.

---

### Fase 2: Comunicação (Semana 3-4)

**Backend**
- [ ] Seu Zuca API client (fetch customers, orders)
- [ ] Webhook receiver (novo pedido → create/update deal)
- [ ] Activity logging (CRUD em contatos cria activity entry)
- [ ] Timeline endpoint (activities ordenadas por data)
- [ ] Email sync integration stubs (Gmail/Outlook client setup)
- [ ] Testes E2E (webhook, sync)

**Frontend**
- [ ] Contact detail page (timeline, notas, links para company)
- [ ] Activity creation UI (notas rápidas, ligações)
- [ ] Seu Zuca sync indicator (status, última sync)
- [ ] Deal detail page (atividades, histórico, linked pedido)
- [ ] Global search (contatos, companies, deals)
- [ ] Filtering & sorting (por stage, owner, data)

**Seu Zuca Integration**
- [ ] OAuth login option (Seu Zuca)
- [ ] Importar clientes existentes (background job, Bull queue)
- [ ] Novo pedido em Seu Zuca → auto-criar/atualizar deal
- [ ] Link bidirecional (CRM deal → Seu Zuca pedido)

**Deliverable:** Seu Zuca integrado, histórico de atividades funciona, notas por contato.

---

### Fase 3: Inteligência (Semana 5-6)

**Backend**
- [ ] Automation engine (triggers + actions, visual builder backend)
- [ ] Job queue (Bull/BullMQ): processar automações assincronamente
- [ ] Scoring system (contato score 1-100 baseado em atividade + valor deals)
- [ ] Reports endpoints (pipeline summary, deals won/lost, atividades por rep)
- [ ] OpenAI integration (resumir notas com AI, sugerir próximo passo)
- [ ] Alerts (deal parado 7+ dias → notificação)
- [ ] Batch operations (update N deals)

**Frontend**
- [ ] Workflow builder (visual: trigger → action, sem código)
- [ ] Dashboard com métricas (total value, win rate, deals/stage, atividades)
- [ ] Reports page (pipeline forecast, individual performance, histórico)
- [ ] Scoring display (contatos ranqueados por score)
- [ ] Automation history (logs, erros)

**Features**
- [ ] Auto-follow-up: deal em stage X por Y dias → criar task
- [ ] Lead scoring: baseado em atividade, engagement, valor
- [ ] Pipeline forecast: projetar receita por mês
- [ ] Bulk actions: selecionar N deals → change stage, assign, etc

**Deliverable:** Automações funcionam, dashboard mostra insights, scoring ativo.

---

### Fase 4: Polish & Deploy (Semana 7-8)

**Frontend**
- [ ] Mobile responsivo (Tailwind mobile-first)
- [ ] PWA setup (offline support, installable)
- [ ] Dark mode toggle
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Loading states em todas as ações
- [ ] Error boundaries
- [ ] Toast notifications

**Backend Extras**
- [ ] WhatsApp webhook (enviar msgs de CRM → WhatsApp)
- [ ] Email logging (Gmail/Outlook: capture automático)
- [ ] Calendar sync stubs (reuniões → activities)
- [ ] Rate limiting + DDoS protection
- [ ] Logging centralizado (Winston)

**Infraestrutura**
- [ ] Docker setup final (dev + prod Dockerfile)
- [ ] CI/CD pipeline (GitHub Actions: lint → test → build → deploy)
- [ ] Database migrations (Prisma migrations)
- [ ] Monitoring básico (logs, error tracking)
- [ ] Deployment em staging Seu Zuca

**Documentação**
- [ ] README (setup, env vars, arquitetura)
- [ ] API docs (Swagger auto-gerado)
- [ ] User guide (features MVP)
- [ ] Developer guide (como adicionar feature)
- [ ] Troubleshooting

**Deliverable:** MVP pronto para produção, mobile funcional, deploy automatizado.

---

## Padrões de Código

### Estrutura de Pastas

```
crm-saas/
├── backend/
│   ├── src/
│   │   ├── auth/              # Login, JWT, roles
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── jwt.guard.ts
│   │   ├── contacts/          # CRUD contatos
│   │   │   ├── contacts.module.ts
│   │   │   ├── contacts.service.ts
│   │   │   ├── contacts.controller.ts
│   │   │   ├── contact.entity.ts
│   │   │   └── dto/
│   │   ├── companies/
│   │   ├── deals/
│   │   ├── activities/
│   │   ├── automations/       # Engine, jobs
│   │   ├── integrations/      # Seu Zuca, email, etc
│   │   ├── reporting/         # Dashboards, exports
│   │   ├── common/            # Utils, guards, pipes
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── interceptors/
│   │   │   ├── pipes/
│   │   │   └── utils/
│   │   ├── database/          # TypeORM config
│   │   │   ├── data-source.ts
│   │   │   └── migrations/
│   │   ├── config/            # Environment, secrets
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   │   └── e2e/
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js app router
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── contacts/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   └── layout.tsx
│   │   │   ├── deals/
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   ├── auth/
│   │   │   ├── layout.tsx     # Root layout
│   │   │   └── page.tsx       # Redirect to dashboard
│   │   ├── components/        # Reusable
│   │   │   ├── ui/            # Shadcn buttons, inputs, etc
│   │   │   ├── forms/         # Form components
│   │   │   ├── tables/        # Reusable table
│   │   │   ├── modals/        # Modal templates
│   │   │   ├── cards/         # Card components
│   │   │   └── navigation/
│   │   ├── hooks/             # Custom hooks
│   │   │   ├── useContacts.ts
│   │   │   ├── useDeals.ts
│   │   │   └── useAuth.ts
│   │   ├── api/               # API client
│   │   │   ├── client.ts      # Axios instance
│   │   │   ├── contacts.ts
│   │   │   ├── deals.ts
│   │   │   └── types.ts
│   │   ├── types/             # TypeScript types
│   │   │   ├── contact.ts
│   │   │   ├── deal.ts
│   │   │   └── api.ts
│   │   ├── utils/
│   │   │   ├── date.ts
│   │   │   ├── format.ts
│   │   │   └── validation.ts
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── context/           # React Context (auth, org)
│   │   └── lib/
│   ├── public/                # Static files
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── .env.local.example
│   └── README.md
│
├── docker-compose.yml         # postgres + redis
├── .github/
│   └── workflows/
│       ├── backend.yml        # backend CI/CD
│       └── frontend.yml       # frontend CI/CD
├── docs/
│   ├── API.md                 # Swagger link
│   ├── ARCHITECTURE.md
│   ├── SETUP.md
│   ├── DATABASE.md
│   └── CONTRIBUTING.md
└── README.md
```

### Convenções de Código

**TypeScript**
```typescript
// Strict mode SEMPRE
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true
  }
}

// Tipos explícitos
const userId: UUID = generateUUID();
const contacts: Contact[] = [];
const result: Result<User> = await userService.findById(id);
```

**Naming**
- `camelCase` para variáveis, funções, métodos
- `PascalCase` para classes, tipos, interfaces
- `UPPER_CASE` para constantes
- `snake_case` apenas em database columns

```typescript
// Bom
const getUserContacts = (userId: UUID): Contact[] => {};
const ContactCard: React.FC = () => {};
const MAX_RETRY_ATTEMPTS = 3;

// Evitar
const get_user_contacts = () => {};
const contactCard = () => {};
const max_retry_attempts = 3;
```

**Commits & PRs**
```bash
# Commit messages (Conventional Commits)
feat(contacts): add bulk delete action
fix(deals): kanban drag-drop mobile bug
docs(api): update auth endpoints
refactor(database): optimize queries
test(auth): add JWT validation tests
chore(deps): upgrade typescript 5.3

# PRs
- 1 feature por PR
- Squash merge para main
- Rebase antes de merge
```

**Testes**
```typescript
// Backend (Jest + Supertest)
describe('ContactService', () => {
  describe('findById', () => {
    it('should return contact when found', async () => {
      const result = await contactService.findById(contactId);
      expect(result).toEqual(mockContact);
    });

    it('should throw NotFoundException when not found', async () => {
      await expect(contactService.findById('invalid')).rejects.toThrow(NotFoundException);
    });
  });
});

// Frontend (Vitest + React Testing Library)
describe('ContactForm', () => {
  it('should submit form with valid data', async () => {
    const { getByRole } = render(<ContactForm onSubmit={onSubmit} />);
    await userEvent.type(getByRole('textbox', { name: /name/i }), 'Acme Corp');
    await userEvent.click(getByRole('button', { name: /save/i }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Acme Corp' }));
  });
});
```

**Environment Variables**
```bash
# Backend (.env)
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost/crm_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=super-secret-key-only-dev
JWT_EXPIRES_IN=7d

SEU_ZUCA_CLIENT_ID=xxx
SEU_ZUCA_CLIENT_SECRET=xxx
SEU_ZUCA_WEBHOOK_SECRET=xxx

OPENAI_API_KEY=sk-xxx
SENDGRID_API_KEY=SG.xxx

PORT=3000
LOG_LEVEL=debug

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CRM Seu Zuca
NEXT_PUBLIC_SEU_ZUCA_OAUTH_CLIENT_ID=xxx
```

**Logging**
```typescript
// Backend (Winston)
import { Logger } from '@nestjs/common';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  async createContact(dto: CreateContactDto) {
    this.logger.log(`Creating contact: ${dto.name}`, 'createContact');
    try {
      const contact = await this.contactRepository.save(dto);
      this.logger.log(`Contact created: ${contact.id}`, 'createContact');
      return contact;
    } catch (error) {
      this.logger.error(`Failed to create contact: ${error.message}`, error.stack);
      throw error;
    }
  }
}

// Frontend (console, dev only)
if (process.env.NODE_ENV === 'development') {
  console.log('[ContactForm] Submitting:', formData);
}
```

**Error Handling**
```typescript
// Custom Error Classes
export class AppError extends Error {
  constructor(message: string, public statusCode: number, public code: string) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

// Usage
throw new ValidationError('CNPJ inválido');
throw new NotFoundException('Contact not found');
```

---

## Setup & Primeiro Run

### Pré-requisitos

- Node.js 18+
- Docker + Docker Compose
- Git
- PostgreSQL 15 (opcional, vem no Docker)

### 1. Clonar & Instalar

```bash
# Clonar repositório
git clone https://github.com/seu-username/crm-saas.git
cd crm-saas

# Instalar dependências (workspaces)
npm install

# Setup env vars
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Editar .env com suas configs locais
nano backend/.env
nano frontend/.env.local
```

### 2. Banco de Dados

```bash
# Subir postgres + redis
docker-compose up -d

# Aguardar containers iniciarem (10-20s)
docker-compose ps

# Migrations (backend)
cd backend
npm run db:migrate

# Seeding com dados fake
npm run db:seed
```

### 3. Rodar Local

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Esperado: [Nest] 12:34:56 LOG [NestFactory] Nest application successfully started +123ms
# API rodando em http://localhost:3000

# Terminal 2: Frontend
cd frontend
npm run dev
# Esperado: ▲ Next.js 15.0.0
# Local: http://localhost:3001

# Terminal 3 (opcional): Redis CLI
redis-cli KEYS '*'  # verificar keys
```

### 4. Testar App

1. Abrir http://localhost:3001 no navegador
2. Login
   - Email: `admin@crm.local`
   - Senha: `password123`
3. Criar contato
   - Clique "Novo Contato"
   - Nome: "Acme Corp"
   - Email: "contact@acme.com"
   - Clique "Salvar"
4. Criar deal
   - Vá para "Deals"
   - Clique "Novo Deal"
   - Título: "Venda Q4 2024"
   - Valor: 50000
   - Stage: "Lead"
   - Clique "Criar"
5. Testar Kanban
   - Arraste deal de "Lead" para "Proposal"
   - Veja atividade no histórico

### Environment Vars Críticas

```bash
# backend/.env
DATABASE_URL=postgresql://crm_user:crm_pass@localhost:5432/crm_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key-change-in-production
NODE_ENV=development
LOG_LEVEL=debug

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CRM Seu Zuca (Local)
```

### Debugging

**Backend não sobe?**
```bash
# Checar porta 3000
lsof -i :3000
# Matar processo: kill -9 <PID>

# Checar logs
npm run dev 2>&1 | head -50

# Conectar ao banco diretamente
psql postgresql://crm_user:crm_pass@localhost/crm_dev
SELECT * FROM organizations;
```

**Frontend não compila?**
```bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run dev

# Verificar TypeScript
npx tsc --noEmit
```

**Webhook Seu Zuca não funciona?**
```bash
# Verificar ngrok (para dev local)
npx ngrok http 3000

# Configurar webhook em Seu Zuca: https://xxxx.ngrok.io/webhook/seu-zuca

# Ver requests
tail -f logs/webhook.log
```

---

## Próximos Passos

1. **Clonar estrutura** e rodar `docker-compose up`
2. **Primeiro dia:** Backend + DB + auth funcionando
3. **Dia 2-3:** Frontend CRUD básico
4. **Dia 4-5:** Seu Zuca integration
5. **Dia 6-8:** Kanban, dashboard, polish

**Commits diários** para validar progresso. **Feedback loop** rápido com Seu Zuca.

---

## Dúvidas?

Consulte este documento frequentemente. Ele evolui com o projeto.

- Arquitetura: veja seção [Arquitetura Técnica](#arquitetura-técnica)
- Modelo: veja seção [Modelo de Dados](#modelo-de-dados)
- Roadmap: veja seção [Roadmap (8 Semanas)](#roadmap-8-semanas)
- Setup: veja seção [Setup & Primeiro Run](#setup--primeiro-run)
