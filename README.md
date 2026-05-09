# Workouter

Build structured Apple Watch and Garmin workouts in a web app.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Make sure PostgreSQL is running, then set up your `.env` file (see `.env.example` for reference).

```bash
# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### 3. Configure OAuth Providers (Optional)

To enable Google/GitHub sign-in, add your OAuth credentials to `.env`:

- **Google**: Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
- **GitHub**: Get credentials from [GitHub Developer Settings](https://github.com/settings/developers)

### 4. Configure GlitchTip Error Tracking (Optional)

Add GlitchTip environment variables to `.env.local` for local error visibility, or to your
hosting platform's secret store for staging/production. See [GlitchTip Error Tracking](#glitchtip-error-tracking)
below for the full variable reference.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Features

### Authentication
- NextAuth.js v5 with OAuth providers (Google, GitHub)
- Credentials-based authentication
- Protected routes with middleware

### Error Tracking (GlitchTip)
- Client, server, and Edge runtime error capture via the Sentry SDK
- Tunnel route at `/api/tunnel` to bypass ad-blockers
- Health-check endpoint at `/api/health` for uptime monitoring
- Source maps uploaded automatically during `next build` for readable stack traces

### User-Facing Pages
- **Landing page** (`/`) - Public marketing page
- **Dashboard** (`/dashboard`) - User workouts and settings
- **Login/Register** (`/login`, `/register`) - Authentication flows

### External API (OAuth 2.0)

The app provides an OAuth 2.0 protected API for external access (e.g., MCP servers).

#### OAuth Flow

1. **Authorization Request**
   ```
   GET /api/v1/oauth/authorize?response_type=code&client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&scope=read:workouts write:workouts&state=STATE
   ```

2. **Token Exchange**
   ```
   POST /api/v1/oauth/token
   Content-Type: application/x-www-form-urlencoded

   grant_type=authorization_code&code=CODE&redirect_uri=REDIRECT_URI&client_id=CLIENT_ID&client_secret=CLIENT_SECRET
   ```

3. **API Access**
   ```
   GET /api/v1/workouts
   Authorization: Bearer ACCESS_TOKEN
   ```

#### Available Scopes
- `read:user` - Read user profile information
- `read:workouts` - Read workout data
- `write:workouts` - Create and modify workouts

#### API Endpoints

- `GET /api/v1/me` - Get current user info (requires `read:user`)
- `GET /api/v1/workouts` - List workouts (requires `read:workouts`)
- `POST /api/v1/workouts` - Create workout (requires `write:workouts`)

## Design System

This project follows the Workouter Design System. See `DESIGN_SYSTEM.md` for:
- Color tokens (CSS variables)
- Typography scales
- Component patterns
- Spacing and layout guidelines

**Key principles:**
- Restrained, block-based UI
- Light + dark themes with user-configurable accent colors
- Archivo Black for display, Inter for body, JetBrains Mono for utility text

## Project Structure

```
/app
  /(auth)
    /login          # Login page
    /register       # Registration page
  /api
    /auth           # NextAuth.js routes
    /health         # Uptime / liveness health-check endpoint
    /tunnel         # GlitchTip envelope proxy (bypasses ad-blockers)
    /v1             # External API
      /oauth        # OAuth 2.0 endpoints
      /workouts     # Workout CRUD
      /me           # User info
  /dashboard        # Protected dashboard
  /lib              # Server-side utilities
    auth.ts         # NextAuth config
    prisma.ts       # Prisma client
    oauth.ts        # OAuth helpers
  layout.tsx        # Root layout
  page.tsx          # Landing page
  globals.css       # Design system CSS

/prisma
  schema.prisma     # Database schema

/types
  next-auth.d.ts    # TypeScript definitions

sentry.client.config.ts   # Sentry SDK — browser runtime
sentry.server.config.ts   # Sentry SDK — Node.js server runtime
sentry.edge.config.ts     # Sentry SDK — Edge runtime (middleware)
next.config.ts            # Next.js config + Sentry webpack plugin
```

## Database Schema

- **User** - User accounts with preferences
- **Account** - OAuth account links (NextAuth)
- **Session** - User sessions (NextAuth)
- **VerificationToken** - Email verification (NextAuth)
- **OAuthClient** - External API clients
- **OAuthAuthorizationCode** - OAuth authorization codes
- **OAuthAccessToken** - OAuth access tokens

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production (also uploads source maps to GlitchTip)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run Vitest tests

---

## GlitchTip Error Tracking

The app integrates [GlitchTip](https://glitchtip.com) for error monitoring using the Sentry SDK.
GlitchTip is fully Sentry-protocol compatible, so all standard Sentry features work without
modification: error capture, performance tracing, session replay, and source-map de-obfuscation.

### Environment Variables

Copy these into `.env.local` for local development, or configure them in your hosting
platform's environment/secret store for staging and production. See `.env.example` for the
complete annotated reference.

#### Runtime variables (needed when the server starts)

| Variable | Visibility | Description |
|---|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | **Public** (browser bundle) | DSN from your GlitchTip project (Project Settings → DSN). Also used by `/api/tunnel` to validate forwarded envelopes. |
| `SENTRY_DSN` | **Server only** | Same DSN (or a separate server project DSN) for server-side and Edge error capture. Never shipped to the browser. |
| `SENTRY_ENVIRONMENT` | Server only | Deployment label: `production`, `staging`, or `development`. Falls back to `"development"` when absent. |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | Public | Same label for the browser SDK. Must match `SENTRY_ENVIRONMENT`. |
| `SENTRY_RELEASE` | Server only | Release identifier — typically the Git SHA or a semver tag. Enables suspect-commit tracking in GlitchTip. |
| `NEXT_PUBLIC_SENTRY_RELEASE` | Public | Same release identifier for the browser SDK. Must match `SENTRY_RELEASE`. |

#### Build-time variables (needed during `next build` in CI/CD)

These are consumed by the `@sentry/nextjs` webpack plugin and must be present in the CI
environment that runs the build — **not** just at runtime.

| Variable | Description |
|---|---|
| `SENTRY_URL` | Base URL of your GlitchTip instance, e.g. `https://app.glitchtip.com`. **Required**; without it the plugin defaults to `https://sentry.io` and source-map uploads will fail. |
| `SENTRY_ORG` | GlitchTip organisation slug (Settings → Organisation). |
| `SENTRY_PROJECT` | GlitchTip project slug (Settings → Projects). |
| `SENTRY_AUTH_TOKEN` | API token with `project:write` scope (User Settings → Auth Tokens). **Store as a CI secret — never commit this value.** |

### `/api/health` — Health-Check Endpoint

`GET /api/health` is a public, read-only endpoint for uptime monitors and load-balancer
health probes. No authentication is required.

**What it checks:** Issues a `SELECT 1` query via Prisma to verify the app can reach
its PostgreSQL database.

**Responses:**

```jsonc
// HTTP 200 — healthy
{ "status": "healthy", "timestamp": "2024-01-15T12:00:00.000Z", "services": { "database": "ok" } }

// HTTP 503 — database unreachable
{ "status": "unhealthy", "error": "connect ECONNREFUSED 127.0.0.1:5432" }
```

Point your uptime monitor (GlitchTip Uptime, UptimeRobot, Better Uptime, etc.) at
`https://yourdomain.com/api/health` and alert on any response other than HTTP `200`.

### `/api/tunnel` — Sentry Envelope Tunnel

`POST /api/tunnel` proxies Sentry error envelopes from the browser through the Next.js server
so that ad-blockers and privacy extensions cannot silently drop error reports.

The browser SDK is configured with `tunnel: "/api/tunnel"` (see `sentry.client.config.ts`).
This means all client-side error envelopes are sent to your own domain first, where the route:

1. Parses the envelope's DSN from its first-line header.
2. Validates the DSN host against `NEXT_PUBLIC_SENTRY_DSN` to prevent open-proxy abuse.
3. Forwards the raw envelope body to the correct GlitchTip ingest endpoint.
4. Returns the upstream HTTP status to the SDK (so the SDK can retry on failure).

> **Security:** In production, `NEXT_PUBLIC_SENTRY_DSN` **must** be set. The tunnel
> will return HTTP 500 and refuse to forward if the variable is missing.

### Source-Map Upload

Source maps are uploaded automatically by the `@sentry/nextjs` webpack plugin during
`next build`. Uploaded maps let GlitchTip show original TypeScript file names, line
numbers, and variable names in stack traces instead of minified output.

**Plugin configuration (in `next.config.ts`):**

| Option | Behaviour |
|---|---|
| `widenClientFileUpload: true` | Uploads maps for all client chunks, including lazily-loaded ones. |
| `hideSourceMaps: true` | Deletes `.map` files from the build output after upload — end-users never receive them. |
| `reactComponentAnnotation: { enabled: true }` | Adds `data-sentry-component` DOM attributes for richer breadcrumbs in session replays. |
| `disableLogger: true` | Tree-shakes `Sentry.logger.*` debug calls from the production bundle. |

---

## Deploy Checklist

Use this checklist when deploying a new version to staging or production.

### Pre-Deploy

- [ ] All CI checks pass (`npm run lint`, `npm test`, `npm run build`).
- [ ] Database migrations are up to date (`npx prisma migrate deploy`).
- [ ] No `.env.local` or secret files included in the build artifact.

### Environment Variables

Set the following in your hosting platform (Vercel, Fly.io, AWS, etc.) before deploying:

**Auth & Database**
- [ ] `DATABASE_URL` — PostgreSQL connection string.
- [ ] `AUTH_SECRET` — Generate with `openssl rand -base64 32`. **Use a fresh value for production.**
- [ ] `NEXTAUTH_URL` — Canonical production URL, e.g. `https://workouter.example.com`.
- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — If Google OAuth is enabled.
- [ ] `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — If GitHub OAuth is enabled.

**GlitchTip Error Tracking (runtime)**
- [ ] `NEXT_PUBLIC_SENTRY_DSN` — GlitchTip project DSN (public).
- [ ] `SENTRY_DSN` — Same DSN for server-side capture (server-only secret).
- [ ] `SENTRY_ENVIRONMENT` — Set to `production`.
- [ ] `NEXT_PUBLIC_SENTRY_ENVIRONMENT` — Set to `production`.
- [ ] `SENTRY_RELEASE` — Set to the current Git SHA or version tag (e.g. injected by CI as `$(git rev-parse --short HEAD)`).
- [ ] `NEXT_PUBLIC_SENTRY_RELEASE` — Same value as `SENTRY_RELEASE`.

**GlitchTip Source-Map Upload (build-time CI secrets)**
- [ ] `SENTRY_URL` — Base URL of your GlitchTip instance, e.g. `https://app.glitchtip.com`.
- [ ] `SENTRY_ORG` — GlitchTip organisation slug.
- [ ] `SENTRY_PROJECT` — GlitchTip project slug.
- [ ] `SENTRY_AUTH_TOKEN` — API token with `project:write` scope. **CI secret — never commit.**

### Build & Source Maps

- [ ] Run `next build` in CI with all four `SENTRY_*` build-time variables set.
- [ ] Confirm the build log shows the Sentry plugin uploading source maps (or check the GlitchTip
      Releases page for a new release entry matching `SENTRY_RELEASE`).
- [ ] Verify `.map` files are **not** present in the deployed assets (the plugin deletes them
      after upload when `hideSourceMaps: true`).

### Post-Deploy Verification

- [ ] **Health check:** `curl https://yourdomain.com/api/health` returns HTTP 200 and
      `{ "status": "healthy" }`.
- [ ] **Uptime monitor:** GlitchTip Uptime (or equivalent) is configured to poll
      `https://yourdomain.com/api/health` and alert on non-200 responses.
- [ ] **Error tunnel:** Trigger a test error (e.g. visit `/api/sentry-example-api` if the
      Sentry example route is present, or throw from a test button) and confirm the event
      appears in GlitchTip within a few seconds.
- [ ] **Source maps:** Open the test error in GlitchTip and verify the stack trace shows
      original TypeScript source — not minified JavaScript.
- [ ] **OAuth callbacks:** Confirm Google/GitHub redirect URIs in the provider dashboards
      are updated to the new production domain.
- [ ] **Database migrations:** `npx prisma migrate deploy` ran successfully against the
      production database.

---

## Next Steps

1. Add workout model to Prisma schema
2. Implement workout builder UI
3. Add Apple Watch / Garmin export functionality
4. Create API client management UI (`/dashboard/api-clients`)
5. Add theme toggle functionality
6. Implement user settings page

## License

Private project.
