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
│   └── web/          # Next.js Frontend
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

# Rodar em desenvolvimento
pnpm dev
```

Para instruções detalhadas, consulte o [Guia de Desenvolvimento](./README-DEV.md).

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
- LGPD compliance

## Scripts Principais

```bash
pnpm dev              # Desenvolvimento
pnpm build            # Build de produção
pnpm test             # Testes
pnpm typecheck        # Verificação de tipos
pnpm prisma:studio    # Visualizar banco de dados
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
