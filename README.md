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

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Features

### Authentication
- NextAuth.js v5 with OAuth providers (Google, GitHub)
- Credentials-based authentication
- Protected routes with middleware

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
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run Vitest tests

## Next Steps

1. Add workout model to Prisma schema
2. Implement workout builder UI
3. Add Apple Watch / Garmin export functionality
4. Create API client management UI (`/dashboard/api-clients`)
5. Add theme toggle functionality
6. Implement user settings page

## License

Private project.
