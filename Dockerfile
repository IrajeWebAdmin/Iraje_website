# syntax=docker/dockerfile:1

ARG NODE_VERSION=22-alpine

# Dummy DATABASE_URL for build phase (Prisma client generation only)
ARG DATABASE_URL="mysql://placeholder:placeholder@localhost:3306/placeholder"

# ---- deps: install dependencies ----
# openssl must be present *here*: @prisma/engines picks its engine variant at
# install time by reading the OpenSSL version. `binaryTargets` in schema.prisma
# covers the query engine only — the schema engine that `migrate deploy` needs
# is resolved by platform detection, during this npm ci.
FROM node:${NODE_VERSION} AS deps
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- migrator: Prisma CLI + schema engine, run as a Cloud Run Job ----
# Migrations cannot run from the runner stage: `prisma` is a devDependency and
# the standalone build only carries production deps. This stage keeps the full
# node_modules (devDeps included) and is deployed as a separate Cloud Run Job.
#
# It connects through the same --set-cloudsql-instances socket the service uses,
# so a successful job execution also proves the service's DB connectivity —
# which is why the job runs before the service is deployed.
#
# Placed directly after `deps` on purpose: the legacy docker builder does not
# prune stages by dependency graph, so sitting after `builder` would make a
# standalone `docker build --target=migrator` run the whole Next build for
# nothing.
FROM node:${NODE_VERSION} AS migrator
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
# Split entrypoint from args so `gcloud run jobs execute --args=...` APPENDS to
# the CLI rather than replacing the whole command. That is what makes the
# one-off baseline call work:
#   --args="migrate,resolve,--applied,0_init"
ENTRYPOINT ["./node_modules/.bin/prisma"]
CMD ["migrate", "deploy"]

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

# NOTE: prisma/ is deliberately NOT copied here. The generated client embeds its
# own schema copy under .prisma/client, so nothing at runtime reads /app/prisma.
# Migrations run from the `migrator` stage above, never from the serving image.

# Ensure Prisma client binaries & runtime engines are present in node_modules
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
