# syntax=docker/dockerfile:1.7
# -----------------------------------------------------------------------------
# LearnHub Backend — PRODUCTION image (multistage, distroless-style)
#
# Stage 1 (deps)     : install full deps (dev+prod) + generate Prisma client
# Stage 2 (builder)  : tsc → dist/
# Stage 3 (prod-deps): install ONLY production deps for the runtime image
# Stage 4 (runner)   : minimal Alpine runtime — runs dist/server.js as non-root
#
# Build:  docker build -t learnhub-api:prod -f docker/production/Dockerfile .
# Run  :  docker run -p 3000:3000 --env-file .env learnhub-api:prod
# Worker: docker run --env-file .env learnhub-api:prod node dist/worker.js
# -----------------------------------------------------------------------------

ARG NODE_VERSION=20-alpine

# ---- Stage 1: deps (full) ---------------------------------------------------
FROM node:${NODE_VERSION} AS deps
RUN apk add --no-cache libc6-compat openssl python3 make g++ bash
WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma

RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=dev

# Generate Prisma client into node_modules/.prisma so the runtime stage can
# copy it verbatim — no network or openssl needed at runtime.
RUN npx prisma generate

# ---- Stage 2: builder (tsc) -------------------------------------------------
FROM node:${NODE_VERSION} AS builder
WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

RUN npx tsc -p tsconfig.json

# ---- Stage 3: production-only deps -----------------------------------------
FROM node:${NODE_VERSION} AS prod-deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma

# Prune to production-only. Run prisma generate once more against the pruned
# tree so the runtime image has its matching Prisma engine binary.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev \
 && npx prisma generate \
 && npm cache clean --force

# ---- Stage 4: runner (minimal) ---------------------------------------------
FROM node:${NODE_VERSION} AS runner

RUN apk add --no-cache libc6-compat openssl tini curl \
    && addgroup -S app && adduser -S app -G app

WORKDIR /usr/src/app
ENV NODE_ENV=production \
    PORT=3000 \
    NPM_CONFIG_LOGLEVEL=warn

# Copy just what we need — no dev deps, no source, no .cache.
COPY --from=prod-deps --chown=app:app /usr/src/app/node_modules ./node_modules
COPY --from=prod-deps --chown=app:app /usr/src/app/prisma ./prisma
COPY --from=builder   --chown=app:app /usr/src/app/dist ./dist
COPY --chown=app:app  package*.json ./
COPY --chown=app:app  public ./public

RUN mkdir -p logs public/uploads && chown -R app:app logs public
USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS "http://localhost:${PORT}/api/v1/health" || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
