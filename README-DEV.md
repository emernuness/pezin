# Pack do Pezin - Development Guide

## Pré-requisitos

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

## Estrutura do Projeto

```
pack-do-pezin/
├── apps/
│   ├── api/          # NestJS Backend
│   └── web/          # Next.js Frontend
├── packages/
│   └── shared/       # Zod schemas e types compartilhados
└── docker-compose.yml
```

## Como Rodar Localmente

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

```bash
# API
cp apps/api/.env.example apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env
```

#### Configurando Webhooks Localmente (Stripe CLI)

Para testar o recebimento de pagamentos localmente, você deve usar o **Stripe CLI**:

1. **Inicie a escuta dos eventos:**
   ```bash
   stripe listen --forward-to localhost:3001/stripe/webhook
   ```
2. **Obtenha o Webhook Secret:**
   O comando acima gerará um código começando com `whsec_`. Copie este valor e cole na variável `STRIPE_WEBHOOK_SECRET` no seu arquivo `apps/api/.env`.

3. **Dispare um evento de teste (opcional):**
   Em outro terminal, você pode simular uma compra concluída:
   ```bash
   stripe trigger checkout.session.completed
   ```

### 3. Iniciar com Docker Compose

```bash
# Subir todos os serviços (postgres, api, web)
docker compose up -d

# Ver logs
docker compose logs -f

# Parar serviços
docker compose down
```

### 4. Executar migrations do Prisma

```bash
# Criar migration inicial
docker compose exec api pnpm prisma:migrate

# Gerar Prisma Client
docker compose exec api pnpm prisma:generate
```

### 5. Acessar aplicação

- Frontend: http://localhost:3000
- API: http://localhost:3001
- API Health: http://localhost:3001/health

## Desenvolvimento sem Docker

Se preferir rodar localmente sem Docker:

### 1. PostgreSQL local

```bash
# Certifique-se de ter PostgreSQL rodando na porta 5432
# Crie o database: packdopezin
```

### 2. Rodar API

```bash
cd apps/api
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev
```

### 3. Rodar Web

```bash
cd apps/web
pnpm install
pnpm dev
```

## Testes

### Testes Unitários (API)

```bash
cd apps/api
pnpm test
```

### Testes E2E (API)

```bash
cd apps/api
pnpm test:e2e
```

### Coverage

```bash
cd apps/api
pnpm test:cov
```

## Comandos Úteis

```bash
# Root workspace
pnpm dev              # Roda todos os projetos em paralelo
pnpm build            # Build de todos os projetos
pnpm test             # Roda todos os testes
pnpm lint             # Lint em todos os projetos
pnpm typecheck        # Type check em todos os projetos

# Prisma
pnpm prisma:generate  # Gera Prisma Client
pnpm prisma:migrate   # Cria e aplica migration
pnpm prisma:studio    # Abre Prisma Studio

# Docker
pnpm docker:up        # docker compose up -d
pnpm docker:down      # docker compose down
pnpm docker:logs      # docker compose logs -f
```

## Estrutura da API

### Auth Endpoints

- `POST /auth/signup` - Criar conta
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token (rotation)
- `POST /auth/logout` - Logout
- `GET /auth/verify-email?token=xxx` - Verificar email
- `GET /auth/me` - Perfil do usuário (protegido)

### Packs Endpoints (protegido)

- `POST /packs/:id/upload-url` - Solicitar URL de upload (presigned)
- `POST /packs/:id/files` - Confirmar upload de arquivo
- `GET /packs/:id/files` - Listar arquivos do pack
- `POST /packs/:packId/files/:fileId/download-url` - Solicitar URL de download

### Purchases Endpoints (protegido)

- `GET /me/purchases` - Listar minhas compras
- `GET /me/purchases/:packId` - Verificar se comprei um pack

### Dashboard Endpoints (protegido, apenas creators)

- `GET /dashboard/stats` - Estatísticas do criador
- `GET /dashboard/sales?limit=5` - Vendas recentes
- `GET /dashboard/balance` - Saldo (disponível e pendente)
- `GET /dashboard/chart?days=30` - Dados para gráfico de vendas

### Stripe Endpoints (protegido)

- `POST /stripe/checkout` - Criar sessão de checkout
- `POST /stripe/connect/onboard` - Iniciar onboarding Connect (creators)
- `GET /stripe/connect/status` - Status do Connect (creators)
- `POST /stripe/webhook` - Webhook do Stripe (sem auth)

### Public Endpoints (sem auth)

- `GET /public/packs` - Listar packs publicados (com paginação e filtros)
- `GET /public/packs/:id` - Detalhes de um pack
- `GET /public/creators/:slug` - Perfil do criador com seus packs

### Health Check

- `GET /health` - Status da API e database

## Fluxo de Autenticação

1. **Signup**: Cria usuário com senha hasheada (bcrypt, cost 12)
2. **Login**: Retorna access token (15min) + refresh token em cookie HTTP-only (7 dias)
3. **Refresh**: Rotaciona refresh token e retorna novo access token
4. **Logout**: Revoga refresh token

### Segurança

- ✅ Refresh tokens armazenados como hash SHA256
- ✅ Refresh token rotation (token antigo é revogado)
- ✅ Cookies HTTP-only, Secure, SameSite=strict
- ✅ Access token em memória (Zustand)
- ✅ Rate limiting: 100 req/min geral, 10 req/min em auth
- ✅ Validação de idade (18+)
- ✅ Validação de senha (min 8 chars, uppercase, lowercase, number)

## Features Implementadas

### Infraestrutura
- [x] Monorepo pnpm configurado
- [x] packages/shared com Zod schemas
- [x] Docker Compose para desenvolvimento local
- [x] Schema Prisma completo (User, Pack, Purchase, Withdrawal, DownloadLog, StripeEvent)

### Backend (API)
- [x] NestJS com Prisma, Auth module, JWT
- [x] Refresh token rotation e revogação
- [x] Guards e decorators (JwtAuthGuard, RolesGuard, @CurrentUser, @Roles)
- [x] Health endpoint
- [x] Módulo Packs (upload-url, confirmação, download com rate limit)
- [x] Módulo Storage (integração Cloudflare R2)
- [x] Módulo Stripe (Checkout, Connect, Webhooks)
- [x] Módulo Purchases (listagem, verificação)
- [x] Módulo Dashboard (stats, balance, sales, chart)
- [x] Módulo Public (listagem de packs e creators)
- [x] Testes unitários e E2E para auth

### Frontend (Web)
- [x] Next.js com Tailwind e shadcn/ui
- [x] Design System Neon Lime aplicado
- [x] Zustand auth store
- [x] Axios interceptors para refresh automático
- [x] Páginas: login, signup, dashboard
- [x] Página de gerenciamento de packs (/dashboard/packs)
- [x] Página pública de pack (/pack/[id])
- [x] Página de perfil do criador (/c/[slug])
- [x] Minhas compras (/me/purchases)
- [x] Componentes: PackCard, CreatorCard, FilterBar, BuyButton, Pagination, Badge, Button

## Próximos Passos

- [ ] Fluxo completo de onboarding Stripe Connect
- [ ] Interface de upload de arquivos no frontend
- [ ] Sistema de saques (Withdrawals)
- [ ] Fluxo de verificação de email
- [ ] CRUD completo de packs no frontend
- [ ] Testes E2E para fluxo de compra
