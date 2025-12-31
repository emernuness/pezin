# PRD — Pack do Pezin

**Versão:** 1.0  
**Data:** Dezembro 2024  
**Status:** Aprovado para Desenvolvimento  
**Classificação:** Produto Final (Produção)

---

## 1. Visão Geral do Produto

**Pack do Pezin** é uma plataforma web de monetização para criadores(as) de conteúdo adulto, especializada na venda de packs de imagens e vídeos. A plataforma conecta criadores(as) a consumidores finais através de um marketplace simples, seguro e com processamento de pagamentos via Stripe.

### 1.1 Escopo do Produto

| Incluído | Não Incluído |
|----------|--------------|
| Cadastro e autenticação de usuários | Sistema de assinaturas/mensalidades |
| CRUD de packs (criador) | Chat/mensagens entre usuários |
| Vitrine pública de packs | Sistema de gorjetas/tips |
| Pagamento único via Stripe Checkout | Múltiplos gateways de pagamento |
| Dashboard básico do criador | Live streaming |
| Acesso tokenizado aos packs comprados | Sistema de afiliados |
| Gestão de saques (criador) | App mobile nativo |

### 1.2 Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | Next.js 14+ (App Router) |
| **Backend** | NestJS |
| **Banco de Dados** | PostgreSQL |
| **ORM** | Prisma |
| **Linguagem** | TypeScript (strict mode) |
| **Estilização** | Tailwind CSS |
| **Componentes UI** | shadcn/ui |
| **Validação** | Zod |
| **Estado Global** | Zustand |
| **HTTP Client** | Axios |
| **Testes** | Vitest |
| **Pagamentos** | Stripe (Checkout + Connect) |
| **Storage** | Cloudflare R2 |
| **CDN** | Cloudflare |
| **Hospedagem** | Coolify (servidor próprio) |

### 1.3 Estrutura de Repositórios

```
pack-do-pezin/
├── apps/
│   ├── web/                 # Next.js 14+ (Frontend)
│   │   ├── src/
│   │   │   ├── app/         # App Router
│   │   │   ├── components/  # Componentes React
│   │   │   ├── hooks/       # Custom hooks
│   │   │   ├── stores/      # Zustand stores
│   │   │   ├── services/    # Axios services
│   │   │   ├── lib/         # Utilitários
│   │   │   └── types/       # TypeScript types
│   │   └── package.json
│   │
│   └── api/                 # NestJS (Backend)
│       ├── src/
│       │   ├── modules/     # Módulos NestJS
│       │   ├── common/      # Guards, pipes, filters
│       │   ├── config/      # Configurações
│       │   └── prisma/      # Prisma module
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
│
├── packages/
│   └── shared/              # Types e schemas Zod compartilhados
│       ├── src/
│       │   ├── schemas/     # Zod schemas
│       │   └── types/       # TypeScript types
│       └── package.json
│
└── package.json             # Workspace root (pnpm)
```

---

## 2. Objetivo do Negócio

### 2.1 Proposta de Valor

Permitir que criadores(as) de conteúdo adulto monetizem seu trabalho de forma simples, recebendo pagamentos seguros e mantendo controle sobre seu conteúdo.

### 2.2 Modelo de Receita

| Métrica | Valor |
|---------|-------|
| Taxa da plataforma | 20% sobre cada venda |
| Repasse ao criador | 80% do valor do pack |
| Valor mínimo para saque | R$ 50,00 |
| Prazo de disponibilização | 14 dias após a compra (anti-fraude) |

### 2.3 KPIs Primários

- Número de criadores ativos (≥1 pack publicado)
- Volume de vendas (GMV)
- Taxa de conversão (visitante → comprador)
- Ticket médio por transação
- Receita líquida da plataforma

---

## 3. Perfis de Usuários (Personas)

### 3.1 Criador(a) de Conteúdo

| Atributo | Descrição |
|----------|-----------|
| **Perfil** | Pessoa física, 18+, produz conteúdo adulto |
| **Objetivo** | Monetizar conteúdo próprio vendendo packs |
| **Necessidades** | Interface simples, pagamentos confiáveis, controle sobre conteúdo |
| **Frustrações** | Plataformas complexas, taxas abusivas, vazamento de conteúdo |

### 3.2 Consumidor Final

| Atributo | Descrição |
|----------|-----------|
| **Perfil** | Pessoa física, 18+, interessado em conteúdo adulto |
| **Objetivo** | Descobrir e comprar packs de criadores |
| **Necessidades** | Navegação fácil, pagamento seguro, acesso imediato |
| **Frustrações** | Golpes, conteúdo diferente do anunciado, processo de compra complexo |

---

## 4. Fluxos Principais

### 4.1 Fluxo do Criador

```
[Cadastro] → [Verificação 18+] → [Completar Perfil] → [Conectar Stripe] 
    → [Criar Pack] → [Upload de Mídia] → [Definir Preço] → [Publicar]
    → [Acompanhar Vendas] → [Solicitar Saque]
```

**Estados do Criador:**
- `pending_verification` — Aguardando verificação de idade
- `pending_stripe` — Precisa conectar conta Stripe
- `active` — Pode criar e vender packs
- `suspended` — Conta suspensa (violação de termos)

### 4.2 Fluxo do Consumidor

```
[Navegar Vitrine] → [Ver Pack] → [Confirmar 18+] → [Cadastro/Login]
    → [Checkout Stripe] → [Pagamento Aprovado] → [Acesso ao Pack]
    → [Visualizar/Download]
```

**Estados da Compra:**
- `pending` — Aguardando pagamento
- `paid` — Pago, acesso liberado
- `refunded` — Reembolsado
- `expired` — Link de acesso expirado (se aplicável)

---

## 5. Requisitos Funcionais

### 5.1 Módulo de Autenticação

| ID | Requisito | Prioridade |
|----|-----------|------------|
| AUTH-01 | Cadastro com email e senha | Alta |
| AUTH-02 | Login com email e senha | Alta |
| AUTH-03 | Recuperação de senha via email | Alta |
| AUTH-04 | Verificação de email obrigatória | Alta |
| AUTH-05 | Seleção de tipo de conta (criador/consumidor) no cadastro | Alta |
| AUTH-06 | Confirmação de maioridade (checkbox + data de nascimento) | Alta |
| AUTH-07 | Logout com invalidação de sessão | Alta |

### 5.2 Módulo de Perfil do Criador

| ID | Requisito | Prioridade |
|----|-----------|------------|
| PROF-01 | Editar nome artístico (exibição pública) | Alta |
| PROF-02 | Editar bio (até 500 caracteres) | Alta |
| PROF-03 | Upload de foto de perfil | Alta |
| PROF-04 | Upload de foto de capa | Média |
| PROF-05 | Definir slug único para URL pública (`/c/{slug}`) | Alta |
| PROF-06 | Visualizar próprio perfil público | Alta |

### 5.3 Módulo de Gestão de Packs

| ID | Requisito | Prioridade |
|----|-----------|------------|
| PACK-01 | Criar pack com título e descrição | Alta |
| PACK-02 | Upload de imagens de preview (até 3, sem nudez explícita) | Alta |
| PACK-03 | Upload de arquivos do pack (imagens/vídeos) | Alta |
| PACK-04 | Definir preço do pack (R$ 9,90 a R$ 500,00) | Alta |
| PACK-05 | Salvar pack como rascunho | Alta |
| PACK-06 | Publicar pack (tornar visível na vitrine) | Alta |
| PACK-07 | Despublicar pack (ocultar sem excluir) | Alta |
| PACK-08 | Editar pack publicado (exceto arquivos do pack) | Alta |
| PACK-09 | Excluir pack (soft delete) | Alta |
| PACK-10 | Listar packs próprios com filtro por status | Alta |

**Regras de Upload:**
- Formatos de imagem: JPG, PNG, WebP
- Formatos de vídeo: MP4, MOV
- Tamanho máximo por arquivo: 100MB
- Total máximo por pack: 500MB
- Mínimo de arquivos por pack: 3
- Máximo de arquivos por pack: 50

### 5.4 Módulo de Vitrine (Consumidor)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| VIT-01 | Listar packs públicos (paginação) | Alta |
| VIT-02 | Filtrar por faixa de preço | Média |
| VIT-03 | Ordenar por: mais recentes, mais vendidos, preço | Média |
| VIT-04 | Buscar por nome do criador ou título do pack | Média |
| VIT-05 | Ver página do pack (preview + descrição + preço) | Alta |
| VIT-06 | Ver perfil público do criador | Alta |
| VIT-07 | Listar packs de um criador específico | Alta |

### 5.5 Módulo de Compras

| ID | Requisito | Prioridade |
|----|-----------|------------|
| COMP-01 | Iniciar checkout de um pack | Alta |
| COMP-02 | Redirecionar para Stripe Checkout | Alta |
| COMP-03 | Receber webhook de pagamento aprovado | Alta |
| COMP-04 | Liberar acesso ao pack após pagamento | Alta |
| COMP-05 | Exibir página "Meus Packs" com compras realizadas | Alta |
| COMP-06 | Acessar pack comprado via link tokenizado | Alta |
| COMP-07 | Download individual de arquivos do pack | Alta |
| COMP-08 | Download em lote (ZIP) do pack completo | Média |

### 5.6 Módulo Dashboard do Criador

| ID | Requisito | Prioridade |
|----|-----------|------------|
| DASH-01 | Exibir total de vendas (quantidade) | Alta |
| DASH-02 | Exibir receita bruta total | Alta |
| DASH-03 | Exibir receita líquida (após taxa da plataforma) | Alta |
| DASH-04 | Exibir saldo disponível para saque | Alta |
| DASH-05 | Exibir saldo pendente (período anti-fraude) | Alta |
| DASH-06 | Listar últimas vendas (pack, valor, data) | Alta |
| DASH-07 | Gráfico simples de vendas (últimos 30 dias) | Média |

### 5.7 Módulo de Saques

| ID | Requisito | Prioridade |
|----|-----------|------------|
| SAQ-01 | Solicitar saque do saldo disponível | Alta |
| SAQ-02 | Validar valor mínimo de saque (R$ 50,00) | Alta |
| SAQ-03 | Processar saque via Stripe Connect (Payout) | Alta |
| SAQ-04 | Exibir histórico de saques | Alta |
| SAQ-05 | Exibir status do saque (pendente, processado, falhou) | Alta |

---

## 6. Requisitos Não Funcionais

| Categoria | Requisito | Métrica |
|-----------|-----------|---------|
| **Performance** | Tempo de carregamento da vitrine | < 2 segundos (P95) |
| **Performance** | Tempo de upload de arquivos | < 30 segundos para 100MB |
| **Disponibilidade** | Uptime da plataforma | ≥ 99,5% mensal |
| **Segurança** | Criptografia em trânsito | TLS 1.3 obrigatório |
| **Segurança** | Criptografia em repouso | AES-256 para arquivos |
| **Segurança** | Proteção contra download não autorizado | URLs assinadas com expiração |
| **Escalabilidade** | Suporte a uploads simultâneos | ≥ 100 uploads/minuto |
| **Escalabilidade** | Suporte a usuários simultâneos | ≥ 10.000 sessões |
| **Acessibilidade** | Responsividade | Mobile-first, breakpoints: 375px, 768px, 1024px |
| **Compatibilidade** | Navegadores | Chrome, Firefox, Safari, Edge (últimas 2 versões) |

---

## 7. Regras de Negócio

### 7.1 Regras de Cadastro

| ID | Regra |
|----|-------|
| RN-01 | Apenas maiores de 18 anos podem se cadastrar |
| RN-02 | Email deve ser único no sistema |
| RN-03 | Criador só pode publicar packs após conectar conta Stripe |
| RN-04 | Slug do criador deve ser único e conter apenas letras, números e hífens |

### 7.2 Regras de Packs

| ID | Regra |
|----|-------|
| RN-05 | Pack deve ter no mínimo 3 arquivos para ser publicado |
| RN-06 | Imagens de preview NÃO podem conter nudez explícita |
| RN-07 | Preço mínimo do pack: R$ 9,90 |
| RN-08 | Preço máximo do pack: R$ 500,00 |
| RN-09 | Pack só pode ser excluído se não tiver vendas |
| RN-10 | Pack com vendas só pode ser despublicado (soft delete) |
| RN-11 | Compradores de pack despublicado mantêm acesso |

### 7.3 Regras Financeiras

| ID | Regra |
|----|-------|
| RN-12 | Taxa da plataforma: 20% sobre o valor do pack |
| RN-13 | Repasse ao criador: 80% do valor do pack |
| RN-14 | Saldo fica pendente por 14 dias após a compra |
| RN-15 | Após 14 dias, saldo move para "disponível" |
| RN-16 | Valor mínimo para saque: R$ 50,00 |
| RN-17 | Saques processados em até 2 dias úteis (Stripe) |
| RN-18 | Em caso de reembolso, valor é deduzido do saldo do criador |

### 7.4 Regras de Acesso ao Conteúdo

| ID | Regra |
|----|-------|
| RN-19 | Consumidor só acessa pack após confirmação de pagamento |
| RN-20 | Acesso ao pack é vitalício (enquanto pack existir) |
| RN-21 | URLs de acesso aos arquivos expiram em 1 hora |
| RN-22 | Consumidor pode regenerar URL a qualquer momento |
| RN-23 | Downloads são limitados a 10 por arquivo por dia |

---

## 8. Autenticação e Autorização

### 8.1 Estratégia de Autenticação

- **Método:** JWT (Access Token + Refresh Token)
- **Backend:** NestJS com Passport.js
- **Access Token:** Expiração 15 minutos
- **Refresh Token:** Expiração 7 dias, armazenado em cookie HTTP-only
- **Storage Frontend:** Access token em memória (Zustand)

### 8.2 Fluxo de Cadastro

```
1. Usuário preenche: email, senha, data de nascimento, tipo de conta
2. Frontend valida com Zod schema
3. API NestJS valida idade ≥ 18 anos
4. Sistema envia email de verificação
5. Usuário clica no link (válido por 24h)
6. Conta ativada, tokens gerados
```

### 8.3 Schemas Zod (Compartilhados)

```typescript
// packages/shared/src/schemas/auth.schema.ts
import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter letra maiúscula')
    .regex(/[a-z]/, 'Deve conter letra minúscula')
    .regex(/[0-9]/, 'Deve conter número'),
  birthDate: z.string().refine((date) => {
    const age = Math.floor(
      (Date.now() - new Date(date).getTime()) / 31557600000
    );
    return age >= 18;
  }, 'Você deve ter 18 anos ou mais'),
  userType: z.enum(['creator', 'consumer']),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Você deve aceitar os termos' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

### 8.4 Zustand Store (Auth)

```typescript
// apps/web/src/stores/auth.store.ts
import { create } from 'zustand';
import { api } from '@/services/api';

interface User {
  id: string;
  email: string;
  displayName: string;
  userType: 'creator' | 'consumer';
  emailVerified: boolean;
  stripeConnected: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken } = response.data;
    set({ user, accessToken, isAuthenticated: true });
  },

  logout: async () => {
    await api.post('/auth/logout');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { accessToken } = response.data;
      set({ accessToken });
    } catch {
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
}));
```

### 8.5 Axios Service

```typescript
// apps/web/src/services/api.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Para refresh token cookie
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Interceptor para refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await useAuthStore.getState().refreshToken();
        const { accessToken } = useAuthStore.getState();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
```

### 8.6 NestJS Auth Module

```typescript
// apps/api/src/modules/auth/auth.controller.ts
import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto, LoginDto } from './dto';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { signUpSchema, loginSchema } from '@pack-do-pezin/shared';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body(new ZodValidationPipe(signUpSchema)) dto: SignUpDto,
  ) {
    return this.authService.signUp(dto);
  }

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, accessToken, refreshToken } = await this.authService.login(dto);
    
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });
    
    return { user, accessToken };
  }

  @Post('refresh')
  async refresh(
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.refreshTokens(refreshToken);
    
    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    return { accessToken: tokens.accessToken };
  }
}
```

### 8.7 Zod Validation Pipe (NestJS)

```typescript
// apps/api/src/common/pipes/zod-validation.pipe.ts
import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        throw new BadRequestException({ errors: messages });
      }
      throw error;
    }
  }
}
```

### 8.8 Requisitos de Senha

| Requisito | Valor |
|-----------|-------|
| Tamanho mínimo | 8 caracteres |
| Complexidade | 1 maiúscula, 1 minúscula, 1 número |
| Hash | bcrypt (cost factor 12) |

### 8.9 Matriz de Permissões

| Recurso | Visitante | Consumidor | Criador | Admin |
|---------|-----------|------------|---------|-------|
| Ver vitrine | ✅ | ✅ | ✅ | ✅ |
| Ver pack (preview) | ✅ | ✅ | ✅ | ✅ |
| Comprar pack | ❌ | ✅ | ✅ | ✅ |
| Acessar pack comprado | ❌ | ✅ | ✅ | ✅ |
| Criar pack | ❌ | ❌ | ✅ | ✅ |
| Ver dashboard | ❌ | ❌ | ✅ | ✅ |
| Solicitar saque | ❌ | ❌ | ✅ | ✅ |
| Moderar conteúdo | ❌ | ❌ | ❌ | ✅ |

### 8.10 Guards NestJS

```typescript
// apps/api/src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.userType);
  }
}

// Decorator
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Uso
@Post('packs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('creator', 'admin')
async createPack(@Body() dto: CreatePackDto) {
  // ...
}
```

---

## 9. Tokenização de Links de Packs

### 9.1 Objetivo

Proteger arquivos de acesso não autorizado, garantindo que apenas compradores acessem o conteúdo.

### 9.2 Arquitetura

```
[Consumidor] → [NestJS API] → [Gera URL Assinada] → [Cloudflare R2]
                    ↓
              Valida: compra + usuário + expiração
```

### 9.3 Estrutura da URL Assinada (R2)

```
https://{account}.r2.cloudflarestorage.com/{bucket}/{packId}/{fileId}?
  X-Amz-Algorithm=AWS4-HMAC-SHA256&
  X-Amz-Credential=...&
  X-Amz-Date=...&
  X-Amz-Expires=3600&
  X-Amz-Signature=...
```

### 9.4 Serviço de Storage (NestJS)

```typescript
// apps/api/src/modules/storage/storage.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private client: S3Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.client = new S3Client({
      region: 'auto',
      endpoint: this.config.get('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.config.get('R2_ACCESS_KEY'),
        secretAccessKey: this.config.get('R2_SECRET_KEY'),
      },
    });
    this.bucket = this.config.get('R2_BUCKET');
  }

  async getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 3600,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await this.client.send(command);
  }
}
```

### 9.5 Fluxo de Acesso

```
1. Consumidor acessa página "Meus Packs"
2. Clica em "Ver Pack"
3. Frontend solicita URLs ao backend via Axios
4. Backend valida:
   a. Usuário autenticado (JWT)
   b. Compra existente e paga (Prisma query)
   c. Limite de downloads não excedido
5. Backend gera URLs assinadas R2 (expiração: 1h)
6. Frontend exibe arquivos com URLs temporárias
7. Ao expirar, usuário solicita novas URLs
```

### 9.6 Controller de Acesso

```typescript
// apps/api/src/modules/packs/packs.controller.ts
@Get(':id/files')
@UseGuards(JwtAuthGuard)
async getPackFiles(
  @Param('id') packId: string,
  @CurrentUser() user: User,
) {
  // Verifica se usuário comprou o pack
  const purchase = await this.purchaseService.findByUserAndPack(user.id, packId);
  
  if (!purchase || purchase.status !== 'paid') {
    throw new ForbiddenException('Você não tem acesso a este pack');
  }
  
  // Verifica limite de downloads
  const todayDownloads = await this.downloadService.countToday(user.id, packId);
  if (todayDownloads >= 100) {
    throw new TooManyRequestsException('Limite diário de downloads atingido');
  }
  
  // Gera URLs assinadas
  const pack = await this.packService.findById(packId);
  const filesWithUrls = await Promise.all(
    pack.files.map(async (file) => ({
      id: file.id,
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.size,
      url: await this.storageService.getSignedDownloadUrl(file.storageKey),
    })),
  );
  
  return { files: filesWithUrls };
}
```

### 9.7 Proteções Adicionais

| Proteção | Implementação |
|----------|---------------|
| Hotlink prevention | Cloudflare WAF Rules |
| Rate limiting | NestJS Throttler (10 downloads/arquivo/dia) |
| Fingerprinting | Log de user-agent + IP para auditoria |
| CORS | Origin restrito ao domínio da aplicação |

---

## 10. Gestão de Packs (CRUD + Ativação)

### 10.1 Estados do Pack

```
[draft] → [published] ⇄ [unpublished] → [deleted]
```

| Estado | Descrição | Visível na Vitrine | Acessível por Compradores |
|--------|-----------|-------------------|--------------------------|
| `draft` | Rascunho, incompleto | Não | Não |
| `published` | Publicado, à venda | Sim | Sim |
| `unpublished` | Ocultado pelo criador | Não | Sim (se comprou) |
| `deleted` | Excluído (soft delete) | Não | Sim (se comprou) |

### 10.2 Modelo de Dados

```prisma
model Pack {
  id          String   @id @default(cuid())
  creatorId   String
  creator     User     @relation(fields: [creatorId], references: [id])
  
  title       String   @db.VarChar(100)
  description String?  @db.VarChar(1000)
  price       Int      // Centavos (ex: 1990 = R$ 19,90)
  status      PackStatus @default(draft)
  
  previews    PackPreview[]
  files       PackFile[]
  purchases   Purchase[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  publishedAt DateTime?
  deletedAt   DateTime?
  
  @@index([creatorId, status])
  @@index([status, publishedAt])
}

enum PackStatus {
  draft
  published
  unpublished
  deleted
}

model PackPreview {
  id       String @id @default(cuid())
  packId   String
  pack     Pack   @relation(fields: [packId], references: [id])
  url      String
  order    Int
}

model PackFile {
  id        String @id @default(cuid())
  packId    String
  pack      Pack   @relation(fields: [packId], references: [id])
  filename  String
  mimeType  String
  size      Int    // Bytes
  storageKey String // Chave no S3/R2
  order     Int
}
```

### 10.3 Endpoints da API

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/api/packs` | Criar pack (rascunho) | creator |
| GET | `/api/packs` | Listar packs do criador | creator |
| GET | `/api/packs/:id` | Detalhes do pack | creator (próprio) |
| PATCH | `/api/packs/:id` | Atualizar pack | creator (próprio) |
| DELETE | `/api/packs/:id` | Excluir pack | creator (próprio) |
| POST | `/api/packs/:id/publish` | Publicar pack | creator (próprio) |
| POST | `/api/packs/:id/unpublish` | Despublicar pack | creator (próprio) |
| POST | `/api/packs/:id/files` | Upload de arquivos | creator (próprio) |
| DELETE | `/api/packs/:id/files/:fileId` | Remover arquivo | creator (próprio) |

### 10.4 Schemas Zod para Packs

```typescript
// packages/shared/src/schemas/pack.schema.ts
import { z } from 'zod';

export const createPackSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional(),
  price: z
    .number()
    .min(990, 'Preço mínimo é R$ 9,90')
    .max(50000, 'Preço máximo é R$ 500,00'),
});

export const updatePackSchema = createPackSchema.partial();

export const publishPackSchema = z.object({
  packId: z.string().cuid(),
});

export type CreatePackInput = z.infer<typeof createPackSchema>;
export type UpdatePackInput = z.infer<typeof updatePackSchema>;
```

### 10.5 Validações de Publicação

```typescript
// apps/api/src/modules/packs/packs.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class PacksService {
  async validateForPublish(packId: string): Promise<void> {
    const pack = await this.prisma.pack.findUnique({
      where: { id: packId },
      include: { previews: true, files: true },
    });

    const errors: string[] = [];

    if (!pack.title || pack.title.length < 3) {
      errors.push('Título deve ter no mínimo 3 caracteres');
    }

    if (pack.price < 990 || pack.price > 50000) {
      errors.push('Preço deve estar entre R$ 9,90 e R$ 500,00');
    }

    if (pack.previews.length === 0) {
      errors.push('Pack deve ter ao menos 1 imagem de preview');
    }

    if (pack.files.length < 3) {
      errors.push('Pack deve ter no mínimo 3 arquivos');
    }

    if (errors.length > 0) {
      throw new BadRequestException({ errors });
    }
  }

  async publish(packId: string, userId: string): Promise<Pack> {
    await this.validateForPublish(packId);

    return this.prisma.pack.update({
      where: { id: packId, creatorId: userId },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    });
  }
}
```

### 10.6 Upload de Arquivos (R2)

```typescript
// apps/api/src/modules/packs/packs.controller.ts
@Post(':id/upload-url')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('creator')
async getUploadUrl(
  @Param('id') packId: string,
  @Body() body: { filename: string; contentType: string; type: 'preview' | 'file' },
  @CurrentUser() user: User,
) {
  // Valida propriedade do pack
  const pack = await this.packService.findByIdAndCreator(packId, user.id);
  if (!pack) throw new ForbiddenException();

  // Valida tipo de arquivo
  const allowedTypes = {
    preview: ['image/jpeg', 'image/png', 'image/webp'],
    file: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'],
  };

  if (!allowedTypes[body.type].includes(body.contentType)) {
    throw new BadRequestException('Tipo de arquivo não permitido');
  }

  // Gera key e URL de upload
  const fileId = cuid();
  const key = `packs/${packId}/${body.type}s/${fileId}`;
  const uploadUrl = await this.storageService.getSignedUploadUrl(key, body.contentType);

  return { uploadUrl, key, fileId };
}

@Post(':id/files')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('creator')
async confirmUpload(
  @Param('id') packId: string,
  @Body() body: { fileId: string; key: string; filename: string; mimeType: string; size: number; type: 'preview' | 'file' },
  @CurrentUser() user: User,
) {
  const pack = await this.packService.findByIdAndCreator(packId, user.id);
  if (!pack) throw new ForbiddenException();

  if (body.type === 'preview') {
    // Limite de 3 previews
    const previewCount = await this.prisma.packPreview.count({ where: { packId } });
    if (previewCount >= 3) throw new BadRequestException('Máximo de 3 previews');

    return this.prisma.packPreview.create({
      data: {
        id: body.fileId,
        packId,
        url: `${this.config.get('R2_PUBLIC_URL')}/${body.key}`,
        order: previewCount,
      },
    });
  }

  // Arquivo do pack
  const fileCount = await this.prisma.packFile.count({ where: { packId } });
  if (fileCount >= 50) throw new BadRequestException('Máximo de 50 arquivos');

  return this.prisma.packFile.create({
    data: {
      id: body.fileId,
      packId,
      filename: body.filename,
      mimeType: body.mimeType,
      size: body.size,
      storageKey: body.key,
      order: fileCount,
    },
  });
}
```

### 10.7 Zustand Store para Upload

```typescript
// apps/web/src/stores/upload.store.ts
import { create } from 'zustand';
import { api } from '@/services/api';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface UploadState {
  files: UploadFile[];
  addFiles: (files: File[], packId: string, type: 'preview' | 'file') => void;
  removeFile: (id: string) => void;
  clearCompleted: () => void;
}

export const useUploadStore = create<UploadState>((set, get) => ({
  files: [],

  addFiles: async (files, packId, type) => {
    for (const file of files) {
      const id = crypto.randomUUID();
      
      set((state) => ({
        files: [...state.files, { id, file, progress: 0, status: 'pending' }],
      }));

      try {
        // 1. Obter URL de upload
        const { data } = await api.post(`/packs/${packId}/upload-url`, {
          filename: file.name,
          contentType: file.type,
          type,
        });

        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, status: 'uploading' } : f
          ),
        }));

        // 2. Upload direto para R2
        await axios.put(data.uploadUrl, file, {
          headers: { 'Content-Type': file.type },
          onUploadProgress: (e) => {
            const progress = Math.round((e.loaded * 100) / e.total!);
            set((state) => ({
              files: state.files.map((f) =>
                f.id === id ? { ...f, progress } : f
              ),
            }));
          },
        });

        // 3. Confirmar upload
        await api.post(`/packs/${packId}/files`, {
          fileId: data.fileId,
          key: data.key,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          type,
        });

        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, status: 'completed', progress: 100 } : f
          ),
        }));
      } catch (error) {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, status: 'error', error: 'Falha no upload' } : f
          ),
        }));
      }
    }
  },

  removeFile: (id) =>
    set((state) => ({ files: state.files.filter((f) => f.id !== id) })),

  clearCompleted: () =>
    set((state) => ({ files: state.files.filter((f) => f.status !== 'completed') })),
}));
```

---

## 11. Pagamentos (Stripe Checkout + Connect)

### 11.1 Arquitetura de Pagamentos

```
[Consumidor] → [Pack do Pezin] → [Stripe Checkout] → [Pagamento]
                                        ↓
                                  [Webhook]
                                        ↓
                              [Libera Acesso + Split]
                                        ↓
                    [80% → Stripe Connect do Criador]
                    [20% → Conta da Plataforma]
```

### 11.2 Stripe Connect (Onboarding do Criador)

```typescript
// Criar conta Connect para o criador
const account = await stripe.accounts.create({
  type: 'express',
  country: 'BR',
  email: creator.email,
  capabilities: {
    transfers: { requested: true },
  },
  business_type: 'individual',
});

// Gerar link de onboarding
const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: `${BASE_URL}/dashboard/stripe/refresh`,
  return_url: `${BASE_URL}/dashboard/stripe/complete`,
  type: 'account_onboarding',
});
```

### 11.3 Checkout Session

```typescript
async function createCheckoutSession(packId: string, userId: string) {
  const pack = await getPackById(packId);
  const creator = await getCreatorById(pack.creatorId);
  
  const platformFee = Math.round(pack.price * 0.20); // 20%
  
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'pix'],
    line_items: [{
      price_data: {
        currency: 'brl',
        product_data: {
          name: pack.title,
          description: `Pack de ${creator.displayName}`,
          images: [pack.previews[0]?.url],
        },
        unit_amount: pack.price,
      },
      quantity: 1,
    }],
    payment_intent_data: {
      application_fee_amount: platformFee,
      transfer_data: {
        destination: creator.stripeAccountId,
      },
    },
    metadata: {
      packId: pack.id,
      userId: userId,
      creatorId: creator.id,
    },
    success_url: `${BASE_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/pack/${pack.id}`,
  });
  
  return session;
}
```

### 11.4 Webhook Handler

```typescript
// POST /api/webhooks/stripe
async function handleStripeWebhook(req: Request) {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      await handlePurchaseComplete(session);
      break;
    }
    
    case 'charge.refunded': {
      const charge = event.data.object;
      await handleRefund(charge);
      break;
    }
  }
  
  return { received: true };
}

async function handlePurchaseComplete(session: Stripe.Checkout.Session) {
  const { packId, userId, creatorId } = session.metadata;
  
  // Criar registro de compra
  const purchase = await prisma.purchase.create({
    data: {
      userId,
      packId,
      creatorId,
      amount: session.amount_total,
      platformFee: Math.round(session.amount_total * 0.20),
      creatorEarnings: Math.round(session.amount_total * 0.80),
      stripePaymentIntentId: session.payment_intent,
      status: 'paid',
      availableAt: addDays(new Date(), 14), // 14 dias para saldo disponível
    },
  });
  
  // Enviar email de confirmação ao consumidor
  await sendPurchaseConfirmationEmail(userId, packId);
  
  // Notificar criador
  await notifyCreatorNewSale(creatorId, packId, purchase.creatorEarnings);
}
```

### 11.5 Modelo de Dados Financeiros

```prisma
model Purchase {
  id                    String   @id @default(cuid())
  userId                String
  user                  User     @relation(fields: [userId], references: [id])
  packId                String
  pack                  Pack     @relation(fields: [packId], references: [id])
  creatorId             String
  
  amount                Int      // Valor total em centavos
  platformFee           Int      // 20% para plataforma
  creatorEarnings       Int      // 80% para criador
  
  stripePaymentIntentId String   @unique
  status                PurchaseStatus
  
  availableAt           DateTime // Data que saldo fica disponível
  createdAt             DateTime @default(now())
  refundedAt            DateTime?
  
  @@index([userId])
  @@index([creatorId, status])
  @@index([packId])
}

enum PurchaseStatus {
  pending
  paid
  refunded
}

model Withdrawal {
  id              String   @id @default(cuid())
  creatorId       String
  creator         User     @relation(fields: [creatorId], references: [id])
  
  amount          Int
  stripePayoutId  String?
  status          WithdrawalStatus
  
  requestedAt     DateTime @default(now())
  processedAt     DateTime?
  failedAt        DateTime?
  failureReason   String?
  
  @@index([creatorId, status])
}

enum WithdrawalStatus {
  pending
  processing
  completed
  failed
}
```

### 11.6 Cálculo de Saldo

```typescript
async function getCreatorBalance(creatorId: string) {
  const now = new Date();
  
  // Saldo pendente (compras nos últimos 14 dias)
  const pendingBalance = await prisma.purchase.aggregate({
    where: {
      creatorId,
      status: 'paid',
      availableAt: { gt: now },
    },
    _sum: { creatorEarnings: true },
  });
  
  // Saldo disponível (compras há mais de 14 dias)
  const availableBalance = await prisma.purchase.aggregate({
    where: {
      creatorId,
      status: 'paid',
      availableAt: { lte: now },
    },
    _sum: { creatorEarnings: true },
  });
  
  // Subtrair saques já realizados
  const withdrawals = await prisma.withdrawal.aggregate({
    where: {
      creatorId,
      status: { in: ['pending', 'processing', 'completed'] },
    },
    _sum: { amount: true },
  });
  
  return {
    pending: pendingBalance._sum.creatorEarnings || 0,
    available: (availableBalance._sum.creatorEarnings || 0) - (withdrawals._sum.amount || 0),
  };
}
```

---

## 12. Dashboard do Criador

### 12.1 Estrutura da Tela

```
┌─────────────────────────────────────────────────────────────┐
│  Pack do Pezin    [Perfil ▼]                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ Vendas  │  │ Receita │  │Disponív.│  │Pendente │       │
│  │   42    │  │R$1.890  │  │ R$1.200 │  │ R$ 690  │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                            │
│  [Solicitar Saque]                                         │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  📈 Vendas - Últimos 30 dias                         │ │
│  │  [gráfico de barras simples]                         │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Últimas Vendas                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Pack              │ Valor    │ Líquido  │ Data       │ │
│  │ Pack Pezinhos #1  │ R$ 29,90 │ R$ 23,92 │ 28/12/2024│ │
│  │ Pack Especial     │ R$ 49,90 │ R$ 39,92 │ 27/12/2024│ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Meus Packs                             [+ Novo Pack]      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ [img] Pack Pezinhos #1   │ R$ 29,90 │ 15 vendas │ ✅ │ │
│  │ [img] Pack Especial      │ R$ 49,90 │  8 vendas │ ✅ │ │
│  │ [img] Pack Rascunho      │ R$ 19,90 │  - vendas │ 📝 │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 12.2 Endpoints do Dashboard

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboard/stats` | Estatísticas gerais |
| GET | `/api/dashboard/sales` | Lista de vendas |
| GET | `/api/dashboard/balance` | Saldo detalhado |
| GET | `/api/dashboard/chart` | Dados para gráfico |

### 12.3 Resposta de Stats

```typescript
interface DashboardStats {
  totalSales: number;           // Quantidade de vendas
  totalRevenue: number;         // Receita bruta (centavos)
  totalEarnings: number;        // Receita líquida (centavos)
  availableBalance: number;     // Disponível para saque
  pendingBalance: number;       // Aguardando liberação
  packsPublished: number;       // Packs publicados
  packsDraft: number;           // Packs em rascunho
}
```

---

## 13. Interface do Consumidor

### 13.1 Página Inicial (Vitrine)

```
┌─────────────────────────────────────────────────────────────┐
│  Pack do Pezin                    [Buscar...]    [Login]   │
├─────────────────────────────────────────────────────────────┤
│                                                            │
│  Filtros: [Preço ▼] [Ordenar ▼]                           │
│                                                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ [prev]  │  │ [prev]  │  │ [prev]  │  │ [prev]  │       │
│  │ Nome    │  │ Nome    │  │ Nome    │  │ Nome    │       │
│  │ R$29,90 │  │ R$19,90 │  │ R$49,90 │  │ R$39,90 │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │  ...    │  │  ...    │  │  ...    │  │  ...    │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                            │
│                    [Carregar mais]                         │
└─────────────────────────────────────────────────────────────┘
```

### 13.2 Página do Pack

```
┌─────────────────────────────────────────────────────────────┐
│  Pack do Pezin                              [Meus Packs]   │
├─────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────┐             │
│  │ [preview 1] [preview 2] [preview 3]      │             │
│  │ (carrossel de previews)                  │             │
│  └──────────────────────────────────────────┘             │
│                                                            │
│  Pack Pezinhos Delicados #1                               │
│  por @mariazinha                                           │
│                                                            │
│  Descrição do pack com detalhes do que contém.            │
│  12 fotos + 3 vídeos exclusivos.                          │
│                                                            │
│  ┌────────────────────────────────────┐                   │
│  │  R$ 29,90                          │                   │
│  │  [  Comprar Agora  ]               │                   │
│  └────────────────────────────────────┘                   │
│                                                            │
│  ⚠️ Você confirma ter 18 anos ou mais.                    │
│                                                            │
└─────────────────────────────────────────────────────────────┘
```

### 13.3 Página "Meus Packs" (Compras)

```
┌─────────────────────────────────────────────────────────────┐
│  Pack do Pezin                              [Sair]         │
├─────────────────────────────────────────────────────────────┤
│                                                            │
│  Meus Packs Comprados                                      │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ [img] Pack Pezinhos #1     │ @mariazinha │ [Acessar] │ │
│  │       Comprado em 28/12/24 │             │           │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ [img] Pack Especial        │ @julinha    │ [Acessar] │ │
│  │       Comprado em 25/12/24 │             │           │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└─────────────────────────────────────────────────────────────┘
```

### 13.4 Página de Visualização do Pack Comprado

```
┌─────────────────────────────────────────────────────────────┐
│  Pack do Pezin          Pack Pezinhos #1        [Voltar]  │
├─────────────────────────────────────────────────────────────┤
│                                                            │
│  [Baixar Tudo (ZIP)]                                       │
│                                                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ [thumb] │  │ [thumb] │  │ [thumb] │  │ [thumb] │       │
│  │   📥    │  │   📥    │  │   📥    │  │   📥    │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                    │
│  │ [video] │  │ [video] │  │ [video] │                    │
│  │   ▶️    │  │   ▶️    │  │   ▶️    │                    │
│  └─────────┘  └─────────┘  └─────────┘                    │
│                                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 14. Segurança, LGPD e Compliance

### 14.1 Medidas de Segurança

| Camada | Medida | Implementação |
|--------|--------|---------------|
| **Transporte** | TLS 1.3 | Certificado gerenciado (Vercel/CloudFlare) |
| **Autenticação** | Senhas hasheadas | bcrypt, cost factor 12 |
| **Sessão** | Cookies seguros | HTTP-only, Secure, SameSite=Strict |
| **API** | Rate limiting | 100 req/min por IP (geral), 10 req/min (auth) |
| **Upload** | Validação de tipo | Magic bytes + extensão |
| **Storage** | Criptografia em repouso | AES-256 (S3/R2 nativo) |
| **Acesso** | URLs assinadas | Expiração 1h, HMAC-SHA256 |
| **Logs** | Auditoria | Registro de ações sensíveis |

### 14.2 Prevenção de Ataques

| Ataque | Proteção |
|--------|----------|
| SQL Injection | ORM (Prisma) com queries parametrizadas |
| XSS | CSP headers, sanitização de input, React auto-escape |
| CSRF | Token CSRF em forms, SameSite cookies |
| Brute Force | Rate limiting + CAPTCHA após 5 tentativas |
| Directory Traversal | Validação de paths no upload |

### 14.3 Headers de Segurança

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' https://cdn.packdopezin.com; script-src 'self' 'unsafe-inline' https://js.stripe.com; frame-src https://js.stripe.com;",
  },
];
```

### 14.4 LGPD - Conformidade

| Requisito | Implementação |
|-----------|---------------|
| **Consentimento** | Checkbox explícito nos Termos de Uso |
| **Finalidade** | Dados usados apenas para operação da plataforma |
| **Minimização** | Coleta apenas de dados essenciais |
| **Acesso** | Endpoint `/api/user/data` para exportação |
| **Exclusão** | Endpoint `/api/user/delete` para remoção |
| **Portabilidade** | Exportação em JSON |
| **Notificação** | Email em caso de incidente de segurança |

### 14.5 Dados Pessoais Armazenados

| Dado | Finalidade | Retenção |
|------|------------|----------|
| Email | Autenticação, comunicação | Conta ativa + 5 anos |
| Data de nascimento | Verificação de idade | Conta ativa |
| Foto de perfil | Exibição pública (criador) | Conta ativa |
| Histórico de compras | Acesso ao conteúdo, financeiro | 5 anos (fiscal) |
| IP de acesso | Segurança, anti-fraude | 6 meses |
| Logs de download | Auditoria, anti-pirataria | 1 ano |

### 14.6 Termos de Uso (Pontos Críticos)

- Apenas maiores de 18 anos
- Proibido upload de conteúdo com menores
- Proibido redistribuição de conteúdo comprado
- Criador declara ser titular dos direitos do conteúdo
- Plataforma não se responsabiliza por conteúdo dos criadores
- Reserva de direito de remover conteúdo que viole termos

---

## 15. Métricas e Eventos Importantes

### 15.1 Eventos para Analytics

| Evento | Propriedades | Trigger |
|--------|--------------|---------|
| `page_view` | page, referrer | Cada navegação |
| `sign_up` | method, user_type | Cadastro concluído |
| `login` | method | Login bem-sucedido |
| `pack_view` | pack_id, creator_id, price | Visualização de pack |
| `checkout_start` | pack_id, price | Clique em "Comprar" |
| `purchase_complete` | pack_id, price, payment_method | Pagamento confirmado |
| `pack_access` | pack_id, purchase_id | Acesso ao pack comprado |
| `file_download` | pack_id, file_id | Download de arquivo |
| `pack_created` | pack_id, status | Criação de pack |
| `pack_published` | pack_id, price | Publicação de pack |
| `withdrawal_requested` | amount | Solicitação de saque |

### 15.2 Métricas de Negócio

| Métrica | Cálculo | Frequência |
|---------|---------|------------|
| GMV | Soma de `amount` em purchases | Diário |
| Receita Líquida | Soma de `platformFee` | Diário |
| Taxa de Conversão | purchases / pack_views | Semanal |
| Ticket Médio | GMV / total_purchases | Semanal |
| Criadores Ativos | Criadores com ≥1 pack published | Semanal |
| Compradores Ativos | Usuários com ≥1 compra (30 dias) | Semanal |
| Churn de Criadores | Criadores que despublicaram tudo | Mensal |

### 15.3 Alertas Operacionais

| Alerta | Condição | Ação |
|--------|----------|------|
| Alta taxa de falha em pagamentos | > 5% em 1h | Investigar Stripe |
| Pico de tráfego | > 3x média | Verificar infra |
| Tentativas de login suspeitas | > 10 falhas/IP em 5min | Bloquear IP |
| Webhook Stripe com erro | > 3 falhas consecutivas | Notificar time |

---

## 16. Escalabilidade e Manutenção

### 16.1 Arquitetura para Escala

```
                    ┌─────────────┐
                    │  CloudFlare │
                    │ (CDN + WAF) │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Coolify   │
                    │  (Docker)   │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │  Next.js    │ │   NestJS    │ │  PostgreSQL │
    │ (Frontend)  │ │  (Backend)  │ │             │
    └─────────────┘ └──────┬──────┘ └─────────────┘
                           │
                    ┌──────▼──────┐
                    │ Cloudflare  │
                    │     R2      │
                    └─────────────┘
```

### 16.2 Configuração Coolify

```yaml
# docker-compose.yml (exemplo para Coolify)
version: '3.8'

services:
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    environment:
      - NEXT_PUBLIC_API_URL=${API_URL}
    ports:
      - "3000:3000"
    depends_on:
      - api

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - R2_ACCESS_KEY=${R2_ACCESS_KEY}
      - R2_SECRET_KEY=${R2_SECRET_KEY}
      - R2_BUCKET=${R2_BUCKET}
      - R2_ENDPOINT=${R2_ENDPOINT}
    ports:
      - "3001:3001"
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### 16.3 Estratégias de Cache

| Recurso | Estratégia | TTL |
|---------|------------|-----|
| Lista de packs (vitrine) | Cache-Control + SWR | 60s |
| Dados do pack (público) | NestJS CacheModule | 5min |
| Perfil do criador | NestJS CacheModule | 5min |
| URLs assinadas R2 | Sem cache | - |
| Assets estáticos | Cloudflare CDN | 1 ano |

### 16.4 Pontos de Otimização

| Área | Otimização |
|------|------------|
| **Database** | Índices em queries frequentes, connection pooling (Prisma) |
| **Imagens** | WebP, lazy loading, next/image |
| **Frontend** | Code splitting, prefetch de rotas, Zustand para estado |
| **API** | Paginação, DTOs validados com Zod, compressão gzip |
| **Upload** | Multipart direto para R2 (presigned URL) |

### 16.5 Rotinas de Manutenção

| Rotina | Frequência | Descrição |
|--------|------------|-----------|
| Backup do banco | Diário | pg_dump automatizado via cron |
| Limpeza de sessões expiradas | Diário | Job NestJS (CRON decorator) |
| Liberação de saldo pendente | A cada hora | Job NestJS |
| Verificação de webhooks pendentes | A cada 15min | Retry de webhooks com falha |
| Rotação de logs | Semanal | Logrotate no servidor |
| Prune de imagens Docker | Semanal | docker system prune |

### 16.6 Monitoramento

| Ferramenta | Uso |
|------------|-----|
| Coolify Dashboard | Deploy status, logs |
| Sentry | Erros e exceções (Next.js + NestJS) |
| Stripe Dashboard | Pagamentos e disputas |
| Prometheus + Grafana | Métricas de infraestrutura |
| UptimeRobot | Disponibilidade |
| Cloudflare Analytics | Tráfego e performance CDN |

---

## 17. Critérios de Aceite

### 17.1 Funcionalidades Core

| ID | Critério | Verificação |
|----|----------|-------------|
| CA-01 | Usuário consegue se cadastrar informando email, senha e data de nascimento | Teste manual + E2E |
| CA-02 | Sistema rejeita cadastro de menores de 18 anos | Teste unitário |
| CA-03 | Email de verificação é enviado e funciona | Teste manual |
| CA-04 | Criador consegue conectar conta Stripe | Teste manual |
| CA-05 | Criador consegue criar, editar e publicar pack | Teste E2E |
| CA-06 | Pack aparece na vitrine após publicação | Teste E2E |
| CA-07 | Consumidor consegue comprar pack via Stripe | Teste manual + Stripe Test Mode |
| CA-08 | Webhook processa pagamento e libera acesso | Teste integração |
| CA-09 | Consumidor acessa arquivos do pack após compra | Teste E2E |
| CA-10 | URLs de arquivos expiram após 1 hora | Teste unitário |
| CA-11 | Dashboard exibe estatísticas corretas | Teste integração |
| CA-12 | Criador consegue solicitar saque do saldo disponível | Teste manual |
| CA-13 | Sistema bloqueia saque abaixo do mínimo | Teste unitário |

### 17.2 Segurança

| ID | Critério | Verificação |
|----|----------|-------------|
| CA-14 | Usuário não autenticado não acessa rotas protegidas | Teste E2E |
| CA-15 | Consumidor não acessa pack que não comprou | Teste E2E |
| CA-16 | Criador não acessa dashboard de outro criador | Teste E2E |
| CA-17 | Rate limiting funciona em rotas de autenticação | Teste de carga |
| CA-18 | Headers de segurança estão presentes | Security scan |
| CA-19 | Upload rejeita arquivos com tipo inválido | Teste unitário |

### 17.3 Performance

| ID | Critério | Verificação |
|----|----------|-------------|
| CA-20 | Vitrine carrega em < 2s (P95) | Lighthouse |
| CA-21 | Upload de 100MB completa em < 30s | Teste manual |
| CA-22 | Sistema suporta 100 uploads simultâneos | Teste de carga |

### 17.4 Compliance

| ID | Critério | Verificação |
|----|----------|-------------|
| CA-23 | Usuário consegue exportar seus dados | Teste manual |
| CA-24 | Usuário consegue excluir sua conta | Teste manual |
| CA-25 | Termos de Uso exibidos e aceitos no cadastro | Teste E2E |

---

## Anexo A: Configuração de Testes (Vitest)

### A.1 Configuração Base

```typescript
// apps/api/vitest.config.ts
import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    environment: 'node',
    include: ['**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist', '**/*.module.ts'],
    },
  },
  plugins: [swc.vite()],
});
```

### A.2 Exemplo de Teste Unitário

```typescript
// apps/api/src/modules/packs/packs.service.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PacksService } from './packs.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('PacksService', () => {
  let service: PacksService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      pack: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    } as any;

    service = new PacksService(prisma);
  });

  describe('validateForPublish', () => {
    it('deve rejeitar pack sem título', async () => {
      vi.mocked(prisma.pack.findUnique).mockResolvedValue({
        id: '1',
        title: '',
        price: 1990,
        previews: [{ id: '1' }],
        files: [{ id: '1' }, { id: '2' }, { id: '3' }],
      } as any);

      await expect(service.validateForPublish('1')).rejects.toThrow(
        'Título deve ter no mínimo 3 caracteres'
      );
    });

    it('deve rejeitar pack com menos de 3 arquivos', async () => {
      vi.mocked(prisma.pack.findUnique).mockResolvedValue({
        id: '1',
        title: 'Pack Test',
        price: 1990,
        previews: [{ id: '1' }],
        files: [{ id: '1' }],
      } as any);

      await expect(service.validateForPublish('1')).rejects.toThrow(
        'Pack deve ter no mínimo 3 arquivos'
      );
    });

    it('deve aceitar pack válido', async () => {
      vi.mocked(prisma.pack.findUnique).mockResolvedValue({
        id: '1',
        title: 'Pack Válido',
        price: 2990,
        previews: [{ id: '1' }],
        files: [{ id: '1' }, { id: '2' }, { id: '3' }],
      } as any);

      await expect(service.validateForPublish('1')).resolves.not.toThrow();
    });
  });
});
```

### A.3 Exemplo de Teste E2E

```typescript
// apps/api/test/packs.e2e-spec.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';

describe('Packs (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();

    // Login para obter token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'creator@test.com', password: 'Test1234' });

    accessToken = response.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /packs', () => {
    it('deve criar um pack em rascunho', async () => {
      const response = await request(app.getHttpServer())
        .post('/packs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Meu Pack de Teste',
          description: 'Descrição do pack',
          price: 2990,
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('draft');
      expect(response.body.title).toBe('Meu Pack de Teste');
    });

    it('deve rejeitar sem autenticação', async () => {
      const response = await request(app.getHttpServer())
        .post('/packs')
        .send({ title: 'Pack', price: 1990 });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /packs/:id/publish', () => {
    it('deve rejeitar pack incompleto', async () => {
      // Criar pack sem arquivos
      const pack = await prisma.pack.create({
        data: {
          title: 'Pack Incompleto',
          price: 1990,
          creatorId: 'creator-id',
          status: 'draft',
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/packs/${pack.id}/publish`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('Pack deve ter no mínimo 3 arquivos');
    });
  });
});
```

### A.4 Scripts de Teste

```json
// apps/api/package.json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:cov": "vitest --coverage",
    "test:e2e": "vitest --config ./vitest.e2e.config.ts"
  }
}
```

---

## Anexo B: Glossário

| Termo | Definição |
|-------|-----------|
| **Pack** | Conjunto de arquivos (fotos/vídeos) vendido como unidade |
| **Preview** | Imagem de amostra (sem nudez explícita) do pack |
| **Criador** | Usuário que produz e vende conteúdo |
| **Consumidor** | Usuário que compra packs |
| **GMV** | Gross Merchandise Value - valor bruto de vendas |
| **Saldo Pendente** | Valor aguardando período anti-fraude (14 dias) |
| **Saldo Disponível** | Valor liberado para saque |
| **R2** | Cloudflare R2 - storage de objetos compatível com S3 |

---

## Anexo C: Checklist de Lançamento

- [ ] Coolify configurado com Docker Compose
- [ ] Domínio e SSL configurados (Cloudflare)
- [ ] PostgreSQL em produção com backups
- [ ] Cloudflare R2 bucket criado e configurado
- [ ] Variáveis de ambiente configuradas no Coolify
- [ ] Stripe em modo produção
- [ ] Webhooks Stripe de produção configurados
- [ ] NestJS em modo produção (NODE_ENV=production)
- [ ] Next.js build otimizado
- [ ] Monitoramento Sentry configurado
- [ ] Rate limiting ativo
- [ ] Termos de Uso e Política de Privacidade publicados
- [ ] Testes Vitest passando
- [ ] Teste de compra real executado
- [ ] Documentação técnica entregue ao time

---

## Anexo D: Variáveis de Ambiente

```bash
# apps/api/.env.example
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/packdopezin

# JWT
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=sua-chave-refresh-aqui
JWT_REFRESH_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_CONNECT_CLIENT_ID=ca_xxx

# Cloudflare R2
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY=xxx
R2_SECRET_KEY=xxx
R2_BUCKET=packdopezin
R2_PUBLIC_URL=https://cdn.packdopezin.com

# Email (opcional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx

# apps/web/.env.example
NEXT_PUBLIC_API_URL=https://api.packdopezin.com
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_xxx
NEXT_PUBLIC_SENTRY_DSN=xxx
```

---

**Documento preparado para entrega às equipes de desenvolvimento, design e QA.**

*Fim do PRD*
