# Development Dockerfile for NestJS API
FROM node:20-alpine AS base

# Install system dependencies (FFmpeg for video conversion)
RUN apk add --no-cache ffmpeg

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.1 --activate

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Generate Prisma client
WORKDIR /app/apps/api
RUN pnpm prisma:generate

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm build

WORKDIR /app/apps/api

EXPOSE 3001

# For production
FROM base AS production
ENV NODE_ENV=production
RUN pnpm build
CMD ["pnpm", "start:prod"]

# For development (default)
FROM base AS development
ENV NODE_ENV=development
CMD ["pnpm", "dev"]
