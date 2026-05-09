# Auth.js (NextAuth.js v5) Setup

This application uses Auth.js (NextAuth.js v5) for authentication.

## Current Configuration

### Providers Configured

1. **Google OAuth** - Sign in with Google
2. **GitHub OAuth** - Sign in with GitHub
3. **Credentials** - Email/password authentication

### Database Strategy

Using **database sessions** with Prisma adapter for:
- Persistent sessions
- User management
- OAuth account linking
- Better security

## Setup Instructions

### 1. Database Setup

Make sure PostgreSQL is running, then:

```bash
npx prisma migrate dev --name init
```

This creates the required tables:
- `users` - User accounts
- `accounts` - OAuth account links
- `sessions` - User sessions
- `verification_tokens` - Email verification

### 2. OAuth Provider Setup

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth client ID
5. Application type: Web application
6. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env`:

```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. New OAuth App
3. Application name: Workouter Dev
4. Homepage URL: `http://localhost:3000`
5. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
6. Copy Client ID and generate Client Secret, add to `.env`:

```env
GITHUB_CLIENT_ID="your-client-id"
GITHUB_CLIENT_SECRET="your-client-secret"
```

### 3. Auth Secret

Already generated in `.env`:
```env
AUTH_SECRET="Z8bGFQ7o8dgZvxPEjLl+/2IzaPwWakgOjtmhnxAUZAA="
```

Generate a new one for production:
```bash
openssl rand -base64 32
```

## Usage in Code

### Server-Side (Server Components / API Routes)

```typescript
import { auth } from "@/app/lib/auth";

export default async function Page() {
  const session = await auth();

  if (!session) {
    // User not authenticated
  }

  // Access user: session.user.id, session.user.email, etc.
}
```

### Sign In / Sign Out

```typescript
import { signIn, signOut } from "@/app/lib/auth";

// Sign in with OAuth
await signIn("google", { redirectTo: "/dashboard" });
await signIn("github", { redirectTo: "/dashboard" });

// Sign in with credentials
await signIn("credentials", {
  email: "user@example.com",
  password: "password",
  redirectTo: "/dashboard",
});

// Sign out
await signOut();
```

### Middleware Protection

Protected routes are configured in `middleware.ts`:

```typescript
export default auth((req) => {
  // Redirect to login if not authenticated
  if (!req.auth && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});
```

## Protected Routes

- `/dashboard` - Requires authentication
- `/dashboard/*` - All dashboard sub-routes require authentication
- `/api/v1/*` - API routes use OAuth token validation (not session)

## Public Routes

- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/api/auth/*` - NextAuth API routes
- `/api/health` - Health-check endpoint (unauthenticated by design)
- `/api/tunnel` - GlitchTip error-reporting tunnel (unauthenticated by design)

## Custom Pages

Configured in `app/lib/auth.ts`:

```typescript
pages: {
  signIn: "/login",
  signOut: "/",
  error: "/login",
}
```

## Session Access

Session data includes:

```typescript
{
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  }
}
```

## Troubleshooting

### "Cannot find module '@auth/prisma-adapter'"
Run: `npm install @auth/prisma-adapter`

### OAuth redirect errors
Make sure redirect URIs in OAuth providers match exactly:
- Development: `http://localhost:3000/api/auth/callback/[provider]`
- Production: `https://yourdomain.com/api/auth/callback/[provider]`

### Database connection errors
1. Check PostgreSQL is running
2. Verify `DATABASE_URL` in `.env`
3. Run `npx prisma migrate dev`

### "Invalid session" errors
1. Clear cookies
2. Check `AUTH_SECRET` is set
3. Verify database session exists

## Testing Auth

1. Start the dev server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Sign In"
4. Try each provider:
   - Google/GitHub (if configured)
   - Credentials (create account first via /register)
5. Should redirect to `/dashboard` on success

## Production Deployment

1. Set `AUTH_SECRET` environment variable (generate new one)
2. Set `NEXTAUTH_URL` to production URL
3. Update OAuth redirect URIs in Google/GitHub
4. Run database migrations: `npx prisma migrate deploy`
5. Ensure `NODE_ENV=production`
6. Set GlitchTip error-tracking variables (see [GlitchTip Error Tracking](#glitchtip-error-tracking) below)

---

## GlitchTip Error Tracking

The app uses the Sentry SDK pointed at a [GlitchTip](https://glitchtip.com) instance for error
monitoring. GlitchTip is fully Sentry-protocol compatible, so all standard Sentry SDK features
work without modification — including error capture, performance tracing, session replay, and
source-map de-obfuscation.

### Environment Variables

Copy these into your `.env.local` (development) or your hosting platform's secret store
(staging / production). See `.env.example` for the full annotated reference.

#### Runtime variables (required at server start)

| Variable | Where used | Description |
|---|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | Browser bundle + `/api/tunnel` | Public DSN from your GlitchTip project. Embedded in the client bundle and used by the tunnel route to validate forwarded envelopes. |
| `SENTRY_DSN` | Server & Edge runtimes | Same DSN (or a separate one) for server-side error capture. Never shipped to the browser. |
| `SENTRY_ENVIRONMENT` | Server & Edge | Deployment environment label — `production`, `staging`, or `development`. Falls back to `"development"` when not set. |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | Browser | Same label exposed to the client SDK. Should match `SENTRY_ENVIRONMENT`. |
| `SENTRY_RELEASE` | Server & Edge | Release identifier (e.g. Git SHA or semver tag). Enables suspect-commit and regression tracking in GlitchTip. |
| `NEXT_PUBLIC_SENTRY_RELEASE` | Browser | Same release identifier for the client SDK. Should match `SENTRY_RELEASE`. |

#### Build-time variables (required during `next build` in CI/CD)

These are consumed by the `@sentry/nextjs` webpack plugin and only need to be present in the
environment where the production build runs — **not** at runtime.

| Variable | Description |
|---|---|
| `SENTRY_URL` | Base URL of your GlitchTip instance, e.g. `https://app.glitchtip.com`. **Must** be set; without it the plugin defaults to `https://sentry.io` and source-map uploads will fail. |
| `SENTRY_ORG` | GlitchTip organisation slug (Settings → Organisation). |
| `SENTRY_PROJECT` | GlitchTip project slug (Settings → Projects). |
| `SENTRY_AUTH_TOKEN` | API auth token with `project:write` scope (User Settings → Auth Tokens). Store as a CI secret — never hard-code. |

#### Optional / convenience variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_VERSION` | Semantic version string (e.g. `"1.2.3"`) exposed to the browser. Can be used to display the running version in the UI. |

### `/api/health` — Health-Check Endpoint

`GET /api/health` is an unauthenticated endpoint designed for uptime monitors and load-balancer
health probes.

**What it checks:** Runs a `SELECT 1` query via Prisma to verify the app can reach its
PostgreSQL database.

**Responses:**

```jsonc
// HTTP 200 — everything is healthy
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "services": {
    "database": "ok"
  }
}

// HTTP 503 — database probe failed
{
  "status": "unhealthy",
  "error": "connect ECONNREFUSED 127.0.0.1:5432"
}
```

**Recommended monitoring setup:**

- Point your uptime monitor (GlitchTip Uptime, UptimeRobot, Better Uptime, etc.) at
  `https://yourdomain.com/api/health`.
- Expect HTTP `200`; alert on anything else.
- The endpoint is intentionally read-only — no authentication is required and it performs no
  mutations.

### `/api/tunnel` — Sentry Envelope Tunnel

`POST /api/tunnel` proxies Sentry error envelopes through the Next.js server so that
browser ad-blockers and privacy extensions cannot block error reports sent to GlitchTip.

**How it works:**

1. The browser Sentry SDK sends envelopes to `/api/tunnel` instead of directly to GlitchTip
   (configured via `tunnel: "/api/tunnel"` in `sentry.client.config.ts`).
2. The route validates that the envelope's DSN host matches the configured `NEXT_PUBLIC_SENTRY_DSN`
   host — this prevents the endpoint from being abused as an open HTTP proxy.
3. Valid envelopes are forwarded verbatim to the correct GlitchTip ingest URL
   (`https://<glitchtip-host>/api/<projectId>/envelope/`).
4. The upstream HTTP status code is returned to the SDK so it can decide whether to retry.

**Security note:** In production the tunnel will refuse to forward envelopes if
`NEXT_PUBLIC_SENTRY_DSN` is not set, because it cannot verify the destination is safe.

### Source-Map Upload

Source maps are uploaded automatically during `next build` by the `@sentry/nextjs` webpack
plugin (configured in `next.config.ts`). Uploaded maps let GlitchTip de-obfuscate minified
stack traces so you see original file names, line numbers, and variable names.

**Key plugin options already configured:**

| Option | Value | Effect |
|---|---|---|
| `widenClientFileUpload` | `true` | Uploads source maps for all client chunks, including lazily-loaded ones. |
| `hideSourceMaps` | `true` | Deletes `.map` files from the build output after upload so they are not served to end-users. |
| `reactComponentAnnotation` | enabled | Adds `data-sentry-component` attributes to the DOM for richer breadcrumbs in replays. |
| `disableLogger` | `true` | Tree-shakes `Sentry.logger.*` calls from the production bundle. |

To verify source maps uploaded correctly after a production build, open a GlitchTip issue,
expand a stack frame, and confirm you see the original TypeScript source instead of the
compiled output.
