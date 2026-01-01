# Auditoria UX - Pack do Pezin

## Resumo

Auditoria profunda de UI/UX do frontend Next.js realizada em 01/01/2026.

---

## Correções P0 (Críticas) - CORRIGIDAS

| # | Problema | Correção | Status |
|---|----------|----------|--------|
| P0.1 | Signup: tipo de conta pouco claro | Radio Cards "Quero Comprar" / "Quero Vender" com ícones e descrições | CORRIGIDO |
| P0.1b | Login: sem seletor de intent | Radio Cards para intent de navegação pós-login | CORRIGIDO |
| P0.2 | UserNav: Dashboard visível para consumidores | Condicionado por `user.userType === 'creator'` | CORRIGIDO |
| P0.3 | BuyButton: cores hardcoded (bg-lime-400) | Migrado para tokens semânticos (bg-primary) | CORRIGIDO |
| P0.4 | PackViewer: cores hardcoded | Migrado para tokens semânticos (text-foreground, bg-muted) | CORRIGIDO |
| P0.5 | Dashboard: sem proteção de acesso | Tela de bloqueio estática com CTA para consumidores | CORRIGIDO |
| P0.6 | Erros mostrados via alert() | Migrado para toast (Sonner) | CORRIGIDO |

---

## Correções P1 (Graves) - CORRIGIDAS

| # | Problema | Correção | Status |
|---|----------|----------|--------|
| P1.1 | Signup: copy inconsistente | CardDescription dinâmico baseado na seleção | CORRIGIDO |
| P1.2 | Signup: checkbox nativo | Migrado para componente shadcn Checkbox | CORRIGIDO |
| P1.3 | Home: empty state básico | Componente EmptyState com ícone + CTA | CORRIGIDO |
| P1.4 | Dashboard: loading state fraco | Skeleton cards durante carregamento | CORRIGIDO |
| P1.5 | Dashboard: acentuação faltando | Corrigido: Visão, Líquida, Disponível, Últimos | CORRIGIDO |
| P1.6 | FilterBar: falta acessibilidade | Labels com htmlFor e sr-only para inputs de preço | CORRIGIDO |
| P1.7 | PackCard: CTA implícito | Adicionado "Ver pack →" sempre visível | CORRIGIDO |
| P1.8 | CreatorPage: CTA ausente | Adicionado link "Voltar à vitrine" | CORRIGIDO |
| P1.9 | SiteHeader: loading skeleton vazio | Skeleton circular durante loading | CORRIGIDO |

---

## Componentes Criados

| Componente | Descrição |
|------------|-----------|
| `components/ui/checkbox.tsx` | Checkbox shadcn com Radix UI |
| `components/ui/skeleton.tsx` | Skeleton para loading states |
| `components/ui/sonner.tsx` | Toast global (Sonner) |
| `components/EmptyState.tsx` | Estado vazio reutilizável |

---

## Arquivos Modificados

- `app/layout.tsx` - Adicionado Toaster
- `app/signup/page.tsx` - Radio Cards, Checkbox, copy dinâmico
- `app/login/page.tsx` - Radio Cards para intent
- `app/page.tsx` - EmptyState melhorado
- `app/dashboard/page.tsx` - Skeleton, acentos, proteção role
- `app/me/purchases/[id]/page.tsx` - Tokens semânticos, toast
- `app/c/[slug]/page.tsx` - Link de retorno
- `components/layout/SiteHeader.tsx` - Skeleton no loading
- `components/layout/UserNav.tsx` - Condicional por userType
- `components/PackCard.tsx` - CTA visível
- `components/BuyButton.tsx` - Tokens semânticos, toast
- `components/FilterBar.tsx` - Labels acessibilidade

---

## Checklist de Verificação Manual (QA)

### Fluxo Visitante
- [x] Home carrega com packs
- [x] Filtros funcionam (busca, ordenação, preço)
- [x] Empty state aparece quando sem resultados
- [x] PackCard mostra "Ver pack →"
- [x] Página de pack mostra preço, criador, previews
- [x] Click em "Comprar Agora" usa design system (não lime-400)
- [x] Página do criador tem link de volta

### Fluxo Signup/Login
- [x] Signup mostra Radio Cards "Quero Comprar" / "Quero Vender"
- [x] CardDescription muda conforme seleção
- [x] Checkbox customizado (shadcn)
- [x] Login mostra Radio Cards para intent
- [x] Login redireciona baseado em userType + intent

### Fluxo Cliente Logado
- [x] Dropdown NÃO mostra "Dashboard" para consumidores
- [x] Dropdown mostra "Minhas compras" para todos
- [x] Toast aparece para erros (não alert)

### Fluxo Criador Logado
- [x] Dropdown mostra "Dashboard" E "Minhas compras"
- [x] Dashboard carrega com skeleton
- [x] Acentuação está correta

### Acessibilidade
- [x] Inputs de preço têm labels (sr-only)
- [x] Focus ring em botões Radio Cards
- [x] Skeleton no header durante loading

### Design System
- [x] Nenhuma cor hardcoded (lime-400, gray-900, etc.)
- [x] Todos buttons usam variants do design system
- [x] Toast global configurado

---

## Dependências Adicionadas

```
@radix-ui/react-checkbox ^1.3.3
sonner ^2.0.7
```

---

## Build Status

```
pnpm build - PASSOU
```

---

## P2 (Backlog)

| # | Problema | Prioridade |
|---|----------|------------|
| P2.1 | Dashboard sidebar não responsiva | Baixa |
| P2.2 | Paginação sem estado de loading | Baixa |
| P2.3 | Sem indicator de conexão Stripe | Média |
| P2.4 | Focus ring inconsistente em alguns elementos | Baixa |
