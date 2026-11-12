# syntax=docker/dockerfile:1
# Production image for Coolify (Phase 9, #10). Ported from the previous site (cgendio-v1), which runs the same way.
#
# The build needs the database: it migrates it, seeds an empty one, then `next build` prerenders pages from it. Coolify's
# pre-deployment command can't do the migration instead: it runs in the old container, before the new image is built, so
# it never sees new migration files, and it's skipped on the first deploy. Only the builder stage sees DATABASE_URL; the
# final image has neither it nor the Prisma CLI.
#
# Migrations therefore reach the database before the new container replaces the old one, and stay applied if the seed or
# `next build` fails afterwards. Keep every migration additive (new tables, nullable or defaulted columns), so the old
# release keeps working on the new schema. To remove or rename something, ship code that stops using it first and drop
# it in a later deploy. Moving the migration to container start isn't an option: `next build` prerenders from the
# database, so the schema has to be current before the build.

FROM node:24-slim AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1
# pnpm comes from corepack, at the version in package.json's packageManager field. Prisma's schema engine (installed by
# `pnpm install`, used by migrate) links against OpenSSL, which the slim image lacks; only the build stages need it.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && corepack enable
WORKDIR /app

# Dependencies, cached until the lockfile changes. postinstall runs `prisma generate`, so the schema and config come first.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts ./
COPY prisma/schema.prisma prisma/schema.prisma
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build variables (Coolify passes them as build args, or as BuildKit secrets with "Use Docker Build Secrets" on, which it
# mounts into each RUN). Not copied to the final image. NEXT_PUBLIC_SITE_URL is inlined into the client bundle and the
# canonicals, R2_PUBLIC_URL fixes the allowed image host, and both default to something silently wrong when missing.
ARG DATABASE_URL
ARG NEXT_PUBLIC_SITE_URL
ARG R2_PUBLIC_URL
ARG GA_MEASUREMENT_ID
ARG CLARITY_PROJECT_ID
# SEED_ONLY_IF_EMPTY: the seed inserts every missing row, so on a database the site already runs against it would bring
# back seeded content deleted in the admin. With it, only the first deploy seeds (prisma/seed.mts).
RUN for name in DATABASE_URL NEXT_PUBLIC_SITE_URL R2_PUBLIC_URL; do \
      eval "value=\${$name}"; \
      if [ -z "$value" ]; then echo "Build variable $name is not set (see .env.example)" >&2; exit 1; fi; \
    done \
 && pnpm exec prisma generate \
 && pnpm exec prisma migrate deploy \
 && SEED_ONLY_IF_EMPTY=1 pnpm exec prisma db seed \
 && pnpm build

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs
# Standalone output: server.js plus only the node_modules it uses (and the share card fonts, see next.config.ts). The
# static assets and public/ aren't part of it, so they're copied next to it.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
# Coolify uses an image HEALTHCHECK when there is one. The slim image has no curl or wget, so the check is a Node fetch.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"]
CMD ["node", "server.js"]
