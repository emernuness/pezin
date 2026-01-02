# Relatório de Revisão Técnica: Site Público Pack do Pezin

**Autor:** Principal Engineer (SEO & Performance)
**Data:** 02/01/2026
**Status:** 🟡 **Aprovado com Ressalvas (Minor)**

Este relatório analisa a conformidade do PR com o Product Requirements Document (PRD) v1.0, focando em guardrails de conteúdo, SEO técnico, performance e acessibilidade.

---

## 1. Resumo de Riscos

*   **Baixo:** Ausência de Schema.org `BreadcrumbList` (impacto em Rich Snippets).
*   **Baixo:** Inconsistência de rota (`/signup` vs `/cadastro`).
*   **Baixo:** Texto de placeholder "hardcoded" no Hero.
*   **Nota:** Performance e Acessibilidade estão excelentes, sem riscos críticos identificados.

---

## 2. Checklist de Conformidade

| Categoria | Item | Status | Observação |
|-----------|------|--------|------------|
| **A. Conteúdo** | Taxas (2,5% + R$0,99) apenas no FAQ | ✅ | Confirmado em `/perguntas-frequentes`. |
| | "Cadastro Gratuito" visível | ✅ | Presente na Home, Sobre e FAQ. |
| | Sem ícones/emojis genéricos | ✅ | Design limpo e profissional. |
| | Sem métricas inventadas | ✅ | Depoimentos e dados apenas placeholders. |
| **B. SEO** | Metadata (Title/Desc) por página | ✅ | Todas as páginas configuradas corretamente. |
| | Sitemap & Robots | ✅ | Configurados e corretos. |
| | Schema.org (Organization/WebSite) | ✅ | Implementado globalmente. |
| | Schema.org (FAQPage) | ✅ | Implementado na página de FAQ. |
| | Schema.org (BreadcrumbList) | ❌ | **Ausente**. |
| **C. Performance** | `next/image` e tamanhos | ✅ | Uso correto com `priority` e `sizes`. |
| | Lazy loading de bibliotecas pesadas | ✅ | Three.js não utilizado (correto). GSAP otimizado. |
| | CLS (Layout Shift) | ✅ | Espaços reservados corretamente. |
| **D. Acessibilidade** | `prefers-reduced-motion` | ✅ | Implementado via helper `getAnimationDuration`. |
| | ARIA Labels & Semântica | ✅ | Excelente uso em Accordions e Menus. |
| | Navegação por teclado | ✅ | Elementos interativos (links, buttons) padrões. |
| **E. CRO** | CTAs Claros | ✅ | "Criar Conta Grátis" consistente. |
| | Rotas de conversão | ⚠️ | Usa `/signup` ao invés de `/cadastro` (PRD). |

---

## 3. Correções Recomendadas

### 3.1 [Minor] Adicionar Schema BreadcrumbList
*   **Onde:** `apps/web/src/components/marketing/SchemaOrg.tsx` (ou por página).
*   **O que:** Adicionar JSON-LD para `BreadcrumbList` refletindo a hierarquia da página atual.
*   **Por quê:** Exigência do PRD (9.4) e melhoria de CTR nos resultados de busca (Rich Snippets).

### 3.2 [Minor] Padronização de Rota de Cadastro
*   **Onde:** Todos os componentes com CTA (`Hero`, `CTASection`, `MarketingHeader`, `HowItWorks`).
*   **O que:** Confirmar se a rota deve ser `/signup` (implementada) ou `/cadastro` (PRD).
*   **Por quê:** Consistência com o PRD. Se `/signup` for a rota definitiva do app, ignorar; mas idealmente ter um rewrite ou redirect de `/cadastro` para SEO em PT-BR.

### 3.3 [Trivial] Remover Texto de Placeholder Hardcoded
*   **Onde:** `apps/web/src/components/marketing/Hero.tsx`
*   **O que:** O overlay com textos "Placeholder de imagem", "1200x600px" está hardcoded no JSX.
*   **Por quê:** Em produção, isso deve ser removido ou substituído pela imagem real sem overlay de texto de debug.

---

## 4. Sugestões de Melhoria (Non-Blocking)

*   **SEO/Internationalization:** Considerar adicionar `<link rel="alternate" hreflang="pt-br" ... />` no `layout.tsx` para reforçar a localização Brasil.
*   **Performance:** O componente `FAQAccordion` usa uma transição CSS inteligente (`grid-rows`). Manter esse padrão para outros componentes interativos leves para evitar o peso do GSAP onde não é necessário.

---

## 5. Varredura de Taxas e Termos Sensíveis

A varredura automatizada confirmou a conformidade estrita:

*   **"2,5%" e "0,99":** Encontrados **exclusivamente** em `apps/web/src/app/(marketing)/perguntas-frequentes/page.tsx`.
*   **"Taxa":**
    *   FAQ Page: Contexto de explicação de custos (permitido).
    *   Sobre Content: Contexto negativo ("Sem taxas ocultas", "Pagar taxas só para criar conta"), reforçando a gratuidade (permitido).

**Conclusão:** O código está maduro, seguro e performático. Aprovado para merge após as correções "Minor".