# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pack do Pezin** is an adult content monetization platform for creators to sell packs (collections of images/videos). The platform connects creators with consumers through a secure marketplace with Stripe payment processing.

### Core Technology Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript (strict mode)
- **Backend**: NestJS, TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: Cloudflare R2 (S3-compatible)
- **Payments**: Stripe (Checkout + Connect)
- **State Management**: Zustand
- **Validation**: Zod (shared schemas between frontend/backend)
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui (base), React Bits (priority for hero sections), MagicUI (interactive components)
- **Testing**: Vitest
- **Deployment**: Coolify (self-hosted Docker)

### Repository Structure

This is a pnpm workspace monorepo:

```
pack-do-pezin/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
└── packages/
    └── shared/       # Shared Zod schemas and TypeScript types
```

## Development Commands

Since the project is not yet initialized, these are the planned commands based on the PRD:

### Backend (NestJS - `apps/api/`)
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start:prod` - Start production server
- `pnpm test` - Run Vitest tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:cov` - Generate test coverage
- `pnpm test:e2e` - Run E2E tests
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:studio` - Open Prisma Studio

### Frontend (Next.js - `apps/web/`)
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run Biome linter
- `pnpm format` - Format code with Biome

### Workspace Root
- `pnpm install` - Install all dependencies
- `pnpm build` - Build all packages
- `pnpm test` - Run all tests

## Architecture & Key Patterns

### Authentication System

**JWT-based authentication** with access tokens (15min) and refresh tokens (7 days):
- Access token stored in-memory (Zustand)
- Refresh token in HTTP-only cookie (secure, SameSite=strict)
- Automatic token refresh via Axios interceptor
- Password requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number, bcrypt hash with cost factor 12

### State Management (Zustand)

Critical stores to implement:
- `auth.store.ts` - User authentication state, login/logout/refresh
- `upload.store.ts` - Multi-file upload with progress tracking
- Additional stores as needed for specific features

### Validation Strategy (Zod)

**All schemas live in `packages/shared/src/schemas/`** to ensure type safety across frontend and backend:
- Frontend validates on form submission
- Backend validates via custom `ZodValidationPipe` in NestJS
- Never duplicate schemas - always import from shared package

### File Upload Architecture

**Two-phase upload pattern**:
1. Frontend requests signed URL from backend (`POST /packs/:id/upload-url`)
2. Frontend uploads directly to Cloudflare R2 using presigned URL (bypasses backend)
3. Frontend confirms upload completion (`POST /packs/:id/files`)
4. Backend records file metadata in database

Benefits: Reduces server load, faster uploads, scalable

### Signed URL Security

**All pack file access uses time-limited signed URLs**:
- Access validation: user must own the purchase + payment confirmed
- URLs expire after 1 hour (regenerate on demand)
- Download rate limiting: 10 downloads/file/day per user
- Cloudflare WAF for hotlink prevention

### Business Logic Rules

**Pack Publishing Requirements**:
- Minimum 3 files in pack
- At least 1 preview image (max 3)
- Title: 3-100 characters
- Price: R$ 9.90 - R$ 500.00 (stored as cents: 990-50000)
- Preview images must NOT contain explicit nudity

**Financial Rules**:
- Platform takes 20% fee, creator receives 80%
- 14-day anti-fraud holding period before balance becomes available
- Minimum withdrawal: R$ 50.00
- Withdrawals processed via Stripe Connect Payouts

**Pack States**: `draft → published ⇄ unpublished → deleted`
- Soft delete only if pack has sales
- Buyers maintain access to unpublished/deleted packs they purchased

### Database Design Patterns

**Key Prisma Models**:
- `User` - userType: 'creator' | 'consumer', stripeAccountId for creators
- `Pack` - status: PackStatus enum, price in cents
- `PackFile` / `PackPreview` - storageKey for R2, order for sorting
- `Purchase` - tracks amount, platformFee, creatorEarnings, availableAt (14 days)
- `Withdrawal` - tracks payout requests and status

**Important Indexes**:
- `@@index([creatorId, status])` on Pack
- `@@index([userId])` on Purchase
- `@@index([creatorId, status])` on Purchase (for balance calculations)

### Stripe Integration

**Payment Flow**:
1. Create Checkout Session with `application_fee_amount` (20%) and `transfer_data.destination` (creator's Connect account)
2. Redirect user to Stripe Checkout
3. Handle `checkout.session.completed` webhook
4. Create Purchase record, send confirmation emails
5. After 14 days, move balance from pending to available

**Creator Onboarding**:
- Create Stripe Connect Express account
- Generate AccountLink for onboarding
- Creators cannot publish packs until Stripe account is fully connected

### Security Measures

**Critical validations**:
- Age verification: reject signups with birthDate < 18 years
- File type validation: check MIME type AND magic bytes
- Rate limiting: 100 req/min globally, 10 req/min on auth endpoints
- CSRF tokens for forms, SameSite cookies
- All sensitive routes protected by `JwtAuthGuard` + `RolesGuard`

**Headers** (Next.js config):
- Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options
- CSP: restrict script/frame sources to trusted domains (Stripe, CDN)

## Design System Implementation

The project uses a **custom Neon Lime design system** (see `design.json`):

### Critical Design Principles

1. **Strategic Accent Usage**: Lime green (#CDFF00) is the hero color - use SPARINGLY for maximum impact
2. **Card-First Layout**: All content lives in rounded cards (12-20px radius)
3. **Dark Hero Cards**: Use dark background (#1A1F2E) for primary metrics/balance displays
4. **Light Background**: Page background is always #E8EEF2 for contrast
5. **Soft Shadows**: Never use harsh shadows - stick to defined shadow scale
6. **Breathing Room**: Maintain generous padding (min 16px in cards)

### Component Priority

1. **React Bits** - First choice for hero sections, backgrounds, eye-catching elements
2. **MagicUI** - Secondary for interactive components
3. **shadcn/ui** - Only for basic structural components (forms, buttons, inputs)

### Key Component Specs

**Cards**:
- Default: white bg, 16px radius, 20px padding, subtle shadow
- Dark: #1A1F2E bg, white text (for hero metrics)
- Accent: #CDFF00 bg, dark text (for positive highlights)
- Hover: `translateY(-2px)` + enhanced shadow

**Buttons**:
- Primary: lime bg (#CDFF00), dark text, 10px radius, 600 weight
- Secondary: dark bg (#1A1F2E), white text
- All buttons: 12px vertical padding, 24px horizontal

**Typography**:
- Font: Inter (heading & body), JetBrains Mono (currency values)
- Hero values: 36px bold, -0.02em tracking
- Card values: 28px semibold
- Labels: 12px medium, secondary color

**Colors**:
- Page BG: `#E8EEF2`
- Surface: `#FFFFFF`
- Dark Surface: `#1A1F2E`
- Primary Accent: `#CDFF00`
- Text Primary: `#12171E`
- Text Secondary: `#5E7086`
- Success: `#22C55E`, Danger: `#EF4444`

## Testing Strategy

**Unit Tests** (Vitest):
- All services must have unit tests
- Mock Prisma client for service tests
- Test validation logic in isolation
- Target: >80% coverage on business logic

**E2E Tests**:
- Critical user flows: signup → pack creation → purchase → access
- Use test Stripe keys and webhook fixtures
- Clean database before each test suite

**Pre-Deployment Checklist**:
1. All tests passing
2. TypeScript strict mode with zero errors
3. Biome lint passing
4. Manual test of Stripe payment flow in test mode
5. Verify webhook endpoint with Stripe CLI

## Critical Implementation Notes

### Zod Validation Pipe (NestJS)

Always use shared Zod schemas:
```typescript
@Post('signup')
async signUp(@Body(new ZodValidationPipe(signUpSchema)) dto: SignUpDto) {
  // Schema is imported from @pack-do-pezin/shared
}
```

### File Upload Flow

Never upload files through NestJS - always use presigned URLs:
```typescript
// 1. Get upload URL
const { uploadUrl, key } = await api.post('/packs/:id/upload-url', { filename, contentType })
// 2. Upload directly to R2
await axios.put(uploadUrl, file, { headers: { 'Content-Type': contentType } })
// 3. Confirm with backend
await api.post('/packs/:id/files', { key, filename, size, mimeType })
```

### Balance Calculation

Always account for the 14-day holding period:
```typescript
const pendingBalance = await prisma.purchase.aggregate({
  where: { creatorId, status: 'paid', availableAt: { gt: new Date() } },
  _sum: { creatorEarnings: true }
})
```

### Decimal Handling

Store all prices in CENTS (integer):
- Display: R$ 29.90 = Database: 2990
- Always validate: 990 (R$ 9.90) to 50000 (R$ 500.00)

## LGPD Compliance

Required endpoints:
- `GET /api/user/data` - Export all user data as JSON
- `DELETE /api/user/account` - Soft delete account (retain financial records for 5 years)

Data retention policy in `prd-pack-do-pezin.md` section 14.5.

## Deployment Architecture

**Coolify Setup** (Docker Compose):
- 3 services: web (Next.js), api (NestJS), postgres
- Environment variables injected via Coolify secrets
- Cloudflare CDN in front for static assets and R2
- Automatic SSL via Cloudflare

**Background Jobs** (NestJS CRON):
- Hourly: Release pending balances (14 days elapsed)
- Daily: Clean expired sessions
- Every 15min: Retry failed webhooks

## Common Pitfalls to Avoid

1. **Never store files in the NestJS server** - always use R2 presigned URLs
2. **Never use plain objects for validation** - always use Zod schemas from shared package
3. **Never expose unsigned R2 URLs** - all file access must be validated and time-limited
4. **Never bypass the 14-day holding period** - financial/legal requirement
5. **Never allow pack deletion if it has sales** - use soft delete
6. **Never use lime accent on large surfaces** - it's an accent color
7. **Never skip age verification** - 18+ check is mandatory everywhere
8. **Never process Stripe webhooks without signature verification**
9. **Never expose creator earnings before deducting platform fee**
10. **Never commit `.env` files** - use `.env.example` only

## Reference Documentation

- Full PRD: `prd-pack-do-pezin.md` (comprehensive product requirements)
- Design System: `design.json` (colors, typography, components, motion)
- Stripe Docs: https://stripe.com/docs/connect
- Prisma Docs: https://www.prisma.io/docs
- Cloudflare R2: https://developers.cloudflare.com/r2

## Global Instructions Integration

This project follows the Memory Bank methodology defined in the global CLAUDE.md. Key Memory Bank files to maintain:

- `projectbrief.md` - Project foundation (use PRD as source)
- `productContext.md` - Why this exists, UX goals
- `activeContext.md` - Current work focus, recent changes
- `systemPatterns.md` - Architecture decisions, design patterns
- `techContext.md` - Stack, setup, constraints (extract from this file)
- `progress.md` - What works, what's pending

**QUALITY GATE**: Before marking any task complete:
1. ✅ `npm run typecheck` (zero errors)
2. ✅ `biome check` (clean)
3. ✅ `vitest run` (all passing)
4. ✅ Update Memory Bank (`activeContext.md` + `progress.md`)

Always prioritize React Bits for visual impact, use the Neon Lime design system, and maintain the security-first approach for handling adult content and payments.
