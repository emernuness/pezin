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

## PR-1 Checklist

- [x] Monorepo pnpm configurado
- [x] packages/shared com Zod schemas
- [x] NestJS com Prisma, Auth module, JWT
- [x] Refresh token rotation e revogação
- [x] Next.js com Tailwind, shadcn/ui
- [x] Zustand auth store
- [x] Axios interceptors para refresh automático
- [x] Páginas de login, signup, dashboard
- [x] Guards e decorators (JwtAuthGuard, RolesGuard, @CurrentUser, @Roles)
- [x] Testes unitários e E2E para auth
- [x] Docker Compose para desenvolvimento local
- [x] Health endpoint

## Próximos Passos (PR-2)

- Stripe Checkout integration
- Stripe Connect para creators
- Webhook idempotente (checkout.session.completed, charge.refunded)
- Purchase model com controle de duplicatas
