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
