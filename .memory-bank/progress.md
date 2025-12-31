# Progress - Pack do Pezin

> Última atualização: 2024-12-31

## O Que Funciona

### Infraestrutura
- [x] Monorepo pnpm configurado
- [x] packages/shared com Zod schemas e types
- [x] Docker Compose para desenvolvimento
- [x] Schema Prisma completo
- [x] **Sistema de Seed completo e idempotente**

### Backend (API)

#### Autenticação
- [x] Signup com validação de idade
- [x] Login com JWT
- [x] Refresh token rotation
- [x] Logout com revogação
- [x] Guards: JwtAuthGuard, RolesGuard
- [x] Decorators: @CurrentUser, @Roles
- [x] Testes unitários e E2E

#### Módulos
- [x] **Health** - Status da API e database
- [x] **Packs** - Upload URLs, confirmação, download URLs
- [x] **Storage** - Integração Cloudflare R2
- [x] **Stripe** - Checkout, Connect onboarding, webhooks
- [x] **Purchases** - Listagem e verificação de compras
- [x] **Dashboard** - Stats, balance, sales, chart
- [x] **Public** - Listagem de packs e creators

#### Segurança
- [x] Rate limiting (100 req/min global, 10 req/min auth)
- [x] Download rate limiting (10/dia por arquivo)
- [x] Validação Zod via pipe customizado
- [x] Webhook signature verification
- [x] Idempotência de webhooks (StripeEvent)

### Frontend (Web)

#### Páginas Implementadas
- [x] `/` - Home/Landing
- [x] `/login` - Login
- [x] `/signup` - Cadastro
- [x] `/dashboard` - Dashboard do criador
- [x] `/dashboard/packs` - Gerenciamento de packs
- [x] `/pack/[id]` - Página pública do pack
- [x] `/c/[slug]` - Perfil público do criador
- [x] `/me/purchases` - Minhas compras

#### Componentes
- [x] PackCard
- [x] CreatorCard
- [x] FilterBar
- [x] BuyButton
- [x] Pagination
- [x] Badge (Design System)
- [x] Button (Design System)
- [x] UI base (shadcn/ui)

#### Estado e Serviços
- [x] Zustand auth store
- [x] Axios com interceptors para refresh
- [x] API service layer

#### Design System
- [x] Neon Lime theme aplicado
- [x] Cores, tipografia, sombras
- [x] Componentes estilizados

## O Que Falta Construir

### Alta Prioridade
- [ ] **Upload no Frontend** - Interface para upload de arquivos nos packs
- [ ] **Onboarding Stripe** - Fluxo completo no frontend
- [ ] **CRUD de Packs** - Criar/editar packs no dashboard
- [ ] **Verificação de Email** - Envio e confirmação

### Média Prioridade
- [ ] **Sistema de Saques** - Interface para solicitar saques
- [ ] **Edição de Perfil** - Foto, bio, slug
- [ ] **Página de Configurações** - Preferências do usuário

### Baixa Prioridade
- [ ] **Testes E2E** - Fluxo completo de compra
- [ ] **Recuperação de Senha** - Esqueci minha senha
- [ ] **Notificações** - Emails transacionais

## Status Atual

```
████████████████████░░░░░  80% Backend
██████████████░░░░░░░░░░░  60% Frontend
████████████████████████░  95% Infraestrutura
██████████████████░░░░░░░  70% Overall
```

## Problemas Conhecidos

Nenhum bug crítico identificado. Itens pendentes são features novas.

## Histórico de Releases

### v0.1.1 (2024-12-31)
- **Sistema de Seed robusto**
  - 24 usuários (12 creators + 12 buyers)
  - 20 packs (15 published + 5 drafts)
  - 184 arquivos, 45 previews
  - 25 purchases, 12 withdrawals
  - 46 download logs com cenários de rate limiting
  - Geração automática de 75 imagens temáticas (neon/sensual)
  - Idempotência garantida (pode rodar múltiplas vezes)
- Scripts: `pnpm db:seed` e `pnpm db:reset`
- Contas demo: `buyer_demo@local.test` / `creator_demo@local.test`

### v0.1.0 (2024-12)
- Setup inicial do monorepo
- Autenticação completa
- Módulos core da API
- Páginas básicas do frontend
- Design System aplicado

## Métricas de Código

```
apps/api/src/modules/     8 módulos
apps/web/src/app/         8 rotas
apps/web/src/components/  7 componentes
packages/shared/          schemas + types
```

## Próximo Milestone

**v0.2.0 - Flow Completo do Criador**
- [ ] Upload de arquivos no frontend
- [ ] CRUD de packs no dashboard
- [ ] Onboarding Stripe integrado
- [ ] Verificação de email
