# Active Context - Pack do Pezin

> Última atualização: 2025-01-03

## Foco de Trabalho Atual

Implementando o **Módulo Financeiro Gateway Agnostic** para substituir o Stripe Connect. O novo sistema permite integração com múltiplos gateways de pagamento PIX (SuitPay, EzzePay, Voluti) com split lógico interno via Ledger System.

### Sprint 1: Fundação do Sistema (Concluída)

#### Novos Modelos Prisma
- `Wallet` - Carteira virtual do criador (currentBalance, frozenBalance)
- `LedgerEntry` - Livro razão para double-entry bookkeeping
- `Payment` - Pagamentos via PIX (substitui Purchase para novos pagamentos)
- `Payout` - Saques via PIX
- `WebhookEvent` - Idempotência de webhooks genéricos

#### Novos Enums
- `LedgerEntryType` (CREDIT, DEBIT)
- `TransactionType` (SALE, PLATFORM_FEE, PAYOUT, REFUND, ADJUSTMENT, RELEASE)
- `PaymentStatus` (pending, paid, expired, cancelled, refunded)
- `PayoutStatus` (pending, processing, completed, failed)

#### Campos Adicionados no User
- `pixKey` - Chave PIX para receber saques
- `pixKeyType` - Tipo da chave (cpf, cnpj, email, phone, evp)

#### Novos Módulos NestJS
- `apps/api/src/modules/payment/` - Módulo principal
  - `interfaces/payment-gateway.interface.ts` - Interface IPaymentGateway
  - `adapters/suitpay.adapter.ts` - Adapter SuitPay
  - `adapters/ezzepay.adapter.ts` - Adapter EzzePay
  - `adapters/voluti.adapter.ts` - Adapter Voluti
  - `factories/gateway.factory.ts` - Seleção de gateway via ENV

## Mudanças Recentes

### Cloudflare Worker + R2 Security (Novo!)

#### Nova Estrutura de Pastas no R2
```
users/{userId}/{username}/
├── packs/{packId}/
│   ├── files/{fileId}
│   └── previews/{fileId}
├── avatar/{timestamp}.{ext}
└── cover/{timestamp}.{ext}
```

#### Arquitetura de Segurança
```
Frontend ──► Cloudflare Worker ──► R2 Bucket
              │
         Valida JWT
         Resolve path via API
         Faz proxy do arquivo
```

- **Frontend NUNCA vê URLs do R2** - apenas tokens opacos
- URLs no formato: `https://cdn.packdopezin.com/media/{jwt-token}`
- Token expira em 1 hora (configurável)

#### Novos Módulos/Arquivos
- `apps/api/src/modules/media-token/` - Gera e valida tokens JWT
- `apps/api/src/common/guards/internal-api.guard.ts` - Protege API interna
- `apps/worker/` - Cloudflare Worker completo

#### Configuração
Novas variáveis de ambiente:
```env
MEDIA_TOKEN_SECRET=<256-bit-secret>
MEDIA_TOKEN_EXPIRES_IN=3600
CDN_WORKER_URL=http://localhost:8787
WORKER_INTERNAL_API_KEY=<api-key>
```

### Commits Anteriores
- `feat(api): add backend media conversion to WebP/WebM` - Conversão automática de mídia
- `feat(web): add media upload with WebP conversion and visual previews` - Upload com previews
- `refactor(web): use shared formatters and constants` - Utilitários compartilhados

### Grande Refatoração (Sprints 1-7)

#### Sprint 1: Fundação
- `utils/formatters.ts` - formatCurrency, formatDate, formatCPF, formatPhone, formatCEP
- `utils/constants.ts` - PLACEHOLDER_IMAGE, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE
- `hooks/useCurrencyFormat.ts`

#### Sprint 2-3: Componentes Compartilhados
```
components/
├── common/          # PageHeader, EmptyState, ImageWithFallback, StatusBadge, LoadingScreen
├── cards/           # PackCard, CreatorCard, StatCard, ActivityCard
├── grids/           # PackGrid, GridSkeleton
├── tables/          # DataTable, TableSkeleton
└── forms/           # PasswordInput, FormField
```

#### Sprint 4-6: Páginas Refatoradas
- `app/app/profile/` - Separado em _components/ (ProfileForm, ProfileImageUploader, etc.)
- `app/app/dashboard/` - Separado em _components/ (StatsGrid, RevenueChart, etc.)
- `app/app/dashboard/packs/[id]/edit/` - Separado em _components/
- `components/auth/SignupForm/` - 4 steps em arquivos separados
- `components/auth/LoginForm/` - Componentizado

### Sistema de Conversão de Mídia (Backend)

#### MediaService (`apps/api/src/modules/media/`)
- **Imagens → WebP**: Usando Sharp, qualidade 85%
- **Vídeos → WebM**: Usando FFmpeg, VP9/Opus codecs
- Conversão automática após upload para R2
- Fallback para original se conversão falhar

#### Integração
- `PacksService.confirmUpload` - Converte arquivos de pack
- `AuthService.confirmProfileImageUpload` - Converte avatar/cover
- `StorageService` - Novos métodos `downloadFile` e `uploadFile`

### Sistema de Upload (Frontend)

#### useMediaUpload Hook
- Suporte a múltiplos arquivos
- Conversão WebP no browser (Canvas API)
- Progress tracking com XHR
- Estados: pending, converting, uploading, done, error

#### MediaUploader Component
- Drag and drop
- Preview visual de imagens/vídeos
- Grid e list modes
- Validação de tipo/tamanho

### Correção de Bug: URLs de Preview
- **Problema**: Previews de packs retornavam 404 (URLs relativas)
- **Solução**: Backend agora gera signed URLs em `getPackById` e `listPacks`

## Próximos Passos

### Módulo Financeiro Gateway Agnostic (Prioridade)

1. **Sprint 2**: Adicionar testes unitários dos adapters
2. **Sprint 3**: Criar PaymentService e PaymentController para checkout PIX
3. **Sprint 4**: Criar WebhookModule para processamento de eventos
4. **Sprint 5**: Criar WalletModule e LedgerService
5. **Sprint 6**: Implementar sistema de saques via PIX
6. **Sprint 7**: Script de migração de saldos Stripe → Wallet
7. **Sprint 8**: Remover completamente o Stripe (arquivos, env vars, referências)

### Outros
- ~~**Onboarding Stripe Connect**~~ → Substituído pelo novo sistema Gateway Agnostic
- **Verificação de Email** - Envio e confirmação

## Decisões Ativas

### Módulo Financeiro Gateway Agnostic

- **Decisão**: Substituir Stripe Connect por sistema próprio com gateways PIX brasileiros
- **Motivo**: Stripe Connect não aceita conteúdo adult/high-risk no Brasil
- **Padrão**: Adapter Pattern para trocar de gateway sem modificar código
- **Gateways**: SuitPay, EzzePay, Voluti (todos os 3 adapters implementados)
- **Ledger System**: Double-entry bookkeeping para split lógico 80/20
- **Migração**: Saldos antigos do Stripe serão migrados para Wallets

### Variáveis de Ambiente Novas
```env
ENV_CURRENT_GATEWAY=suitpay          # Gateway ativo
SUITPAY_API_KEY=...
SUITPAY_API_URL=https://api.suitpay.app
SUITPAY_WEBHOOK_SECRET=...
EZZEPAY_API_KEY=...
EZZEPAY_API_URL=https://api.ezzepay.com.br
EZZEPAY_WEBHOOK_SECRET=...
VOLUTI_API_KEY=...
VOLUTI_API_URL=https://api.voluti.com.br
VOLUTI_WEBHOOK_SECRET=...
PLATFORM_FEE_PERCENT=20
ANTI_FRAUD_HOLD_DAYS=14
MIN_PAYOUT_AMOUNT=5000
```

### Conversão de Mídia
- **Decisão**: Converter no backend após upload (não no frontend)
- **Motivo**: Consistência, qualidade controlada, funciona para qualquer cliente
- **Trade-off**: Mais processamento no servidor, mas melhor UX

### Formatos de Saída
- **Imagens**: WebP com qualidade 85% (bom balanço tamanho/qualidade)
- **Vídeos**: WebM com VP9/Opus (amplamente suportado, boa compressão)

### Estrutura de Componentes
- **Padrão**: Páginas com `_components/` para sub-componentes
- **Barrel exports**: `index.ts` em cada pasta de componentes
- **JSDoc**: Apenas em componentes principais e funções complexas

## Considerações Técnicas

### Dependências Adicionadas (API)
- `sharp` - Conversão de imagens
- `fluent-ffmpeg` - Conversão de vídeos
- FFmpeg binário necessário no ambiente de execução

### Performance
- Conversão de imagens: ~100-500ms
- Conversão de vídeos: Depende do tamanho (pode levar minutos)
- Upload direto para R2 via presigned URLs (não passa pelo backend)

## Bloqueios Conhecidos

- ~~**FFmpeg em Produção**: Verificar se o Docker image tem FFmpeg instalado~~ ✅ Resolvido
- Nenhum bug crítico no momento
