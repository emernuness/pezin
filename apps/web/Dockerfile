# Development Dockerfile for Next.js Web
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.1 --activate

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm build

WORKDIR /app/apps/web

EXPOSE 3000

# For production
FROM base AS production
ENV NODE_ENV=production
RUN pnpm build
CMD ["pnpm", "start"]

# For development (default)
FROM base AS development
ENV NODE_ENV=development
CMD ["pnpm", "dev"]
