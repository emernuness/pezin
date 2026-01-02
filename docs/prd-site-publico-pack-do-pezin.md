# PRD — Site Público Pack do Pezin

**Versão:** 1.0  
**Data:** Janeiro 2025  
**Status:** Aprovado para Desenvolvimento  
**Tipo:** Marketing Site / Landing Pages

---

## 1. Resumo Executivo

### 1.1 Objetivo

Criar o site público (marketing site) da plataforma Pack do Pezin — a vitrine institucional que apresenta a plataforma, convence criadores de conteúdo a se cadastrarem e educa visitantes sobre o funcionamento do sistema.

### 1.2 Público-Alvo Principal

Criadores de conteúdo adulto (18+) que desejam monetizar seus packs de fotos e vídeos de forma simples, segura e profissional.

### 1.3 Público-Alvo Secundário

Consumidores/fãs que chegam ao site buscando entender como a plataforma funciona antes de realizar compras.

### 1.4 Proposta de Valor

Permitir que criadores monetizem seu conteúdo com cadastro 100% gratuito, interface profissional, pagamentos seguros via Stripe e controle total sobre seus packs — sem complicação, sem burocracia.

### 1.5 Conversão Principal

Clique e conclusão de Login/Cadastro através dos CTAs distribuídos no site.

### 1.6 Mensagem Central

**"Cadastro gratuito. Comece a vender em minutos."**

---

## 2. Personas e Jobs-to-be-Done

### 2.1 Persona Primária: A Criadora Iniciante

| Atributo | Descrição |
|----------|-----------|
| **Nome fictício** | Juliana, 24 anos |
| **Perfil** | Produz conteúdo há poucos meses, ainda não monetiza ou usa plataformas complexas |
| **Objetivo** | Encontrar uma forma fácil de vender seus packs sem investimento inicial |
| **Frustrações** | Plataformas confusas, taxas ocultas, medo de não conseguir usar |
| **Job-to-be-Done** | "Quero começar a ganhar dinheiro com meu conteúdo sem precisar entender de tecnologia" |

### 2.2 Persona Secundária: A Criadora Experiente

| Atributo | Descrição |
|----------|-----------|
| **Nome fictício** | Amanda, 29 anos |
| **Perfil** | Já vende em outras plataformas, busca alternativas com melhores condições |
| **Objetivo** | Diversificar canais de venda, ter mais controle sobre preços e pagamentos |
| **Frustrações** | Taxas abusivas de outras plataformas, falta de controle, demora nos pagamentos |
| **Job-to-be-Done** | "Quero uma plataforma profissional onde eu tenha controle total e receba rápido" |

### 2.3 Persona Terciária: O Consumidor Curioso

| Atributo | Descrição |
|----------|-----------|
| **Nome fictício** | Rafael, 32 anos |
| **Perfil** | Chegou ao site através de link de uma criadora, quer entender como funciona |
| **Objetivo** | Confirmar que a plataforma é segura antes de comprar |
| **Frustrações** | Medo de golpes, sites amadores, falta de informação clara |
| **Job-to-be-Done** | "Quero ter certeza de que é seguro comprar aqui" |

---

## 3. Arquitetura de Informação

### 3.1 Mapa do Site

```
/                           → Home
/sobre                      → Sobre a Plataforma
/perguntas-frequentes       → FAQ (único local com taxas)
/contato                    → Contato
/login                      → Login (redireciona para app)
/cadastro                   → Cadastro (redireciona para app)
```

### 3.2 Estrutura de Navegação

**Header Global (sticky)**
- Logo Pack do Pezin (link para Home)
- Links: Home | Sobre | FAQ | Contato
- Botão CTA primário: "Entrar / Criar Conta"

**Footer Global**
- Logo
- Links de navegação
- Links legais: Termos de Uso | Política de Privacidade | Política de Conteúdo (placeholders)
- Contato: Email placeholder
- Copyright

---

## 4. Requisitos Funcionais por Página

### 4.1 Home (`/`)

| Seção | Objetivo | Prioridade |
|-------|----------|------------|
| Hero | Capturar atenção e comunicar proposta de valor | Alta |
| Como Funciona | Explicar o processo em 4 passos simples | Alta |
| Benefícios para Criadores | Destacar vantagens competitivas | Alta |
| Recursos da Plataforma | Mostrar funcionalidades do sistema | Alta |
| Segurança e Privacidade | Transmitir confiança | Alta |
| Prova Social | Validar através de depoimentos | Média |
| CTA Final | Converter visitantes indecisos | Alta |

### 4.2 Sobre (`/sobre`)

| Seção | Objetivo | Prioridade |
|-------|----------|------------|
| Hero Sobre | Apresentar a missão da plataforma | Alta |
| Nossa História | Humanizar a marca | Média |
| Para Quem é o Pack do Pezin | Definir público-alvo claramente | Alta |
| Nossos Valores | Comunicar princípios | Média |
| CTA Final | Converter | Alta |

### 4.3 FAQ (`/perguntas-frequentes`)

| Seção | Objetivo | Prioridade |
|-------|----------|------------|
| Hero FAQ | Introduzir a página de dúvidas | Alta |
| Accordion de Perguntas | Responder dúvidas frequentes | Alta |
| CTA Final | Converter quem teve dúvidas sanadas | Alta |

### 4.4 Contato (`/contato`)

| Seção | Objetivo | Prioridade |
|-------|----------|------------|
| Hero Contato | Introduzir formas de contato | Alta |
| Formulário de Contato | Capturar mensagens | Alta |
| Informações Alternativas | Email, redes sociais | Média |

---

## 5. Conteúdo Detalhado por Página

---

### 5.1 Página: HOME

---

#### Seção 1: Hero

**Objetivo:** Capturar atenção imediata e comunicar a proposta de valor principal.

**Headline (H1):**
> Venda seus packs de conteúdo. Sem complicação.

**Subheadline:**
> A plataforma feita para criadores que querem monetizar com simplicidade, segurança e profissionalismo. Cadastro gratuito — comece a vender em minutos.

**CTA Primário:** "Criar Conta Grátis" → `/cadastro`  
**CTA Secundário:** "Saiba Como Funciona" → scroll para seção "Como Funciona"

**Elementos Visuais:**
- Área para imagem/print do dashboard do criador ou da tela de criação de pack
- Placeholder: 1200x600px, legenda: "Dashboard do criador mostrando vendas e saldo"

**Componente ReactBits Sugerido:** Hero com split layout (imagem + texto)

**Animação GSAP:**
- Fade-in do texto (headline primeiro, subheadline 0.2s depois)
- Slide-up sutil dos CTAs
- Parallax leve na imagem

**Three.js Opcional:**
- Partículas neon lime sutis flutuando no background
- Fallback: gradiente animado CSS

---

#### Seção 2: Como Funciona

**Objetivo:** Explicar o processo de venda em 4 passos simples.

**Headline (H2):**
> Veja como é fácil vender seus packs

**Subheadline:**
> Em poucos minutos você está pronto para receber suas primeiras vendas.

**Passos:**

| Passo | Título | Descrição |
|-------|--------|-----------|
| 1 | Crie sua conta | Cadastro rápido e gratuito. Sem cartão de crédito. |
| 2 | Cadastre seus conteúdos | Faça upload de suas fotos e vídeos em packs organizados. |
| 3 | Defina o valor | Você escolhe quanto cobrar. De R$ 9,90 a R$ 500,00. |
| 4 | Compartilhe o link com seus fãs | Divulgue nas suas redes e comece a vender. |

**Frase de Fechamento:**
> O valor cai em sua Carteira Pezin.

**CTA:** "Começar Agora — É Grátis" → `/cadastro`

**Elementos Visuais:**
- Ícones numerados estilizados ou mini-ilustrações para cada passo
- Área para 4 placeholders de imagem: 300x200px cada

**Componente ReactBits Sugerido:** Steps/Timeline vertical ou horizontal

**Animação GSAP:**
- Scroll-trigger: cada passo aparece sequencialmente conforme scroll
- Fade-in + slide-up para cada card

---

#### Seção 3: Benefícios para Criadores

**Objetivo:** Destacar vantagens competitivas da plataforma.

**Headline (H2):**
> Por que criadores escolhem o Pack do Pezin

**Subheadline:**
> Tudo o que você precisa para monetizar seu conteúdo em um só lugar.

**Benefícios (Bento Grid):**

| Benefício | Headline | Descrição |
|-----------|----------|-----------|
| Cadastro Gratuito | Comece sem investir nada | Criar conta e cadastrar packs é 100% gratuito. Você só paga quando vende. |
| Pagamentos Seguros | Stripe, o padrão mundial | Pagamentos processados pelo Stripe, usado por milhões de empresas no mundo. |
| Receba Rápido | Saldo liberado em dias | Acompanhe seus ganhos e solicite saque quando quiser. |
| Controle Total | Seus preços, suas regras | Defina valores, edite packs, gerencie tudo do seu jeito. |
| Interface Profissional | Impressione seus fãs | Vitrine elegante e página de compra que converte. |
| Privacidade | Seu conteúdo protegido | Links tokenizados, acesso controlado, segurança em primeiro lugar. |

**CTA:** "Criar Minha Conta Grátis" → `/cadastro`

**Elementos Visuais:**
- Área para imagens ilustrativas de cada benefício
- Placeholders: 6 imagens de 400x300px

**Componente ReactBits Sugerido:** Bento Grid com cards de benefícios

**Animação GSAP:**
- Scroll-trigger: cards aparecem em stagger (0.1s de delay entre cada)
- Hover: scale sutil (1.02) com transição suave

---

#### Seção 4: Recursos da Plataforma

**Objetivo:** Mostrar funcionalidades específicas do sistema com prints.

**Headline (H2):**
> Conheça sua área de criador

**Subheadline:**
> Ferramentas pensadas para você focar no que importa: criar e vender.

**Recursos:**

| Recurso | Título | Descrição | Placeholder de Print |
|---------|--------|-----------|---------------------|
| Dashboard | Painel de Controle | Visualize vendas, saldo disponível e pendente em tempo real. | 800x500px - Print do dashboard |
| Gestão de Packs | Gerenciador de Packs | Crie, edite, publique e despublique seus packs com facilidade. | 800x500px - Print da lista de packs |
| Carteira | Carteira Pezin | Acompanhe seus ganhos e solicite saques quando quiser. | 800x500px - Print da carteira |
| Relatórios | Relatórios de Vendas | Veja quais packs vendem mais, quando e quanto você faturou. | 800x500px - Print de relatórios |
| Perfil Público | Sua Vitrine | Página profissional com todos os seus packs para compartilhar. | 800x500px - Print do perfil público |

**CTA:** "Quero Conhecer" → `/cadastro`

**Elementos Visuais:**
- Carrossel ou tabs com prints do sistema
- Cada print deve ter moldura de dispositivo (mockup de tela)

**Componente ReactBits Sugerido:** Feature Tabs ou Carousel com imagens

**Animação GSAP:**
- Transição suave entre tabs/slides
- Fade crossfade nas imagens

---

#### Seção 5: Segurança e Privacidade

**Objetivo:** Transmitir confiança sobre proteção de dados e conteúdo.

**Headline (H2):**
> Seu conteúdo protegido. Seus dados seguros.

**Subheadline:**
> Privacidade e segurança são prioridade desde o primeiro dia.

**Pontos de Segurança:**

| Ponto | Descrição |
|-------|-----------|
| Links Tokenizados | Cada compra gera um link único. Só quem pagou acessa. |
| Pagamentos via Stripe | Processamento seguro com criptografia de ponta a ponta. |
| Controle de Acesso | Você decide o que publicar e quando despublicar. |
| Sem Exposição de Dados Pessoais | Consumidores veem apenas seu nome artístico. |
| Hospedagem Segura | Infraestrutura profissional com CDN Cloudflare. |

**CTA:** "Criar Conta Segura" → `/cadastro`

**Elementos Visuais:**
- Ilustração ou ícone de segurança (cadeado, escudo)
- Placeholder: 600x400px

**Componente ReactBits Sugerido:** Feature List com ícones

**Animação GSAP:**
- Scroll-trigger: itens aparecem sequencialmente
- Ícones com pulse sutil ao entrar em view

---

#### Seção 6: Prova Social

**Objetivo:** Validar a plataforma através de depoimentos de criadores.

**Headline (H2):**
> O que criadores dizem sobre o Pack do Pezin

**Subheadline:**
> Histórias reais de quem já está vendendo.

**Depoimentos (Placeholders):**

| Depoimento | Nome | Descrição |
|------------|------|-----------|
| "Placeholder para depoimento 1. Texto sobre facilidade de uso e primeiras vendas." | Nome Artístico 1 | Criadora de conteúdo |
| "Placeholder para depoimento 2. Texto sobre rapidez no pagamento e suporte." | Nome Artístico 2 | Criadora de conteúdo |
| "Placeholder para depoimento 3. Texto sobre profissionalismo da plataforma." | Nome Artístico 3 | Criadora de conteúdo |

**Elementos Visuais:**
- Foto placeholder para cada depoimento: 100x100px (avatar)
- Cards de depoimento com aspas estilizadas

**Componente ReactBits Sugerido:** Testimonials Carousel ou Grid

**Animação GSAP:**
- Auto-scroll suave entre depoimentos (se carrossel)
- Fade-in no scroll-trigger

**Nota:** Não inventar números de vendas ou métricas. Usar apenas depoimentos reais quando disponíveis.

---

#### Seção 7: CTA Final

**Objetivo:** Última chamada para conversão antes do footer.

**Headline (H2):**
> Pronto para começar a vender?

**Subheadline:**
> Cadastro gratuito, sem cartão de crédito, sem compromisso. Crie sua conta em menos de 2 minutos.

**CTA Primário:** "Criar Conta Grátis" → `/cadastro`  
**CTA Secundário:** "Ainda tem dúvidas? Veja o FAQ" → `/perguntas-frequentes`

**Elementos Visuais:**
- Background com gradiente escuro para neon lime
- Possível elemento Three.js: mesh/blob animado sutil

**Componente ReactBits Sugerido:** CTA Section com background destacado

**Animação GSAP:**
- Parallax no background
- Pulse sutil no botão principal

---

### 5.2 Página: SOBRE

---

#### Seção 1: Hero Sobre

**Objetivo:** Apresentar a missão e propósito da plataforma.

**Headline (H1):**
> Criado para criadores

**Subheadline:**
> O Pack do Pezin nasceu para simplificar a vida de quem produz conteúdo e quer monetizar com dignidade, segurança e profissionalismo.

**Elementos Visuais:**
- Imagem abstrata ou ilustração representando criação/empoderamento
- Placeholder: 1000x500px

**Componente ReactBits Sugerido:** Hero simples com imagem de fundo

**Animação GSAP:**
- Fade-in do texto
- Parallax sutil na imagem

---

#### Seção 2: Nossa Missão

**Objetivo:** Comunicar o propósito da empresa.

**Headline (H2):**
> Nossa missão

**Texto:**
> Acreditamos que criadores de conteúdo merecem uma plataforma que respeite seu trabalho. Uma ferramenta simples, transparente e justa — onde você está no controle.

> O Pack do Pezin existe para eliminar barreiras. Sem taxas de entrada. Sem burocracia. Sem complicação. Apenas você, seu conteúdo e seus fãs.

**Elementos Visuais:**
- Ícone ou ilustração de missão
- Placeholder: 400x300px

---

#### Seção 3: Para Quem é o Pack do Pezin

**Objetivo:** Definir claramente o público-alvo.

**Headline (H2):**
> Para quem é o Pack do Pezin

**Texto:**

**Para criadores que querem:**
- Vender packs de fotos e vídeos sem complicação
- Ter controle total sobre preços e conteúdo
- Receber pagamentos de forma segura e rápida
- Uma plataforma profissional que valoriza seu trabalho

**Para criadores que NÃO querem:**
- Pagar taxas só para criar conta
- Lidar com sistemas complexos e confusos
- Esperar meses para receber
- Ter seu conteúdo exposto sem controle

**CTA:** "Criar Minha Conta Grátis" → `/cadastro`

---

#### Seção 4: Nossos Valores

**Objetivo:** Comunicar os princípios que guiam a plataforma.

**Headline (H2):**
> O que acreditamos

**Valores:**

| Valor | Descrição |
|-------|-----------|
| Simplicidade | Tecnologia deve facilitar, não complicar. Cada clique foi pensado. |
| Transparência | Sem taxas ocultas, sem surpresas. Você sabe exatamente o que esperar. |
| Respeito | Seu conteúdo, suas regras. Você está no comando. |
| Segurança | Privacidade e proteção são inegociáveis. |

**Elementos Visuais:**
- Cards ou lista estilizada
- Placeholders para ícones: 4x 80x80px

**Componente ReactBits Sugerido:** Values Grid com ícones

---

#### Seção 5: CTA Final Sobre

**Headline (H2):**
> Faça parte do Pack do Pezin

**Subheadline:**
> Cadastro gratuito. Comece a vender em minutos.

**CTA Primário:** "Criar Conta Grátis" → `/cadastro`

---

### 5.3 Página: FAQ

---

#### Seção 1: Hero FAQ

**Headline (H1):**
> Perguntas Frequentes

**Subheadline:**
> Tudo o que você precisa saber sobre o Pack do Pezin em um só lugar.

---

#### Seção 2: Accordion de Perguntas

**Componente ReactBits Sugerido:** Accordion/FAQ Component

**Animação GSAP:**
- Expand/collapse suave com easing
- Highlight na pergunta ativa

---

## 6. FAQ Completo

**Nota:** Esta é a ÚNICA página onde as taxas são mencionadas explicitamente.

---

### Categoria: Começando

**P: O que é o Pack do Pezin?**
R: O Pack do Pezin é uma plataforma de monetização para criadores de conteúdo adulto. Você cria packs de fotos e vídeos, define seu preço e vende diretamente para seus fãs através de um link único.

**P: Quanto custa para criar uma conta?**
R: Criar conta é 100% gratuito. Você não paga nada para se cadastrar, criar seu perfil ou cadastrar seus packs. Simples assim.

**P: Preciso ter CNPJ ou empresa?**
R: Não. Você pode vender como pessoa física. Basta ser maior de 18 anos e completar a verificação de idade.

---

### Categoria: Vendendo

**P: Como eu começo a vender?**
R: É simples: (1) Crie sua conta gratuita, (2) Cadastre seu pack com fotos/vídeos, (3) Defina o preço, (4) Compartilhe o link com seus fãs. Pronto, você está vendendo.

**P: Qual o preço mínimo e máximo de um pack?**
R: Você pode definir valores de R$ 9,90 até R$ 500,00 por pack.

**P: Quantos arquivos posso colocar em um pack?**
R: Cada pack pode ter de 3 a 50 arquivos (fotos ou vídeos). O tamanho máximo por arquivo é 100MB e o total do pack não pode ultrapassar 500MB.

**P: Quais formatos de arquivo são aceitos?**
R: Imagens: JPG, PNG e WebP. Vídeos: MP4 e MOV.

---

### Categoria: Pagamentos e Taxas

**P: Quais são as taxas da plataforma?**
R: A plataforma cobra uma taxa de **2,5% sobre o valor do pack + R$ 0,99 fixo por transação**. Essa taxa é descontada automaticamente de cada venda. Não há taxas para criar conta, cadastrar packs ou manter sua conta ativa.

**P: Como recebo meus pagamentos?**
R: Os pagamentos são processados via Stripe. Você conecta sua conta Stripe ao Pack do Pezin e recebe os valores diretamente.

**P: Quanto tempo demora para o dinheiro ficar disponível?**
R: Por segurança anti-fraude, o valor de cada venda fica pendente por 14 dias. Após esse período, o saldo fica disponível para saque.

**P: Qual o valor mínimo para saque?**
R: O valor mínimo para solicitar saque é R$ 50,00.

---

### Categoria: Carteira Pezin

**P: O que é a Carteira Pezin?**
R: É onde você acompanha todos os seus ganhos. Você vê o saldo pendente (vendas recentes aguardando liberação) e o saldo disponível (pronto para saque).

**P: Como funciona o saldo pendente?**
R: Quando você realiza uma venda, o valor vai para o saldo pendente. Após 14 dias (período de segurança), ele é transferido automaticamente para o saldo disponível.

---

### Categoria: Conteúdo

**P: Que tipo de conteúdo posso vender?**
R: Você pode vender packs de fotos e vídeos de conteúdo adulto, desde que sejam de sua autoria, você seja maior de 18 anos e o conteúdo respeite nossas políticas. Conteúdo ilegal, envolvendo menores ou violência não é permitido. Consulte nossa Política de Conteúdo (placeholder) para detalhes.

**P: As imagens de preview podem ter nudez?**
R: Não. As imagens de preview (aquelas que aparecem na vitrine antes da compra) não podem conter nudez explícita. O conteúdo explícito fica dentro do pack, acessível apenas após a compra.

---

### Categoria: Segurança

**P: Meus dados pessoais ficam expostos?**
R: Não. Os compradores veem apenas seu nome artístico. Seus dados pessoais são protegidos e usados apenas para processamento de pagamentos.

**P: Como funciona a proteção do conteúdo?**
R: Cada compra gera um link único e tokenizado. Apenas quem pagou consegue acessar o conteúdo. Você também pode despublicar packs a qualquer momento.

**P: O pagamento é seguro?**
R: Sim. Todos os pagamentos são processados pelo Stripe, líder mundial em processamento de pagamentos, com criptografia de ponta a ponta.

---

### Categoria: Suporte

**P: Como entro em contato com o suporte?**
R: Você pode nos contatar através da página de Contato ou pelo email [placeholder@email.com]. Respondemos em até 24 horas úteis.

**P: Encontrei um problema técnico. O que faço?**
R: Acesse a página de Contato e descreva o problema com o máximo de detalhes possível. Nossa equipe técnica analisará e responderá o mais rápido possível.

---

#### Seção 3: CTA Final FAQ

**Headline (H2):**
> Ainda tem dúvidas?

**Subheadline:**
> Entre em contato conosco ou comece agora mesmo — é gratuito.

**CTA Primário:** "Criar Conta Grátis" → `/cadastro`  
**CTA Secundário:** "Falar com Suporte" → `/contato`

---

### 5.4 Página: CONTATO

---

#### Seção 1: Hero Contato

**Headline (H1):**
> Fale Conosco

**Subheadline:**
> Dúvidas, sugestões ou problemas? Estamos aqui para ajudar.

---

#### Seção 2: Formulário de Contato

**Campos:**
- Nome (obrigatório)
- Email (obrigatório)
- Assunto (select: Dúvida, Suporte Técnico, Sugestão, Outro)
- Mensagem (textarea, obrigatório)

**CTA:** "Enviar Mensagem"

**Feedback:**
- Sucesso: "Mensagem enviada com sucesso. Responderemos em até 24 horas úteis."
- Erro: "Ocorreu um erro. Tente novamente ou envie email para [placeholder@email.com]."

**Validação:**
- Email válido (Zod)
- Mensagem mínimo 20 caracteres
- Rate limiting no backend

**Componente ReactBits Sugerido:** Form com validação

**Animação GSAP:**
- Shake sutil nos campos com erro
- Fade-in do feedback de sucesso

---

#### Seção 3: Informações Alternativas

**Email:** [placeholder@email.com]

**Horário de Atendimento:** Segunda a Sexta, 9h às 18h (horário de Brasília)

**Redes Sociais:** [Placeholders para links de redes]

---

## 7. Diretrizes de UI/Brand

### 7.1 Paleta de Cores

| Nome | Hex | Uso |
|------|-----|-----|
| **Preto Principal** | `#0A0A0A` | Background principal |
| **Preto Secundário** | `#141414` | Cards, seções alternadas |
| **Neon Lime** | `#D4FF00` | Accent, CTAs, destaques |
| **Neon Lime Hover** | `#BFFF00` | Estados hover |
| **Branco** | `#FFFFFF` | Texto principal |
| **Cinza Claro** | `#A1A1A1` | Texto secundário |
| **Cinza Escuro** | `#2A2A2A` | Bordas, separadores |

### 7.2 Tipografia

| Elemento | Font | Weight | Size (Desktop) | Size (Mobile) |
|----------|------|--------|----------------|---------------|
| H1 | Inter | 700 (Bold) | 56px / 3.5rem | 36px / 2.25rem |
| H2 | Inter | 600 (SemiBold) | 40px / 2.5rem | 28px / 1.75rem |
| H3 | Inter | 600 (SemiBold) | 28px / 1.75rem | 22px / 1.375rem |
| Body | Inter | 400 (Regular) | 18px / 1.125rem | 16px / 1rem |
| Body Small | Inter | 400 (Regular) | 16px / 1rem | 14px / 0.875rem |
| CTA Button | Inter | 600 (SemiBold) | 18px / 1.125rem | 16px / 1rem |

### 7.3 Espaçamentos

| Nome | Valor | Uso |
|------|-------|-----|
| Section Padding | 80px / 120px | Vertical entre seções |
| Container Max | 1200px | Largura máxima do conteúdo |
| Gap Cards | 24px | Espaço entre cards |
| Gap Elementos | 16px | Espaço entre elementos menores |

### 7.4 Tom de Voz

- **Confiante:** Afirmações diretas, sem hesitação
- **Acessível:** Linguagem simples, sem jargões técnicos
- **Empoderador:** Foco no controle e autonomia do criador
- **Honesto:** Sem exageros ou promessas irreais
- **Profissional:** Sério sem ser frio

### 7.5 Botões

**Primário:**
- Background: Neon Lime (`#D4FF00`)
- Texto: Preto (`#0A0A0A`)
- Border Radius: 8px
- Padding: 16px 32px
- Hover: Background `#BFFF00`, scale 1.02

**Secundário:**
- Background: Transparente
- Border: 2px solid Neon Lime
- Texto: Neon Lime
- Hover: Background rgba(212, 255, 0, 0.1)

**Ghost:**
- Background: Transparente
- Texto: Branco
- Hover: Texto Neon Lime

---

## 8. Requisitos Técnicos

### 8.1 Stack

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 14+ | Framework (App Router) |
| React | 18+ | UI Library |
| TypeScript | 5+ | Linguagem |
| Tailwind CSS | 3+ | Estilização |
| GSAP | 3+ | Animações |
| Three.js | Latest | Elementos 3D opcionais |
| Zod | Latest | Validação de formulários |

### 8.2 Estrutura de Arquivos

```
apps/web/src/
├── app/
│   ├── (marketing)/           # Grupo de rotas do site público
│   │   ├── layout.tsx         # Layout do marketing site
│   │   ├── page.tsx           # Home
│   │   ├── sobre/
│   │   │   └── page.tsx
│   │   ├── perguntas-frequentes/
│   │   │   └── page.tsx
│   │   └── contato/
│   │       └── page.tsx
│   └── ...
├── components/
│   ├── marketing/             # Componentes específicos do marketing site
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Benefits.tsx
│   │   ├── Features.tsx
│   │   ├── Security.tsx
│   │   ├── Testimonials.tsx
│   │   ├── CTASection.tsx
│   │   ├── FAQ.tsx
│   │   └── ContactForm.tsx
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── gsap.ts               # Configuração GSAP
│   └── analytics.ts          # Tracking de eventos
└── styles/
    └── marketing.css         # Estilos específicos
```

### 8.3 Performance

| Métrica | Target |
|---------|--------|
| Lighthouse Performance | > 90 |
| Lighthouse Accessibility | > 90 |
| Lighthouse Best Practices | > 90 |
| Lighthouse SEO | > 90 |
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |

### 8.4 Acessibilidade

- Suporte completo a navegação por teclado
- ARIA labels em elementos interativos
- Contraste de cores WCAG AA
- Respeitar `prefers-reduced-motion`
- Alt text em todas as imagens
- Focus states visíveis

### 8.5 Imagens

- Usar `next/image` para otimização automática
- Formatos: WebP com fallback para JPG/PNG
- Lazy loading por padrão
- Definir width/height para evitar CLS
- Placeholder blur para carregamento progressivo

### 8.6 Animações GSAP

**Configuração Global:**
```typescript
// lib/gsap.ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Verificar preferência de movimento reduzido
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const defaultAnimation = {
  duration: prefersReducedMotion ? 0 : 0.6,
  ease: 'power2.out',
};
```

**Padrões de Animação:**

| Tipo | Trigger | Propriedades |
|------|---------|--------------|
| Fade In | scroll-trigger | opacity: 0 → 1, y: 20 → 0 |
| Stagger | scroll-trigger | stagger: 0.1 |
| Parallax | scroll | y: speed * scrollY |
| Hover Scale | hover | scale: 1.02 |

### 8.7 Three.js (Opcional)

**Ideias Seguras com Fallback:**

1. **Partículas Neon:**
   - Partículas pequenas flutuando no hero
   - Cor: Neon Lime com opacidade variável
   - Movimento: float suave, interação com mouse
   - Fallback: gradiente animado CSS

2. **Blob/Mesh Animado:**
   - Forma orgânica animada no CTA final
   - Cor: Gradiente preto para neon lime
   - Fallback: gradiente radial estático

3. **Grid Lines:**
   - Grid sutil no background de seções
   - Movimento: parallax leve
   - Fallback: imagem de grid estática

**Considerações:**
- Carregar Three.js apenas quando necessário (dynamic import)
- Detectar dispositivos de baixa performance
- Fallback automático se WebGL não disponível
- Limitar FPS em mobile

---

## 9. SEO Técnico

### 9.1 Estrutura de URLs

| Página | URL | Canonical |
|--------|-----|-----------|
| Home | `/` | `https://packdopezin.com/` |
| Sobre | `/sobre` | `https://packdopezin.com/sobre` |
| FAQ | `/perguntas-frequentes` | `https://packdopezin.com/perguntas-frequentes` |
| Contato | `/contato` | `https://packdopezin.com/contato` |

### 9.2 Metatags por Página

#### Home

```html
<title>Pack do Pezin — Venda seus Packs de Conteúdo | Cadastro Gratuito</title>
<meta name="description" content="Monetize seu conteúdo com o Pack do Pezin. Cadastro gratuito, pagamentos seguros via Stripe, controle total sobre seus packs. Comece a vender em minutos.">
<meta name="keywords" content="vender packs, monetizar conteúdo, plataforma criadores, venda de fotos, venda de vídeos">
```

#### Sobre

```html
<title>Sobre o Pack do Pezin — Plataforma para Criadores de Conteúdo</title>
<meta name="description" content="Conheça o Pack do Pezin, a plataforma criada para criadores monetizarem seu conteúdo com simplicidade, segurança e profissionalismo. Cadastro 100% gratuito.">
```

#### FAQ

```html
<title>Perguntas Frequentes — Pack do Pezin</title>
<meta name="description" content="Tire suas dúvidas sobre o Pack do Pezin. Como vender, taxas, pagamentos, segurança e mais. Tudo o que você precisa saber em um só lugar.">
```

#### Contato

```html
<title>Contato — Pack do Pezin</title>
<meta name="description" content="Entre em contato com o Pack do Pezin. Dúvidas, sugestões ou suporte técnico. Respondemos em até 24 horas.">
```

### 9.3 Open Graph e Twitter Cards

```html
<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Pack do Pezin">
<meta property="og:title" content="[Título da página]">
<meta property="og:description" content="[Descrição da página]">
<meta property="og:image" content="https://packdopezin.com/og-image.jpg">
<meta property="og:url" content="[URL canônica]">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[Título da página]">
<meta name="twitter:description" content="[Descrição da página]">
<meta name="twitter:image" content="https://packdopezin.com/twitter-image.jpg">
```

### 9.4 Schema.org

#### Organization (Global)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Pack do Pezin",
  "url": "https://packdopezin.com",
  "logo": "https://packdopezin.com/logo.png",
  "description": "Plataforma de monetização para criadores de conteúdo",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "placeholder@email.com",
    "contactType": "customer service"
  }
}
```

#### WebSite (Home)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Pack do Pezin",
  "url": "https://packdopezin.com"
}
```

#### FAQPage (FAQ)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "O que é o Pack do Pezin?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "O Pack do Pezin é uma plataforma de monetização para criadores de conteúdo adulto..."
      }
    }
    // ... demais perguntas
  ]
}
```

#### BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://packdopezin.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Perguntas Frequentes",
      "item": "https://packdopezin.com/perguntas-frequentes"
    }
  ]
}
```

### 9.5 Estratégia de Palavras-Chave

**Cluster Principal: Monetização de Conteúdo**
- vender packs de fotos
- vender packs de vídeos
- monetizar conteúdo adulto
- plataforma para criadores
- ganhar dinheiro com conteúdo

**Cluster Secundário: Funcionalidades**
- pagamento seguro criadores
- receber por conteúdo
- vender fotos online
- plataforma venda de packs

**Cluster Terciário: Comparativo (para blog futuro)**
- alternativa a [concorrentes]
- melhor plataforma criadores

### 9.6 Sitemap e Robots

**sitemap.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://packdopezin.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://packdopezin.com/sobre</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://packdopezin.com/perguntas-frequentes</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://packdopezin.com/contato</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
```

**robots.txt:**
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /login
Disallow: /cadastro

Sitemap: https://packdopezin.com/sitemap.xml
```

---

## 10. Estratégia de Conversão

### 10.1 CTAs por Página

| Página | CTA Primário | CTA Secundário | Quantidade |
|--------|--------------|----------------|------------|
| Home | Criar Conta Grátis | Saiba Mais / Ver FAQ | 5+ |
| Sobre | Criar Conta Grátis | - | 2 |
| FAQ | Criar Conta Grátis | Falar com Suporte | 1 |
| Contato | Enviar Mensagem | - | 1 |

### 10.2 Redução de Fricção

- "Cadastro gratuito" destacado em múltiplos pontos
- "Sem cartão de crédito" quando relevante
- "Comece em minutos" para urgência
- Passos claros e visuais (4 etapas)
- FAQ acessível para tirar dúvidas

### 10.3 Provas Sociais (Placeholders)

- Depoimentos de criadores (3 placeholders)
- Métricas de plataforma: **NÃO usar números inventados**
- Quando houver dados reais, adicionar: "X criadores ativos", "X packs vendidos"

### 10.4 Analytics Events

| Evento | Trigger | Dados |
|--------|---------|-------|
| `page_view` | Carregamento de página | page_path, page_title |
| `cta_click` | Clique em CTA | cta_text, cta_location, page |
| `scroll_depth` | Scroll 25%, 50%, 75%, 100% | depth, page |
| `faq_expand` | Expansão de pergunta FAQ | question_id, question_text |
| `contact_submit` | Envio do formulário | subject |
| `contact_error` | Erro no formulário | error_type |

**Implementação:**
```typescript
// lib/analytics.ts
export const trackEvent = (event: string, data?: Record<string, any>) => {
  // Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, data);
  }
};
```

---

## 11. Plano de Testes (QA Checklist)

### 11.1 Testes Funcionais

- [ ] Todos os links internos funcionam corretamente
- [ ] CTAs redirecionam para `/cadastro` ou `/login`
- [ ] Formulário de contato valida campos obrigatórios
- [ ] Formulário de contato exibe feedback de sucesso/erro
- [ ] FAQ accordion abre/fecha corretamente
- [ ] Header sticky funciona no scroll
- [ ] Links do footer funcionam

### 11.2 Testes de Responsividade

- [ ] Layout correto em mobile (375px)
- [ ] Layout correto em tablet (768px)
- [ ] Layout correto em desktop (1024px+)
- [ ] Imagens redimensionam corretamente
- [ ] Texto legível em todos os breakpoints
- [ ] Touch targets adequados (mínimo 44x44px)

### 11.3 Testes de Performance

- [ ] Lighthouse Performance > 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Imagens otimizadas (WebP)
- [ ] Fonts carregadas com `font-display: swap`

### 11.4 Testes de Acessibilidade

- [ ] Navegação completa por teclado
- [ ] Focus states visíveis
- [ ] Alt text em todas as imagens
- [ ] Contraste de cores WCAG AA
- [ ] ARIA labels em elementos interativos
- [ ] Animações respeitam `prefers-reduced-motion`

### 11.5 Testes de SEO

- [ ] H1 único por página
- [ ] Hierarquia de headings correta
- [ ] Metatags presentes e corretas
- [ ] Schema.org válido (Google Rich Results Test)
- [ ] Canonical URLs corretas
- [ ] sitemap.xml acessível
- [ ] robots.txt correto

### 11.6 Testes Cross-Browser

- [ ] Chrome (último)
- [ ] Firefox (último)
- [ ] Safari (último)
- [ ] Edge (último)
- [ ] Safari iOS
- [ ] Chrome Android

---

## 12. Backlog: MVP vs Pós-MVP

### 12.1 MVP (Lançamento)

| Item | Prioridade |
|------|------------|
| Página Home completa | Alta |
| Página Sobre | Alta |
| Página FAQ | Alta |
| Página Contato | Alta |
| Header/Footer globais | Alta |
| SEO básico (metatags, sitemap) | Alta |
| Analytics básico (page views, CTA clicks) | Alta |
| Responsividade mobile-first | Alta |
| Performance > 90 Lighthouse | Alta |

### 12.2 Pós-MVP

| Item | Prioridade |
|------|------------|
| Elementos Three.js | Média |
| Blog/Recursos | Média |
| Página de Política de Privacidade | Média |
| Página de Termos de Uso | Média |
| Página de Política de Conteúdo | Média |
| Schema.org completo | Média |
| A/B testing de CTAs | Baixa |
| Chatbot de suporte | Baixa |
| Internacionalização (i18n) | Baixa |
| Dark/Light mode toggle | Baixa |

---

## 13. Riscos e Mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Performance degradada por animações** | Média | Alto | Usar `prefers-reduced-motion`, lazy load Three.js, fallbacks CSS |
| **Three.js incompatível em dispositivos** | Média | Baixo | Fallbacks automáticos, detecção de WebGL |
| **Confusão sobre taxas** | Baixa | Alto | Taxas APENAS no FAQ, linguagem clara |
| **SEO não indexado** | Baixa | Alto | Verificar robots.txt, submeter sitemap ao Google Search Console |
| **Formulário de contato com spam** | Média | Médio | Rate limiting, honeypot field, validação backend |
| **CLS por imagens sem dimensões** | Média | Médio | Sempre definir width/height, usar placeholder blur |
| **Acessibilidade falha** | Baixa | Médio | Testes com screen readers, auditorias Lighthouse |

---

## 14. Checklist de Conteúdo Final

### Home
- [ ] Hero com headline, subheadline, 2 CTAs
- [ ] Seção "Como Funciona" com 4 passos exatos
- [ ] Seção "Benefícios" com 6 cards
- [ ] Seção "Recursos" com 5 features e prints
- [ ] Seção "Segurança" com 5 pontos
- [ ] Seção "Prova Social" com 3 depoimentos placeholder
- [ ] CTA Final

### Sobre
- [ ] Hero com headline e subheadline
- [ ] Seção "Nossa Missão"
- [ ] Seção "Para Quem É"
- [ ] Seção "Nossos Valores" com 4 valores
- [ ] CTA Final

### FAQ
- [ ] Hero
- [ ] Accordion com todas as perguntas (6 categorias, 17+ perguntas)
- [ ] Taxas mencionadas APENAS aqui (2,5% + R$0,99)
- [ ] CTA Final

### Contato
- [ ] Hero
- [ ] Formulário funcional
- [ ] Informações alternativas

### Global
- [ ] Header com logo, links, CTA
- [ ] Footer com links, legais, contato
- [ ] Metatags em todas as páginas
- [ ] Schema.org implementado
- [ ] Analytics configurado

---

**Documento preparado para entrega à equipe de desenvolvimento frontend.**

*Fim do PRD*
