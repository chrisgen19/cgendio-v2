# Deploying to Coolify

How to run this site on Coolify on the Hostinger VPS (#10): the app is built from the `Dockerfile`, Postgres is a Coolify resource, and there is a single app container. The previous site (`cgendio-v1`) runs the same way on the same box, so its `docs/DEPLOY.md` is the reference for anything not repeated here.

Live since 2026-11-09: `cgdiomampo.dev` is served by the Coolify app `cgendio-v2`, and `cgendio-v1` is stopped but kept for rollback (#81). The manual checklist below is what the first deploy ran through, so it is the reference for rebuilding the app from scratch.

## How the build works (read this first)

`next build` prerenders from the database: the home page, the posts, the case studies, the feed and the sitemap. So the image build has to reach Postgres, and the schema has to be current before Next renders anything. The builder stage therefore runs, in order (`Dockerfile:46-54`):

1. `prisma generate`
2. `prisma migrate deploy` - applies any new migrations.
3. `SEED_ONLY_IF_EMPTY=1 prisma db seed` - writes the Phase 3 content into an **empty** database only. The seed inserts every missing row, so without that flag it would bring back content deleted in the admin on every deploy (`prisma/seed.mts:139`).
4. `pnpm build`

Before all of that, a guard fails the build when `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL` or `R2_PUBLIC_URL` is empty (`Dockerfile:46-49`). Each of them defaults to something silently wrong rather than erroring, so the guard is deliberate: a build that cannot be right should not produce an image.

Coolify's **pre-deployment command cannot do the migration instead.** It runs in the *old* container, before the new image is built, so it never has the new migration files, and it is skipped on the first deploy. Leave it empty. Do not set it to `pnpm db:deploy` either: the final image has neither pnpm nor the Prisma CLI.

Only the builder stage sees `DATABASE_URL`. The final image is the standalone server, the static files, `public/` and the share-card fonts - no Prisma CLI, and no secrets in its environment or layer history.

## Migrations must be additive

Because migrations run in the builder stage, **they reach the database before the new container replaces the old one**, and they stay applied if the seed or `next build` fails afterwards. The old release then serves traffic against the new schema. The full decision, with the alternatives and why each one fails, is on [#10](https://github.com/chrisgen19/cgendio-v2/issues/10#issuecomment-6702004905).

So every migration has to keep the **old** release working:

- Add tables, and columns that are nullable or have a default.
- To remove or rename something, deploy twice: first ship code that stops using it, then drop it.
- A redeploy of an older commit does not undo a migration. `prisma migrate deploy` simply reports no pending migrations.

Two things specific to this site:

- **New page-copy keys need a migration of their own.** Every `PAGE_COPY_KEYS` entry is required, and the seed skips existing rows, so a database that only ran `prisma migrate deploy` would fail on every page that reads copy. Add each new key to `prisma/seed.mts` *and*, with the same value, to a hand-written migration: `INSERT INTO "page_copy" ("key", "value", "updated_at") VALUES (..., CURRENT_TIMESTAMP) ON CONFLICT ("key") DO NOTHING`. `src/server/page-copy-migration.test.ts` fails on a missing row or a value that differs from the seed.
- **A migration needs a container restart.** Page copy is cached under the content tags with `cacheLife('max')`, and only `revalidateContentOnStart()` (`src/instrumentation.ts`) marks those tags stale, once per server start. Every deploy starts a new container, so this is automatic - but it is the reason not to run `db:deploy` against production by hand. A warm instance that is not restarted can serve the old copy for up to 30 days.

## Environment variables

**Build** means the Coolify **Build Variable** box is checked, so the value reaches `next build`. Four variables are needed in *both* places, which is the easy thing to get wrong.

**Startup** means the server refuses to start without it (`src/server/startup-env-check.ts`, #105): `instrumentation.ts` checks these before the server takes requests, so a missing one fails the deploy instead of a page. Everything else either has a safe default or only disables the feature it belongs to, and is reported as a warning in the same log.

| Variable | Build | Runtime | Startup | Value and what breaks without it |
|---|---|---|---|---|
| `DATABASE_URL` | yes | yes | **fatal** | The Postgres resource's internal URL. The build fails without it (guarded). |
| `NEXT_PUBLIC_SITE_URL` | yes | yes | | `https://<domain>`, no trailing slash. Inlined into the client bundle. The build fails without it (guarded). See the scheme rule below. |
| `R2_PUBLIC_URL` | yes | yes | **fatal** | The bucket's public base URL, no trailing slash. Fixes the allowed image host for the optimizer (`next.config.ts:24`), so a wrong value breaks every optimized image. The build fails without it (guarded), and the server refuses to start without it: `r2Env()` parses the whole R2 schema at runtime, so a value that reaches the build and not the container would only fail on the first admin upload. |
| `GA_MEASUREMENT_ID` | yes | yes | warns | `G-XXXXXXXXXX`. Build variable because the public pages are prerendered with the tag. Not guarded: unset means no tag at all, and a malformed value is ignored with a logged warning rather than taking a page down. |
| `BETTER_AUTH_SECRET` | | yes | **fatal** | A new value, `openssl rand -base64 32`. Do not reuse the local one. At least 32 characters. |
| `BETTER_AUTH_URL` | | yes | **fatal** | Same as `NEXT_PUBLIC_SITE_URL`. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | | yes | **fatal** | From the **production** OAuth app (section 5). The server refuses to start without them. |
| `ADMIN_EMAILS` | | yes | **fatal** | Comma-separated. Only these GitHub emails can sign in to `/admin`. |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | | yes | **fatal** | Uploads only, but fatal at startup: the alternative is a deploy that looks healthy until the first admin upload. |
| `RESEND_API_KEY` | | yes | warns | Optional, but without it the contact form **stores the message and silently skips the email**, and the form is the site's main call to action. |
| `MAIL_FROM` | | yes | | A sender on a Resend-verified domain. `onboarding@resend.dev` only delivers to your own Resend account address. |
| `INDEXNOW_KEY` | | yes | warns | Runtime only; the key route reads it per request. Use v1's existing value so `/indexnow-key.txt` serves the same key through the cutover. Unset means no pings and a 404 key file. |

The build only needs the four build variables: the schemas in `src/lib/env.ts` are split by concern and parsed on first use, so a build never needs the auth, R2 or mail secrets. The running server is stricter - it checks the fatal ones above before it serves anything.

**Renamed from v1's Coolify keys, so do not copy them across blindly:** `SITE_URL` is now `NEXT_PUBLIC_SITE_URL`, and `ADMIN_EMAIL` is now `ADMIN_EMAILS`. New in v2: `RESEND_API_KEY`, `MAIL_FROM` and the four `R2_*` upload keys.

### NEXT_PUBLIC_SITE_URL must match the scheme the site is served on

It is not just a label. Its scheme decides whether the Content Security Policy sends `upgrade-insecure-requests` (`src/lib/security-headers.ts`), and its value drives the canonical URLs, the sitemap, the share cards and the Better Auth redirects.

So an https value served over plain http makes the browser upgrade the page's own assets to https and fail to load them - on top of four other things already being wrong. In practice: **give a temporary Coolify domain TLS before setting this to an https URL**, or set it to the origin actually being served. Browsers exempt loopback, so local http (dev, e2e, the container smoke test) is unaffected either way.

## Manual checklist

1. **Coolify project and GitHub App.** Connect the repo `chrisgen19/cgendio-v2` through Coolify's GitHub App.
2. **Postgres: a new database for v2.** Production is the database `cgendio_v2` on the existing shared server in the `Postgres Database` project, owned by its own `cgendio_v2` role with no admin rights. That server runs Postgres 17, while local development and CI run 18 (`compose.yaml`); all the migrations have applied cleanly on 17. **Never reuse v1's database** (`cgendio`) - the schemas differ, and v1 has to stay intact for rollback. Use the server's **internal** host in `DATABASE_URL`, with the `cgendio_v2` role. The backup schedule is a fixed list of database names, so a new database has to be added to it by name.
3. **Application.** New resource → Application, from `chrisgen19/cgendio-v2`, branch `main`. Build pack: **Dockerfile**. Port `3000`.
4. **Variables** per the table above, with the four build boxes ticked. Turn on **Use Docker Build Secrets** so build-time values are passed as BuildKit secrets; either way they stay out of the final image, since only the builder stage reads them. Leave the pre- and post-deployment commands empty.
5. **Production GitHub OAuth app.** A second app (GitHub → Settings → Developer settings → OAuth Apps), homepage `https://<domain>`, callback `https://<domain>/api/auth/callback/github`. Keep the local app for `localhost:3000`.
6. **R2 for production.** Use a custom domain, not `r2.dev`: Cloudflare rate-limits it and documents it as development-only. In the bucket's **CORS Policy**, allow the production origin, or admin uploads fail from the live site - the browser `PUT`s straight to the bucket (`src/components/admin/upload-field.tsx`):

   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://<domain>"],
       "AllowedMethods": ["PUT"],
       "AllowedHeaders": ["Content-Type"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

7. **Health check: nothing to set.** The image carries its own `HEALTHCHECK` on `/api/health` (`Dockerfile:71`), and Coolify uses an image's check instead of the dashboard one. It returns 200 whenever the server is up and reports the database state in the body. A database outage does not fail it on purpose: Traefik would stop routing to the container, which would also take down the prerendered pages that work without Postgres.
8. **Domain, www redirect and DNS.** `cgdiomampo.dev` and `www.cgdiomampo.dev` both point at the VPS already. Both domains stay on the Coolify app, and the permanent redirects live in a Traefik dynamic config file on the server, because Coolify's own non-www and HTTP→HTTPS redirects are temporary. v1 ships a copy in `cgendio-v1/docs/traefik/`. The file only matches the hostnames and uses `noop@internal`, so it names no app and needs no change when the domains move between apps. Check with `curl -sS -o /dev/null -D - https://www.cgdiomampo.dev/` and the same for `http://cgdiomampo.dev/`: both should answer 301 to `https://cgdiomampo.dev/`. `curl -I` sends a HEAD request, which Traefik answers with 308 instead.
9. **VPS firewall.** Only 22, 80 and 443 open; Postgres not publicly reachable.
10. **First deploy.** The build log should show `Applying migration ...`, then the seed output, then the route table. Later deploys show `No pending migrations to apply.` and `Content already exists (SEED_ONLY_IF_EMPTY=1), so the seed inserted nothing.`

    **If a fatal variable is missing or invalid, the container will not start.** It logs every offending variable by name, as `VARIABLE: message` under "Missing or invalid environment variables, so the server will not start", then exits non-zero - so the deploy fails rather than a page. Check the container log for that list first when a deploy will not come up. The warnings in the same log (no `RESEND_API_KEY`, analytics or IndexNow off) are expected when those are unset and do not stop anything.
11. **Smoke test** (#10 step 11), against the live URL: the home page with both hero cuts, the film playing once and holding on the brand card, a post, a case study, a contact submit that actually arrives, admin sign-in, and `/api/health` returning `{"status":"ok","database":"ok"}` with Coolify showing the container healthy.

## Rollback

- **Redeploy the previous image or commit** in Coolify. That is the whole procedure for anything that does not involve a migration.
- **Migrations only go forward.** Redeploying an older commit does not undo one; `prisma migrate deploy` reports no pending migrations. This is exactly why migrations have to be additive: an older release has to keep working on the newer schema.
- **To genuinely undo a migration**, write a *forward* migration that reverses it, and keep that additive too (drop in a later deploy than the one that stopped using the column).
- **Running anything by hand** means a checkout with `DATABASE_URL` pointed at production, for example through an SSH tunnel. The image has no Prisma CLI. `prisma migrate dev` will not run non-interactively, so write the migration yourself: `--script` prints to stdout, and `prisma migrate deploy` only applies folders under `prisma/migrations`, so SQL that is not saved into one is never applied - and the deploy still reports no pending migrations, which reads as success.

  ```bash
  dir=prisma/migrations/$(date -u +%Y%m%d%H%M%S)_revert_<name>
  mkdir -p "$dir"
  pnpm exec prisma migrate diff \
    --from-schema <schema.prisma from main> --to-schema prisma/schema.prisma --script > "$dir/migration.sql"
  # read the SQL before applying it
  pnpm db:deploy
  ```

  Keep it a folder rather than running the SQL with `prisma db execute`: the folder records a row in `_prisma_migrations`, so the repo's history and the database stay in step and the next image build's `migrate deploy` knows the change has been applied. Restart the container afterwards so `revalidateContentOnStart()` runs.
- **The real rollback is v1.** Keep the `cgendio-v1` app stopped but not deleted, with its own database untouched, until v2 has been stable for a while (#81 Phase F).

## Operations

- **Caching:** one instance, so the container's own Next.js cache is enough. A redeploy starts with a fresh cache, rebuilt from the prerendered pages. A second replica would need a shared cache handler (#10 step 8).
- **A CDN in front (e.g. Cloudflare proxying):** `/writing/<slug>` and `/projects/<slug>` serve Markdown to `Accept: text/markdown` and HTML otherwise, but Next does not put `Accept` in the HTML response's `Vary`. Add `Accept` to the cache key for those paths, or skip the cache for requests whose `Accept` contains `text/markdown`.
- **Security headers** are sent on every response from `next.config.ts`: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, the Content Security Policy and HSTS. HSTS is `max-age=63072000; includeSubDomains` **without** `preload`, so it can still be withdrawn; adding `preload` is close to irreversible, so do not add it casually.

## Testing the image locally

What #98 ran, against a throwaway Postgres container:

```bash
docker run -d --rm --name cgendio-test-db -e POSTGRES_USER=cgendio -e POSTGRES_PASSWORD=<pw> \
  -e POSTGRES_DB=cgendio -p 127.0.0.1:5544:5432 postgres:18-alpine

docker build --network host \
  --build-arg DATABASE_URL=postgresql://cgendio:<pw>@127.0.0.1:5544/cgendio \
  --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3300 \
  --build-arg R2_PUBLIC_URL=https://pub-<id>.r2.dev \
  -t cgendio-v2:local .

docker run -d --name cgendio-app -p 3300:3000 --env-file <runtime env file> cgendio-v2:local
curl http://localhost:3300/api/health
```

Build it twice against the same database: the second build should report no pending migrations and insert nothing, which is what proves deleted content does not come back on redeploy.

## Not decided yet

These are open on #10, and this document should be updated when each is settled:

- **Where the image is built** (#10 step 2): on the VPS, or in GitHub Actions pushing to GHCR. The image is 461 MB and the build runs `pnpm install` plus `next build` with Remotion, which is a real load on a small VPS while it is also serving the live site.
- **Preview deployments** (#10 step 5). **Keep previews off until they have their own database.** A preview build runs that branch's migrations against whatever `DATABASE_URL` it is given, which would change the production database before the PR is merged.
- **Admin sign-in on previews** (#10 step 6): a GitHub OAuth app has one callback URL, so previews need a second app or no admin.
- **Backups, analytics and monitoring** (#10 step 9): scheduled Postgres backups off the VPS with one restore tested, an analytics choice, an error-monitoring choice, and Coolify notifications for failed deploys and failing health checks.
