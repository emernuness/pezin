# System Patterns - Pack do Pezin

## Arquitetura Geral

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js Web   │────▶│   NestJS API    │────▶│   PostgreSQL    │
│   (Frontend)    │     │   (Backend)     │     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Cloudflare R2  │     │     Stripe      │
│   (Storage)     │     │   (Payments)    │
└─────────────────┘     └─────────────────┘
```

## Padrões de Autenticação

### JWT + Refresh Token Rotation
```
Access Token (15 min) ──► In-memory (Zustand)
Refresh Token (7 dias) ──► HTTP-only Cookie (Secure, SameSite=Strict)
```

**Fluxo de Refresh:**
1. Access token expira
2. Axios interceptor detecta 401
3. Chama `/auth/refresh` com cookie
4. Backend rotaciona refresh token (invalida antigo)
5. Retorna novo access token + novo refresh cookie

**Segurança:**
- Refresh tokens armazenados como hash SHA256 no banco
- Rotation previne reuso de tokens comprometidos
- Revogação explícita no logout

## Padrões de Upload

### Two-Phase Upload (Presigned URLs)
```
1. Frontend ──► POST /packs/:id/upload-url ──► Backend
   (solicita URL)

2. Backend ──► Gera presigned URL ──► Frontend
   (valida ownership, gera URL)

3. Frontend ──► PUT (file) ──► Cloudflare R2
   (upload direto, bypassa backend)

4. Frontend ──► POST /packs/:id/files ──► Backend
   (confirma upload com metadata)
```

**Benefícios:**
- Não sobrecarrega o servidor
- Upload paralelo de múltiplos arquivos
- Progress tracking no frontend

## Padrões de Download

### Signed URLs com Rate Limiting
```
1. Frontend ──► POST /packs/:packId/files/:fileId/download-url ──► Backend

2. Backend:
   - Valida ownership (user comprou o pack?)
   - Verifica rate limit (10/dia por arquivo)
   - Incrementa contador no DownloadLog
   - Gera signed URL (1 hora de validade)

3. Frontend ──► GET (signed URL) ──► Cloudflare R2
```

## Padrões de Pagamento

### Stripe Checkout + Connect
```
1. Consumer ──► POST /stripe/checkout {packId} ──► Backend

2. Backend:
   - Busca pack e creator
   - Cria Checkout Session com:
     - application_fee_amount (20%)
     - transfer_data.destination (creator's Stripe account)
   - Retorna session.url

3. Consumer ──► Redirect ──► Stripe Checkout

4. Stripe ──► POST /stripe/webhook ──► Backend
   (checkout.session.completed)

5. Backend:
   - Verifica signature
   - Checa idempotência (StripeEvent)
   - Cria Purchase com availableAt = now + 14 dias
```

## Padrões de Validação

### Zod Schemas Compartilhados
```
packages/shared/src/schemas/
├── auth.schema.ts      # signUpSchema, loginSchema
├── pack.schema.ts      # createPackSchema, uploadUrlSchema
├── checkout.schema.ts  # checkoutSchema
└── index.ts            # re-exports
```

**Uso no Backend (NestJS):**
```typescript
@Post('signup')
async signUp(@Body(new ZodValidationPipe(signUpSchema)) dto: SignUpDto) {
  // Schema validado automaticamente
}
```

**Uso no Frontend:**
```typescript
const result = signUpSchema.safeParse(formData);
if (!result.success) {
  // Mostrar erros
}
```

## Padrões de Estado (Frontend)

### Zustand Stores
```
stores/
├── auth.store.ts    # user, accessToken, login(), logout(), refresh()
├── upload.store.ts  # files[], progress, addFile(), removeFile()
```

**Padrão de Auth Store:**
- Access token em memória (não persiste)
- User data persiste via middleware
- Refresh automático via Axios interceptor

## Padrões de API

### Estrutura de Módulos NestJS
```
modules/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── guards/
│       ├── jwt-auth.guard.ts
│       └── jwt.strategy.ts
├── packs/
├── purchases/
├── dashboard/
├── stripe/
├── storage/
└── public/
```

### Decorators Customizados
```typescript
@CurrentUser()  // Extrai user do JWT
@Roles('creator')  // Requer role específica
```

### Guards
```typescript
@UseGuards(JwtAuthGuard)  // Requer autenticação
@UseGuards(JwtAuthGuard, RolesGuard)  // Requer auth + role
```

## Padrões de Banco de Dados

### Soft Delete
Packs com vendas nunca são deletados fisicamente:
```prisma
model Pack {
  deletedAt DateTime?  // null = ativo
}
```

### Índices Estratégicos
```prisma
@@index([creatorId, status])  // Dashboard queries
@@index([userId, fileId, dateKey])  // Rate limiting
@@index([stripePaymentIntentId])  // Webhook lookup
```

### Valores Monetários
Sempre em centavos (integer):
- R$ 29,90 = 2990
- Evita problemas de floating point

## Padrões de Segurança

### Headers (Next.js)
```
Strict-Transport-Security
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: ...
```

### Rate Limiting (NestJS)
```
Global: 100 req/min
Auth endpoints: 10 req/min
```

### Validação de Arquivos
- MIME type check
- Magic bytes verification
- Extensões permitidas whitelist
