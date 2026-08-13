# syntax=docker/dockerfile:1

ARG NODE_VERSION=22-alpine

# DATABASE_URL isn't connected to at build time, but Prisma requires it to be
# set (as a well-formed URL) to generate the client, both via the `postinstall`
# hook below and again in the builder stage.
ARG DATABASE_URL="mysql://user:password@localhost:3306/db"

# ---- deps: install dependencies (cached separately from source changes) ----
FROM node:${NODE_VERSION} AS deps
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: generate Prisma client and build the Next.js app ------------
FROM node:${NODE_VERSION} AS builder
RUN apk add --no-cache openssl
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runner: minimal production image --------------------------------------
FROM node:${NODE_VERSION} AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
