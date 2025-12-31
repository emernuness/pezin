# Product Context - Pack do Pezin

## Por que este projeto existe?

O mercado de conteúdo adulto carece de plataformas brasileiras que ofereçam:
- Pagamentos em Real (BRL) com taxas justas
- Interface simples e direta
- Foco em venda de packs (não assinaturas)
- Proteção contra vazamento de conteúdo

## Problemas que Resolve

### Para Criadores
1. **Taxas abusivas** - Plataformas internacionais cobram até 50%
2. **Complexidade** - Muitas features desnecessárias
3. **Pagamentos** - Dificuldade de receber em BRL
4. **Controle** - Falta de proteção contra downloads em massa

### Para Consumidores
1. **Golpes** - Muitos vendedores não entregam
2. **Pagamento** - Checkout internacional é complexo
3. **Acesso** - Links que expiram ou quebram

## Como Deve Funcionar

### Fluxo do Criador
```
Cadastro → Verificar 18+ → Conectar Stripe → Criar Pack → Upload → Publicar → Vender → Sacar
```

### Fluxo do Consumidor
```
Navegar → Ver Pack → Confirmar 18+ → Cadastrar/Login → Pagar (Stripe) → Acessar → Download
```

## Objetivos de UX

### Princípios de Design
1. **Simplicidade** - Nada de features desnecessárias
2. **Confiança** - Visual profissional, pagamentos seguros
3. **Velocidade** - Upload direto para R2, sem passar pelo servidor
4. **Impacto Visual** - Design System Neon Lime para diferenciação

### Design System: Neon Lime
- **Accent Color**: #CDFF00 (verde lima) - uso estratégico
- **Dark Surface**: #1A1F2E - cards de destaque
- **Light Background**: #E8EEF2 - páginas
- **Componentes**: React Bits (hero), MagicUI (interativo), shadcn/ui (base)

### Experiência Mobile-First
- Responsividade líquida (fluid-tailwind)
- Touch-friendly (botões grandes, espaçamento generoso)
- Performance (imagens otimizadas via Cloudflare)

## Métricas de Sucesso UX

- Time to first pack published < 10 min
- Checkout completion rate > 70%
- Mobile bounce rate < 40%
- Page load time < 2s
