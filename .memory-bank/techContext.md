# Tech Context - Pack do Pezin

## Stack Tecnológica

### Core
| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Frontend | Next.js (App Router) | 14+ |
| Backend | NestJS | Latest |
| Linguagem | TypeScript | Strict mode |
| Database | PostgreSQL | 15+ |
| ORM | Prisma | Latest |
| Package Manager | pnpm | 8+ |
| Runtime | Node.js | 20+ |

### Frontend
| Categoria | Tecnologia |
|-----------|------------|
| Estilização | Tailwind CSS |
| Componentes Base | shadcn/ui |
| Componentes Hero | React Bits |
| Componentes Interativos | MagicUI |
| Estado Global | Zustand |
| HTTP Client | Axios |
| Validação | Zod |

### Backend
| Categoria | Tecnologia |
|-----------|------------|
| Framework | NestJS |
| Autenticação | Passport JWT |
| Validação | Zod + Custom Pipe |
| Hashing | bcrypt (cost 12) |
| Storage Client | @aws-sdk/client-s3 |
| Payments | stripe |

### Infraestrutura
| Serviço | Provedor |
|---------|----------|
| Storage | Cloudflare R2 |
| CDN | Cloudflare |
| Payments | Stripe |
| Hosting | Coolify (Docker) |

## Estrutura do Monorepo

```
pack-do-pezin/
├── apps/
│   ├── api/                 # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/     # Feature modules
│   │   │   ├── common/      # Guards, pipes, decorators
│   │   │   ├── prisma/      # Prisma service
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   │
│   └── web/                 # Next.js Frontend
│       ├── src/
│       │   ├── app/         # App Router pages
│       │   ├── components/  # React components
│       │   ├── stores/      # Zustand stores
│       │   ├── services/    # API services
│       │   └── lib/         # Utilities
│       └── package.json
│
├── packages/
│   └── shared/              # Shared code
│       ├── src/
│       │   ├── schemas/     # Zod schemas
│       │   └── types/       # TypeScript types
│       └── package.json
│
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

## Setup de Desenvolvimento

### Pré-requisitos
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

### Comandos Principais

```bash
# Instalação
pnpm install

# Desenvolvimento
pnpm docker:up        # Subir PostgreSQL
pnpm dev              # API + Web em paralelo

# Database
pnpm prisma:generate  # Gerar Prisma Client
pnpm prisma:migrate   # Aplicar migrations
pnpm prisma:studio    # UI para banco

# Quality
pnpm typecheck        # Verificar tipos
pnpm lint             # Linter
pnpm test             # Testes

# Build
pnpm build            # Build de produção
```

### Variáveis de Ambiente

**API (.env)**
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=...
R2_ENDPOINT=...
```

**Web (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Restrições Técnicas

### Segurança
- Verificação de idade obrigatória (18+)
- Passwords: min 8 chars, 1 upper, 1 lower, 1 number
- Rate limiting: 100 req/min global, 10 req/min auth
- Cookies: HTTP-only, Secure, SameSite=Strict

### Arquivos
- Upload máximo: 100MB por arquivo (configurável no R2)
- Tipos permitidos: image/*, video/*
- Validação: MIME type + magic bytes

### Financeiro
- Preço: R$ 19,90 - sem limite máximo (mínimo 1990 centavos)
- Saque mínimo: R$ 50,00
- Período anti-fraude: 14 dias

### Performance
- Page load: < 2s
- API response: < 500ms
- Upload: direto para R2 (não passa pelo backend)

## Dependências Críticas

### packages/shared
```json
{
  "dependencies": {
    "zod": "^3.x"
  }
}
```

### apps/api
```json
{
  "dependencies": {
    "@nestjs/core": "^10.x",
    "@nestjs/jwt": "^10.x",
    "@nestjs/passport": "^10.x",
    "@prisma/client": "^5.x",
    "@aws-sdk/client-s3": "^3.x",
    "@aws-sdk/s3-request-presigner": "^3.x",
    "stripe": "^14.x",
    "bcrypt": "^5.x"
  }
}
```

### apps/web
```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "zustand": "^4.x",
    "axios": "^1.x",
    "@radix-ui/*": "latest"
  }
}
```

## Integração Contínua

### Quality Gate (antes de commit)
1. `pnpm typecheck` - Zero erros TypeScript
2. `pnpm lint` - Biome clean
3. `pnpm test` - Testes passando

### Docker (Produção)
- 3 serviços: web, api, postgres
- Deploy via Coolify
- SSL via Cloudflare
