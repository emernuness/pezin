# Progress - Pack do Pezin

> Última atualização: 2025-01-03

## O Que Funciona

### Infraestrutura
- [x] Monorepo pnpm configurado
- [x] packages/shared com Zod schemas e types
- [x] Docker Compose para desenvolvimento
- [x] Schema Prisma completo
- [x] Sistema de Seed completo e idempotente
- [x] **Módulo Financeiro Gateway Agnostic** - Sprint 1 concluída

### Backend (API)

#### Autenticação
- [x] Signup com validação de idade
- [x] Login com JWT
- [x] Refresh token rotation
- [x] Logout com revogação
- [x] Guards: JwtAuthGuard, RolesGuard
- [x] Decorators: @CurrentUser, @Roles
- [x] Upload de avatar/cover com conversão WebP
- [x] Testes unitários e E2E

#### Módulos
- [x] **Health** - Status da API e database
- [x] **Packs** - Upload URLs, confirmação, download URLs, conversão de mídia
- [x] **Storage** - Integração Cloudflare R2, download/upload direto
- [x] **Stripe** - Checkout, Connect onboarding, webhooks
- [x] **Purchases** - Listagem e verificação de compras
- [x] **Dashboard** - Stats, balance, sales, chart
- [x] **Public** - Listagem de packs e creators
- [x] **Media** - Conversão de imagens (WebP) e vídeos (WebM)

#### Segurança
- [x] Rate limiting (100 req/min global, 10 req/min auth)
- [x] Download rate limiting (10/dia por arquivo)
- [x] Validação Zod via pipe customizado
- [x] Webhook signature verification
- [x] Idempotência de webhooks (StripeEvent)
- [x] **Cloudflare Worker CDN** - URLs tokenizadas, R2 escondido do frontend
- [x] **MediaToken Module** - JWT para acesso a mídia
- [x] **InternalApiGuard** - Protege endpoints internos

#### Módulo Financeiro Gateway Agnostic (Novo!)
- [x] **Modelos Prisma**: Wallet, LedgerEntry, Payment, Payout, WebhookEvent
- [x] **Campos User**: pixKey, pixKeyType
- [x] **Interface IPaymentGateway**: Contrato para todos os gateways
- [x] **Adapters**: SuitPay, EzzePay, Voluti
- [x] **GatewayFactory**: Seleção de gateway via ENV_CURRENT_GATEWAY
- [ ] PaymentService e PaymentController (Sprint 3)
- [ ] WebhookModule (Sprint 4)
- [ ] WalletModule e LedgerService (Sprint 5)
- [ ] Payout via PIX (Sprint 6)
- [ ] Migração de saldos Stripe (Sprint 7)
- [ ] Remoção completa do Stripe (Sprint 8)

### Frontend (Web)

#### Refatoração Completa (Sprints 1-7)
- [x] `utils/formatters.ts` - Formatadores compartilhados
- [x] `utils/constants.ts` - Constantes centralizadas
- [x] `components/common/` - PageHeader, EmptyState, ImageWithFallback, StatusBadge, LoadingScreen
- [x] `components/cards/` - PackCard, CreatorCard, StatCard, ActivityCard
- [x] `components/grids/` - PackGrid, GridSkeleton
- [x] `components/tables/` - DataTable, TableSkeleton
- [x] `components/forms/` - PasswordInput, FormField
- [x] Páginas refatoradas com `_components/`
- [x] Barrel exports em todas as pastas

#### Páginas Implementadas
- [x] `/` - Home/Landing
- [x] `/login` - Login (componentizado)
- [x] `/signup` - Cadastro (4 steps componentizados)
- [x] `/dashboard` - Dashboard do criador (refatorado)
- [x] `/dashboard/packs` - Gerenciamento de packs
- [x] `/dashboard/packs/[id]/edit` - Editor de pack (refatorado)
- [x] `/dashboard/balance` - Saldo e saques
- [x] `/pack/[id]` - Página pública do pack
- [x] `/c/[slug]` - Perfil público do criador
- [x] `/me/purchases` - Minhas compras
- [x] `/profile` - Edição de perfil (refatorado)

#### Sistema de Upload
- [x] `useMediaUpload` hook - Multi-arquivo, progress, conversão
- [x] `MediaUploader` component - Drag & drop, previews visuais
- [x] Conversão WebP no browser (Canvas API)
- [x] Progress tracking com XHR

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
- [x] **Testar fluxo completo** de upload com conversão ✅ (testado 2025-01-02)
- [x] **FFmpeg em Docker** - Adicionado ao Dockerfile ✅
- [ ] **Onboarding Stripe** - Fluxo completo no frontend
- [ ] **Verificação de Email** - Envio e confirmação

### Média Prioridade
- [ ] **Sistema de Saques** - Interface para solicitar saques
- [ ] **Página de Configurações** - Preferências do usuário

### Baixa Prioridade
- [ ] **Testes E2E** - Fluxo completo de compra
- [ ] **Recuperação de Senha** - Esqueci minha senha
- [ ] **Notificações** - Emails transacionais

## Status Atual

```
█████████████████████████  95% Backend
████████████████████████░  90% Frontend
█████████████████████████  95% Infraestrutura
████████████████████████░  90% Overall
```

## Problemas Conhecidos

- ~~**FFmpeg em Produção**: Verificar se o Docker tem FFmpeg instalado~~ ✅ Resolvido
- Nenhum bug crítico identificado

## Histórico de Releases

### v0.5.0 (2025-01-03)
- **Módulo Financeiro Gateway Agnostic - Sprint 1**
  - Novos modelos Prisma: Wallet, LedgerEntry, Payment, Payout, WebhookEvent
  - Novos enums: LedgerEntryType, TransactionType, PaymentStatus, PayoutStatus
  - Campos pixKey e pixKeyType adicionados ao User
  - Interface IPaymentGateway com tipos completos
  - Adapters: SuitPayAdapter, EzzePayAdapter, VolutiAdapter
  - GatewayFactory para seleção de gateway via ENV
  - BaseGatewayAdapter com funcionalidades comuns
  - Migration executada com sucesso
  - Plano de implementação completo em 8 sprints

### v0.4.0 (2025-01-02)
- **Cloudflare Worker CDN + R2 Security**
  - Nova estrutura de pastas: `users/{userId}/{username}/packs/{packId}/...`
  - MediaToken module para gerar/validar JWTs
  - Worker serve arquivos via proxy seguro
  - Frontend recebe apenas URLs tokenizadas opacas
  - InternalApiGuard para endpoints do Worker
  - Configuração completa para dev e produção

### v0.3.0 (2025-01-02)
- **Sistema de Conversão de Mídia (Backend)**
  - MediaService com Sharp e FFmpeg
  - Imagens → WebP (85% qualidade)
  - Vídeos → WebM (VP9/Opus)
  - Integrado em PacksService e AuthService
  - StorageService com download/upload direto

- **Sistema de Upload (Frontend)**
  - useMediaUpload hook completo
  - MediaUploader component com drag & drop
  - Previews visuais antes do upload
  - Conversão WebP no browser

- **Correção de Bug**
  - URLs de preview de packs agora usam signed URLs

### v0.2.0 (2025-01-01)
- **Grande Refatoração (Sprints 1-7)**
  - Utilitários compartilhados (formatters, constants)
  - Componentes organizados (common, cards, grids, tables, forms)
  - Páginas refatoradas com _components/
  - SignupForm e LoginForm componentizados
  - Barrel exports em todas as pastas
  - JSDoc em componentes principais

### v0.1.1 (2024-12-31)
- **Sistema de Seed robusto**
  - 24 usuários (12 creators + 12 buyers)
  - 20 packs (15 published + 5 drafts)
  - 184 arquivos, 45 previews
  - 25 purchases, 12 withdrawals
  - 46 download logs com cenários de rate limiting
  - Geração automática de 75 imagens temáticas
  - Idempotência garantida
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
apps/api/src/modules/     9 módulos (+media)
apps/web/src/app/         10+ rotas
apps/web/src/components/  5 categorias organizadas
apps/web/src/utils/       formatters + constants
apps/web/src/hooks/       useMediaUpload + outros
packages/shared/          schemas + types
```

## Próximo Milestone

**v0.6.0 - Módulo Financeiro Completo**
- [x] Sprint 1: Modelos Prisma e Interface IPaymentGateway ✅
- [x] Sprint 2: Adapters SuitPay, EzzePay, Voluti ✅
- [ ] Sprint 3: PaymentService e PaymentController
- [ ] Sprint 4: WebhookModule
- [ ] Sprint 5: WalletModule e LedgerService
- [ ] Sprint 6: Payout via PIX
- [ ] Sprint 7: Migração de saldos Stripe
- [ ] Sprint 8: Remoção completa do Stripe

**v0.7.0 - Produção Ready**
- [ ] Verificação de email
- [ ] Testes E2E críticos
- [ ] Deploy em produção
