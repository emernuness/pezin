# Active Context - Pack do Pezin

> Última atualização: 2025-01-02

## Foco de Trabalho Atual

Implementamos a **reorganização do R2 + Cloudflare Worker para segurança de mídia**. Agora todos os arquivos são servidos via Worker com URLs tokenizadas, escondendo completamente a infraestrutura R2 do frontend.

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

1. ~~**Testar fluxo completo** de upload com conversão~~ ✅ Testado com sucesso
2. ~~**Verificar FFmpeg** no ambiente de produção~~ ✅ Adicionado ao Dockerfile
3. **Onboarding Stripe Connect** - Fluxo no frontend
4. **Verificação de Email** - Envio e confirmação

## Decisões Ativas

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
