# Active Context - Pack do Pezin

> Última atualização: 2024-12-31

## Foco de Trabalho Atual

O projeto está em fase de **desenvolvimento ativo** com a maior parte da infraestrutura e features core implementadas. O foco agora está em:

1. Completar fluxos de frontend que consomem as APIs existentes
2. Polir a experiência do usuário com o Design System
3. Implementar fluxos pendentes (onboarding Stripe, uploads no frontend)

## Mudanças Recentes

### Commits Recentes (últimos)
- `feat: implement robust database seeding system` - Sistema completo de seed
- `feat: apply Neon Lime design system` - Design system aplicado nos componentes
- `feat: accelerate UI/UX and complete product flow` - Páginas públicas e dashboard
- `feat(api): implement pack file upload and download with granular limits` - Sistema de download
- `feat(api): add storage module with r2 integration` - Integração R2
- `feat(api): add stripe module and service` - Stripe Checkout + Connect

### Features Adicionadas
- **Sistema de Seed completo** com dados realistas para demo
  - 24 usuários (12 creators, 12 buyers)
  - 20 packs com previews e arquivos
  - Compras, saques, logs de download
  - Imagens geradas automaticamente (neon/sensual theme)
  - Scripts: `pnpm db:seed`, `pnpm db:reset`
- Dashboard do criador com métricas
- Páginas públicas (packs, criadores)
- Componentes visuais (PackCard, CreatorCard, etc.)
- API de downloads com rate limiting (10/dia por arquivo)

## Próximos Passos Imediatos

1. **Interface de Upload** - Frontend para upload de arquivos nos packs
2. **Onboarding Stripe Connect** - Fluxo completo no frontend
3. **CRUD de Packs** - Interface para criar/editar packs no dashboard
4. **Verificação de Email** - Fluxo de confirmação

## Decisões Ativas

### Arquitetura de Upload
- **Decisão**: Upload direto para R2 via presigned URLs (não passa pelo backend)
- **Motivo**: Performance e escalabilidade
- **Status**: Backend pronto, falta frontend

### Rate Limiting de Downloads
- **Decisão**: 10 downloads por arquivo por dia por usuário
- **Motivo**: Prevenir scraping e redistribuição
- **Status**: Implementado com DownloadLog no banco

### Período Anti-Fraude
- **Decisão**: 14 dias antes do saldo ficar disponível
- **Motivo**: Janela para chargebacks e disputas
- **Status**: Implementado no campo `availableAt` de Purchase

## Considerações Técnicas

### Ambiente de Desenvolvimento
- Docker Compose para PostgreSQL local
- Hot reload em API e Web
- Prisma Studio para visualizar dados

### Dependências Críticas
- Stripe API keys (test mode para dev)
- Cloudflare R2 credentials
- PostgreSQL running

## Bloqueios Conhecidos

Nenhum bloqueio crítico no momento. Itens pendentes são features novas, não bugs.
