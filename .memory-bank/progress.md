# Progress - Pack do Pezin

> Última atualização: 2026-01-03

## O Que Funciona

### Infraestrutura
- [x] Monorepo pnpm configurado
- [x] packages/shared com Zod schemas e types
- [x] Docker Compose para desenvolvimento
- [x] Schema Prisma completo
- [x] Sistema de Seed completo e idempotente
- [x] **Módulo Financeiro Gateway Agnostic** - COMPLETO ✅

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
- [x] **Payment** - Checkout PIX, consulta de status (Gateway Agnostic)
- [x] **Webhook** - Processamento de webhooks de todos os gateways
- [x] **Wallet** - Saldo, histórico, saques via PIX
- [x] **Purchases** - Listagem e verificação de compras
- [x] **Dashboard** - Stats, balance, sales, chart
- [x] **Public** - Listagem de packs e creators
- [x] **Media** - Conversão de imagens (WebP) e vídeos (WebM)

#### Segurança
- [x] Rate limiting (100 req/min global, 10 req/min auth)
- [x] Download rate limiting (10/dia por arquivo)
- [x] Validação Zod via pipe customizado
- [x] Webhook signature verification (HMAC)
- [x] Idempotência de webhooks (WebhookEvent)
- [x] **Cloudflare Worker CDN** - URLs tokenizadas, R2 escondido do frontend
- [x] **MediaToken Module** - JWT para acesso a mídia
- [x] **InternalApiGuard** - Protege endpoints internos
- [x] **Row Locking** - SELECT FOR UPDATE para saques

#### Módulo Financeiro Gateway Agnostic ✅
- [x] **Modelos Prisma**: Wallet, LedgerEntry, Payment, Payout, WebhookEvent
- [x] **Campos User**: pixKey, pixKeyType
- [x] **Interface IPaymentGateway**: Contrato para todos os gateways
- [x] **Adapters**: SuitPay, EzzePay, Voluti (todos implementados)
- [x] **GatewayFactory**: Seleção de gateway via ENV_CURRENT_GATEWAY
- [x] **PaymentService**: Checkout PIX, consulta de status
- [x] **PaymentController**: Endpoints de checkout e compras
- [x] **WebhookModule**: Processamento idempotente de webhooks
- [x] **LedgerService**: Double-entry bookkeeping
- [x] **WalletModule**: Saldo, histórico, CRON de liberação
- [x] **PayoutService**: Saques via PIX com row locking
- [x] **Script de Migração**: Stripe → Wallet
- [x] **Remoção do Stripe**: Módulo, dependências e campos removidos

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
- [ ] **Integração Frontend PIX** - Tela de checkout PIX
- [ ] **Tela de Saques** - Interface para solicitar saques via PIX
- [ ] **Configuração de Chave PIX** - Formulário no perfil

### Média Prioridade
- [ ] **Verificação de Email** - Envio e confirmação
- [ ] **Página de Configurações** - Preferências do usuário

### Baixa Prioridade
- [ ] **Testes E2E** - Fluxo completo de compra PIX
- [ ] **Recuperação de Senha** - Esqueci minha senha
- [ ] **Notificações** - Emails transacionais

## Status Atual

```
█████████████████████████  100% Backend (Gateway Agnostic)
████████████████████████░  90% Frontend
█████████████████████████  100% Infraestrutura
█████████████████████████  95% Overall
```

## Problemas Conhecidos

- Nenhum bug crítico identificado
- Erros de lint pré-existentes em csrf.guard.ts (não críticos)

## Histórico de Releases

### v0.6.0 (2026-01-03)
- **Módulo Financeiro Gateway Agnostic - COMPLETO**
  - Sprint 1: Modelos Prisma e Interface IPaymentGateway ✅
  - Sprint 2: Adapters SuitPay, EzzePay, Voluti ✅
  - Sprint 3: PaymentService e PaymentController ✅
  - Sprint 4: WebhookModule com idempotência ✅
  - Sprint 5: WalletModule com CRON de liberação ✅
  - Sprint 6: PayoutService com row locking ✅
  - Sprint 7: Script de migração Stripe → Wallet ✅
  - Sprint 8: Remoção completa do Stripe ✅

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
apps/api/src/modules/     12 módulos (incluindo payment, wallet, webhook)
apps/web/src/app/         10+ rotas
apps/web/src/components/  5 categorias organizadas
apps/web/src/utils/       formatters + constants
apps/web/src/hooks/       useMediaUpload + outros
packages/shared/          schemas + types (auth, pack, payment)
```

## Próximo Milestone

**v0.7.0 - Frontend PIX Ready**
- [ ] Tela de checkout PIX
- [ ] Tela de saques via PIX
- [ ] Formulário de configuração de chave PIX

**v0.8.0 - Produção Ready**
- [ ] Verificação de email
- [ ] Testes E2E críticos
- [ ] Deploy em produção

## Endpoints do Sistema Financeiro

### Payment Module
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/payment/checkout` | Cria checkout PIX |
| GET | `/payment/:id/status` | Status do pagamento |
| GET | `/payment/my-purchases` | Lista compras do usuário |
| GET | `/payment/my-sales` | Lista vendas do criador |

### Wallet Module
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/wallet/balance` | Saldo atual (disponível/congelado) |
| GET | `/wallet/summary` | Resumo completo |
| GET | `/wallet/transactions` | Histórico de transações |
| POST | `/wallet/payout` | Solicitar saque via PIX |
| GET | `/wallet/payouts` | Lista saques |
| GET | `/wallet/payouts/:id` | Detalhes do saque |

### Webhook Endpoints
| Método | Endpoint | Gateway |
|--------|----------|---------|
| POST | `/webhooks/suitpay` | SuitPay |
| POST | `/webhooks/ezzepay` | EzzePay |
| POST | `/webhooks/voluti` | Voluti |

## Variáveis de Ambiente Novas

```env
# Gateway Configuration
ENV_CURRENT_GATEWAY=suitpay  # suitpay | ezzepay | voluti

# SuitPay
SUITPAY_API_KEY=xxx
SUITPAY_API_URL=https://api.suitpay.app
SUITPAY_WEBHOOK_SECRET=xxx

# EzzePay
EZZEPAY_API_KEY=xxx
EZZEPAY_API_URL=https://api.ezzepay.com.br
EZZEPAY_WEBHOOK_SECRET=xxx

# Voluti
VOLUTI_API_KEY=xxx
VOLUTI_API_URL=https://api.voluti.com.br
VOLUTI_WEBHOOK_SECRET=xxx
VOLUTI_CLIENT_ID=xxx

# Financial Settings
PLATFORM_FEE_PERCENT=20
ANTI_FRAUD_HOLD_DAYS=14
MIN_PAYOUT_AMOUNT=5000
```
