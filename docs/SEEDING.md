# Pack do Pezin - Database Seeding Guide

Este guia documenta o sistema de seed para popular o banco de dados com dados realistas para desenvolvimento e demonstrações.

## Quick Start

```bash
# Executar seed (gera assets + popula banco)
pnpm db:seed

# Reset completo (drop + migrate + seed)
pnpm db:reset

# Apenas gerar imagens (sem popular banco)
cd apps/api && pnpm db:generate-assets
```

## Contas Demo

Após rodar o seed, as seguintes contas estarão disponíveis:

### Buyer (Comprador)
| Campo    | Valor                      |
|----------|----------------------------|
| Email    | `buyer_demo@local.test`    |
| Senha    | `Demo123!`                 |
| Tipo     | Consumer                   |

### Creator (Criador)
| Campo    | Valor                       |
|----------|----------------------------|
| Email    | `creator_demo@local.test`  |
| Senha    | `Demo123!`                 |
| Tipo     | Creator                    |
| Slug     | `sofia-bela-1`             |

### Creators Adicionais
| Email                        | Senha      | Slug              |
|------------------------------|------------|-------------------|
| `creator2@local.test`        | `Demo123!` | `valentina-rose-2` |
| `creator3@local.test`        | `Demo123!` | `isabella-noir-3`  |
| `creator4@local.test`        | `Demo123!` | `luna-desire-4`    |

### Buyers Adicionais
| Email                        | Senha      |
|------------------------------|------------|
| `buyer2@local.test`          | `Demo123!` |
| `buyer3@local.test`          | `Demo123!` |
| `buyer4@local.test`          | `Demo123!` |

## Dados Gerados

### Users (24 total)
- **12 Creators**: Perfis de criadoras com nomes artísticos, avatares temáticos, bios
- **12 Buyers**: Compradores com perfis básicos
- 8 creators têm Stripe Connect configurado (podem publicar)
- Maioria tem email verificado

### Packs (20 total)
- **15 Publicados**: Com 3 previews e 10-14 arquivos cada
- **5 Drafts**: Com apenas 1-2 arquivos (não publicáveis)
- Títulos e descrições temáticos (adulto, sensual)
- Preços variados: R$ 19.90 - R$ 49.90

### Pack Previews (45+)
- 3 imagens de preview por pack publicado
- Imagens geradas com gradientes neon e silhuetas artísticas
- Armazenadas em `prisma/seed-assets/previews/`

### Pack Files (150+)
- 10-14 arquivos por pack
- Tipos variados: fotos (JPEG/PNG), vídeos (MP4), ZIPs
- Tamanhos realistas: 2MB - 100MB
- Storage keys fictícias (formato: `packs/{packId}/files/{filename}`)

### Purchases (25+)
- Demo buyer tem 5 compras garantidas
- Mix de status: `paid` (maioria), `refunded` (1-2)
- Algumas com `availableAt` no futuro (período de hold de 14 dias)
- Algumas já disponíveis (compras antigas)

### Withdrawals (10+)
- Para creators com Stripe Connect
- Status variados: `completed`, `processing`, `pending`, `failed`
- Valores: R$ 50 - R$ 500

### Download Logs
- Logs de download para demonstrar rate limiting
- Cenários:
  - Normal (3-7 downloads)
  - No limite (9 downloads)
  - Atingiu limite (10 downloads)
  - Downloads de dias anteriores (demonstra reset diário)

## Assets Gerados

O seed gera automaticamente imagens temáticas se não existirem:

```
apps/api/prisma/seed-assets/
├── previews/      # 40 imagens (800x1200) - capas de packs
│   ├── preview_01.jpg
│   ├── preview_02.jpg
│   └── ...
├── avatars/       # 20 imagens (400x400) - fotos de perfil
│   ├── avatar_01.jpg
│   └── ...
└── covers/        # 15 imagens (1200x400) - banners de perfil
    ├── cover_01.jpg
    └── ...
```

### Características das Imagens
- **Paleta**: Gradientes neon (rosa, roxo, vermelho, lime)
- **Elementos**: Silhuetas femininas, lábios, corações, formas abstratas
- **Efeito**: Glow neon, ruído sutil, gradiente escuro na base
- **Safe for demo**: Sem nudez explícita, apenas formas artísticas

## Idempotência

O seed é idempotente - pode ser executado múltiplas vezes sem duplicar dados:

- **Users**: Upsert por email
- **Packs**: Verifica existência por `(creatorId, title)`
- **Previews/Files**: Criados junto com pack (skip se pack existe)
- **Purchases**: Verifica `(userId, packId)` antes de criar
- **Download Logs**: Upsert por constraint única `(userId, fileId, dateKey)`

## Estrutura do Código

```
apps/api/
├── prisma/
│   ├── seed.ts                    # Entry point
│   ├── seed/
│   │   ├── index.ts               # Orquestração principal
│   │   ├── factories.ts           # Factories de dados
│   │   └── generate-assets.ts     # Gerador de imagens
│   └── seed-assets/               # Imagens geradas (gitignore)
└── src/modules/
    ├── assets/                    # Serve seed assets em desenvolvimento
    │   ├── assets.controller.ts
    │   └── assets.module.ts
    ├── public/
    │   └── public.service.ts      # Transforma URLs de assets
    └── purchases/
        └── purchases.service.ts   # Transforma URLs de assets
```

## Arquitetura de Assets

Em **desenvolvimento**:
- O seed armazena paths relativos no banco (ex: `previews/preview_01.jpg`)
- `PublicService` e `PurchasesService` transformam para URLs completas
- `AssetsController` serve os arquivos de `prisma/seed-assets/`
- URL final: `http://localhost:3001/assets/previews/preview_01.jpg`

Em **produção**:
- Assets seriam armazenados no Cloudflare R2
- URLs seriam signed URLs geradas pelo `StorageService`
- O endpoint `/assets/` fica desabilitado (`NODE_ENV !== 'development'`)

## Verificação Visual

Após rodar o seed, verifique:

### 1. Vitrine (`/packs` ou `/`)
- [ ] Pelo menos 10 packs visíveis
- [ ] Cada pack tem thumbnail
- [ ] Preços formatados corretamente (R$ XX,XX)

### 2. Página do Pack (`/packs/{id}`)
- [ ] 3 imagens de preview funcionando
- [ ] Título e descrição corretos
- [ ] Botão de compra visível

### 3. Perfil do Creator (`/c/sofia-bela-1`)
- [ ] Avatar e capa carregando
- [ ] Bio visível
- [ ] Lista de packs do creator

### 4. Login como Buyer (`buyer_demo@local.test`)
- [ ] Login funciona com senha `Demo123!`
- [ ] `/me/purchases` mostra compras
- [ ] Download de arquivos (limitado a 10/dia)

### 5. Login como Creator (`creator_demo@local.test`)
- [ ] Dashboard (`/dashboard`) com stats
- [ ] Lista de packs próprios
- [ ] Saldo pendente e disponível visíveis

### 6. Withdrawal/Saque (Creator Dashboard)
- [ ] Histórico de saques visível
- [ ] Status variados (completed, pending, failed)

## Troubleshooting

### Erro: "Assets not found"
```bash
cd apps/api && pnpm db:generate-assets
```

### Erro: "Unique constraint failed"
O seed é idempotente, mas em caso de dados corrompidos:
```bash
pnpm db:reset
```

### Erro: "bcrypt not found"
```bash
cd apps/api && pnpm install
```

### Imagens não aparecem no frontend
- Verifique se a API está rodando (`pnpm dev` no root)
- A API deve estar em `http://localhost:3001`
- O endpoint `/assets/:folder/:filename` serve os assets de seed
- URLs são transformadas automaticamente pelo `PublicService` e `PurchasesService`
- Assets estão em `apps/api/prisma/seed-assets/`
- O endpoint só funciona em `NODE_ENV=development`

## Customização

### Alterar quantidade de dados
Edite `apps/api/prisma/seed/index.ts`:
```typescript
// Exemplo: criar mais packs
for (let i = 0; i < 30; i++) { // Era 15
  // ...
}
```

### Adicionar novos temas de packs
Edite `apps/api/prisma/seed/factories.ts`:
```typescript
const PACK_THEMES = [
  // Adicione novos temas aqui
  {
    title: 'Novo Tema',
    description: 'Descrição do novo tema...',
  },
];
```

### Alterar paleta de cores das imagens
Edite `apps/api/prisma/seed/generate-assets.ts`:
```typescript
const SENSUAL_PALETTES = [
  // Adicione ou modifique paletas
  { primary: '#FF0000', secondary: '#800000', accent: '#FF6666' },
];
```
