# syntax=docker/dockerfile:1.7
# -----------------------------------------------------------------------------
# LearnHub Backend — DEVELOPMENT image (multistage)
# Stage 1 (deps)   : install full dev+prod deps, generate Prisma client
# Stage 2 (runner) : tiny runtime image that runs nodemon via ts-node
# Hot-reload: source is mounted from host (see docker-compose.dev.yml).
# -----------------------------------------------------------------------------

# ---- Stage 1: deps ----------------------------------------------------------
FROM node:20-alpine AS deps

# Prisma needs libssl+openssl; bcrypt needs build-base for native compilation.
RUN apk add --no-cache libc6-compat openssl python3 make g++ bash

WORKDIR /usr/src/app

# Only copy manifest files first — best-cache layer.
COPY package*.json ./
COPY prisma ./prisma

# Install full deps (dev + prod) for hot reload + typechecking.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=dev

# Generate the Prisma client.
RUN npx prisma generate

# ---- Stage 2: runner --------------------------------------------------------
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat openssl tini bash curl \
    && addgroup -S app && adduser -S app -G app

WORKDIR /usr/src/app
ENV NODE_ENV=development \
    PORT=3000 \
    TS_NODE_TRANSPILE_ONLY=true

# Copy installed deps + generated Prisma client from the deps stage.
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/prisma ./prisma

# Copy source — in practice docker-compose remounts this as a bind mount so
# edits on the host trigger nodemon inside the container.
COPY --chown=app:app . .

# Ensure runtime dirs exist with correct perms.
RUN mkdir -p logs public/uploads && chown -R app:app logs public /usr/src/app
USER app

EXPOSE 3000

# tini is PID 1 — forwards signals so Ctrl-C cleanly kills nodemon + ts-node.
ENTRYPOINT ["/sbin/tini", "--"]

HEALTHCHECK --interval=20s --timeout=3s --start-period=15s --retries=3 \
  CMD curl -fsS "http://localhost:${PORT}/api/v1/health" || exit 1

CMD ["npm", "run", "dev"]
