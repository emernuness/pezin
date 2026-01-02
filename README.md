# Pack do Pezin

Plataforma de monetização de conteúdo adulto para criadores venderem packs (coleções de imagens/vídeos). Conecta criadores com consumidores através de um marketplace seguro com processamento de pagamentos via Stripe.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 14+ (App Router), React, TypeScript |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Storage | Cloudflare R2 (S3-compatible) |
| Pagamentos | Stripe Checkout + Connect |
| UI | Tailwind CSS, shadcn/ui, React Bits |

## Estrutura do Monorepo

```
pack-do-pezin/
├── apps/
│   ├── api/          # NestJS Backend
│   ├── web/          # Next.js Frontend
│   └── worker/       # Cloudflare Worker (CDN)
├── packages/
│   └── shared/       # Schemas Zod e tipos compartilhados
├── docker-compose.yml
└── prd-pack-do-pezin.md
```

## Quick Start

```bash
# Instalar dependências
pnpm install

# Subir banco de dados
pnpm docker:up

# Rodar em desenvolvimento (API + Web + Worker)
pnpm dev
```

Isso inicia simultaneamente:
- **API** em `http://localhost:3001`
- **Web** em `http://localhost:3000`
- **Worker (CDN)** em `http://localhost:8787`

Para instruções detalhadas, consulte o [Guia de Desenvolvimento](./README-DEV.md).

## Cloudflare Worker (CDN)

O projeto inclui um Cloudflare Worker que serve como proxy seguro para arquivos do R2. Isso garante que:

- **URLs tokenizadas**: Frontend nunca vê paths reais do R2
- **Segurança**: Tokens JWT com expiração de 1 hora
- **Auditoria**: Estrutura organizada por usuário facilita auditorias

### Desenvolvimento Local

O Worker roda automaticamente com `pnpm dev`. Para rodar isoladamente:

```bash
pnpm worker:dev
```

### Deploy para Produção

```bash
# 1. Configurar secrets (uma vez)
cd apps/worker
wrangler secret put MEDIA_TOKEN_SECRET
wrangler secret put API_INTERNAL_KEY

# 2. Deploy
pnpm worker:deploy
```

### Variáveis de Ambiente

No backend (`apps/api/.env`):
```env
MEDIA_TOKEN_SECRET=<256-bit-secret>
MEDIA_TOKEN_EXPIRES_IN=3600
CDN_WORKER_URL=http://localhost:8787
WORKER_INTERNAL_API_KEY=<api-key>
```

No Worker (`apps/worker/.dev.vars` ou secrets):
```
MEDIA_TOKEN_SECRET=<mesmo-secret-do-backend>
API_INTERNAL_KEY=<mesmo-api-key>
```

## Credenciais de Teste (Seeder)

Após rodar o seeder (`pnpm db:seed`), as seguintes contas estarão disponíveis para teste:

| Tipo | Email | Senha |
|------|-------|-------|
| Comprador | `buyer_demo@local.test` | `Demo123!` |
| Criador | `creator_demo@local.test` | `Demo123!` |

**Rotas de teste:**
- Vitrine: `/`
- Dashboard (criador): `/dashboard`
- Minhas compras (comprador): `/me/purchases`
- Perfil criador: `/c/sofia-bela-1`

## Features

### Para Criadores
- Cadastro com verificação de idade (18+)
- Criação e gerenciamento de packs
- Upload direto para cloud (presigned URLs)
- Dashboard de vendas e métricas
- Stripe Connect para recebimentos
- Sistema de saque com período anti-fraude de 14 dias

### Para Consumidores
- Descoberta de packs por categorias
- Compra segura via Stripe Checkout
- Acesso permanente aos packs comprados
- URLs de download com tempo limitado

### Segurança
- Autenticação JWT com refresh token rotation
- Rate limiting
- Validação de arquivos (MIME + magic bytes)
- **CDN com URLs tokenizadas** (Cloudflare Worker)
- LGPD compliance

## Scripts Principais

```bash
pnpm dev              # Desenvolvimento (API + Web + Worker)
pnpm build            # Build de produção
pnpm test             # Testes
pnpm typecheck        # Verificação de tipos
pnpm prisma:studio    # Visualizar banco de dados
pnpm worker:dev       # Worker isoladamente
pnpm worker:deploy    # Deploy do Worker
```

## Documentação

- [Guia de Desenvolvimento](./README-DEV.md) - Setup local, comandos, endpoints
- [PRD Completo](./prd-pack-do-pezin.md) - Requisitos detalhados do produto
- [Design System](./design.json) - Cores, tipografia, componentes

## Status

🚧 Em desenvolvimento ativo

### Backend (API)
- [x] Autenticação JWT com refresh token rotation
- [x] Módulo de Packs (CRUD, publicação)
- [x] Módulo de Purchases (compras, histórico)
- [x] Integração Stripe (Checkout + Connect + Webhooks)
- [x] Storage R2 (upload via presigned URLs)
- [x] **Cloudflare Worker CDN** (URLs tokenizadas)
- [x] **MediaToken Module** (JWT para mídia)
- [x] Dashboard API (métricas de criadores)
- [x] API pública (listagem de packs/criadores)
- [x] Rate limiting e download logs
- [x] Schema Prisma completo (User, Pack, Purchase, Withdrawal, etc.)

### Frontend (Web)
- [x] Design System Neon Lime aplicado
- [x] Páginas de Auth (login, signup)
- [x] Dashboard do criador
- [x] Página de gerenciamento de packs
- [x] Página pública de pack (`/pack/[id]`)
- [x] Página de perfil do criador (`/c/[slug]`)
- [x] Minhas compras (`/me/purchases`)
- [x] Componentes: PackCard, CreatorCard, FilterBar, BuyButton, Pagination

### Pendente
- [ ] Onboarding Stripe Connect (fluxo completo)
- [ ] Sistema de saques (Withdrawals)
- [ ] Upload de arquivos no frontend
- [ ] Verificação de email
- [ ] Testes E2E completos

## Licença

Proprietary - Todos os direitos reservados.
