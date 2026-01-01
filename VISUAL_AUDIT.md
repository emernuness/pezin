# Auditoria Visual e Plano de Ação

## 1. Problemas Identificados (P0)

### 1.1 Contraste e Legibilidade
- **Problema:** Uso de `--primary` (Lime Neon #CDFF00) como cor de texto (`text-primary`) em fundos claros (`bg-card`, `bg-white`).
- **Onde:** Dashboard Cards ("Saldo Disponível", "Atividade Recente").
- **Causa:** Uso incorreto de tokens sem validação de contraste (WCAG). Neon deve ser accent/bg, não texto primário.
- **Correção:** Substituir `text-primary` por `text-foreground` ou usar um fundo escuro/highlight para o texto neon.

### 1.2 Hierarquia Visual e "Tudo Branco"
- **Problema:** Background da página (`bg-muted`) e Cards (`bg-card`) têm contraste insuficiente ou layout monótono.
- **Onde:** `DashboardLayout` e `DashboardPage`.
- **Correção:**
    - Global background: Cinza muito claro (`hsl(210 40% 98%)`).
    - Cards: Branco puro (`#FFFFFF`) com sombra leve (`shadow-sm`) e borda sutil.

### 1.3 Dashboard Genérico
- **Problema:** Gráfico feito com `div`s (barras) não condiz com a referência "linhas suaves" e estética financeira moderna.
- **Problema:** Todos os cards são iguais (brancos). Falta destaque para números principais.
- **Correção:**
    - Implementar `Recharts` com `AreaChart` (gradiente, linha suave).
    - Criar "Highlight Cards": Card preto (`bg-foreground`) para Saldo Disponível, com texto branco/neon.

## 2. Revisão de Tokens (Proposta)

### Light Theme
- `background`: `210 40% 98%` (Alice Blue very light)
- `card`: `0 0% 100%` (White)
- `muted`: `210 20% 96%`
- `primary`: `72 100% 50%` (Neon Lime - Manter)
- `primary-foreground`: `215 25% 9%` (Dark - Manter)
- `border`: `214 32% 91%` (Light Blue Grey)

## 3. Plano de Implementação

1.  **Instalação**: Adicionar `recharts` ao `apps/web`.
2.  **Tokens**: Atualizar `apps/web/src/app/globals.css`.
3.  **Componentes**:
    - Refatorar `DashboardPage` em `apps/web/src/app/dashboard/page.tsx`.
    - Substituir `SimpleBarChart` por componente Recharts.
    - Aplicar classes de destaque nos cards de Saldo.
4.  **Validação**: Lint e Build.
