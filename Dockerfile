# syntax=docker/dockerfile:1

ARG NODE_VERSION=22-alpine

# Dummy DATABASE_URL for build phase (Prisma client generation only)
ARG DATABASE_URL="mysql://placeholder:placeholder@localhost:3306/placeholder"

# ---- deps: install dependencies ----
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: generate Prisma client and build Next.js ----
FROM node:${NODE_VERSION} AS builder
RUN apk add --no-cache openssl
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Execute build script (prisma generate && next build)
RUN npm run build

# ---- runner: minimal production image ----
FROM node:${NODE_VERSION} AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy static assets and standalone application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema & migration files (needed if running migrations)
COPY --from=builder /app/prisma ./prisma

# Ensure Prisma client binaries & runtime engines are present in node_modules
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
