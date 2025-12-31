# Project Brief - Pack do Pezin

## Visão Geral

**Pack do Pezin** é uma plataforma web de monetização para criadores de conteúdo adulto, especializada na venda de packs de imagens e vídeos. Conecta criadores a consumidores através de um marketplace simples e seguro.

## Objetivos Principais

1. Permitir que criadores monetizem conteúdo de forma simples
2. Oferecer pagamentos seguros via Stripe
3. Manter controle sobre o conteúdo (URLs assinadas, rate limiting)
4. Garantir compliance com verificação de idade (18+)

## Modelo de Negócio

| Métrica | Valor |
|---------|-------|
| Taxa da plataforma | 20% sobre cada venda |
| Repasse ao criador | 80% do valor do pack |
| Valor mínimo para saque | R$ 50,00 |
| Prazo anti-fraude | 14 dias após a compra |

## Escopo do MVP

### Incluído
- Cadastro e autenticação de usuários
- CRUD de packs (criador)
- Vitrine pública de packs
- Pagamento único via Stripe Checkout
- Dashboard básico do criador
- Acesso tokenizado aos packs comprados
- Gestão de saques (criador)

### Não Incluído (Futuro)
- Sistema de assinaturas/mensalidades
- Chat/mensagens entre usuários
- Sistema de gorjetas/tips
- Live streaming
- Sistema de afiliados
- App mobile nativo

## Personas

### Criador de Conteúdo
- Pessoa física, 18+
- Produz conteúdo adulto
- Busca interface simples e pagamentos confiáveis
- Frustração: plataformas complexas, taxas abusivas

### Consumidor Final
- Pessoa física, 18+
- Interessado em conteúdo adulto
- Busca navegação fácil e pagamento seguro
- Frustração: golpes, processo de compra complexo

## KPIs Primários

- Número de criadores ativos (≥1 pack publicado)
- Volume de vendas (GMV)
- Taxa de conversão (visitante → comprador)
- Ticket médio por transação
- Receita líquida da plataforma

## Documentação de Referência

- PRD Completo: `prd-pack-do-pezin.md`
- Design System: `design.json`
- Guia de Desenvolvimento: `README-DEV.md`
