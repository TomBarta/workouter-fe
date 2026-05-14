# OpenObserve RUM Integration

This document describes the OpenObserve Real User Monitoring (RUM) integration in the Workouter frontend application.

## Overview

OpenObserve RUM has been integrated to provide:
- **Real User Monitoring**: Track user sessions, page views, and interactions
- **Session Replay**: Record and replay user sessions (50% sampling in production, 100% in development)
- **Error Tracking**: Automatically forward browser errors to OpenObserve
- **Performance Monitoring**: Track resource loading, long tasks, and user interactions
- **User Context**: Automatically set user information from Auth.js sessions

## Files Added

### 1. `lib/openobserve.ts`
Configuration file for OpenObserve RUM settings. Exports:
- `openobserveConfig`: Base configuration
- `rumConfig`: Configuration for RUM initialization
- `logsConfig`: Configuration for browser logs

### 2. `components/OpenObserveProvider.tsx`
Client component that initializes OpenObserve RUM and logs. Features:
- Initializes RUM only once on browser mount
- Automatically sets user context from Auth.js session
- Clears user context on logout
- Graceful fallback if credentials not configured

### 3. `components/Providers.tsx`
Wrapper component that combines SessionProvider and OpenObserveProvider
for use in the root layout.

### 4. `instrumentation.server.ts`
Server-side OpenTelemetry setup moved from `instrumentation.ts` to prevent
client-side bundling issues.

## Files Modified

### 1. `instrumentation.ts`
Simplified to just conditionally import server-side telemetry setup.

### 2. `app/layout.tsx`
Added `<Providers>` wrapper around children to initialize:
- SessionProvider for Auth.js
- OpenObserveProvider for RUM

### 3. `next.config.ts`
Added webpack configuration to exclude server-only packages from client bundle.

### 4. `.env`
Added OpenObserve environment variables:
```env
NEXT_PUBLIC_OPENOBSERVE_RUM_CLIENT_TOKEN="your-token"
NEXT_PUBLIC_OPENOBSERVE_APPLICATION_ID="workouter-web"
NEXT_PUBLIC_OPENOBSERVE_SITE="api.openobserve.ai"
NEXT_PUBLIC_OPENOBSERVE_ORG_ID="your-org-id"
NEXT_PUBLIC_APP_VERSION="0.0.1"
```

## Configuration

### Environment Variables

All OpenObserve RUM environment variables use the `NEXT_PUBLIC_` prefix to make them available in the browser:

- **NEXT_PUBLIC_OPENOBSERVE_RUM_CLIENT_TOKEN**: Client token for authentication
- **NEXT_PUBLIC_OPENOBSERVE_APPLICATION_ID**: Application identifier (default: "workouter-web")
- **NEXT_PUBLIC_OPENOBSERVE_SITE**: OpenObserve API endpoint (default: "api.openobserve.ai")
- **NEXT_PUBLIC_OPENOBSERVE_ORG_ID**: Organization identifier
- **NEXT_PUBLIC_APP_VERSION**: Application version (default: "0.0.1")

### Privacy Settings

The RUM is configured with:
- `defaultPrivacyLevel: 'mask-user-input'` - Masks user input in session replays
- `sessionSampleRate: 100` - Track 100% of sessions
- `sessionReplaySampleRate: 50` - Record 50% of sessions in production, 100% in development

### Features Enabled

- `trackResources: true` - Monitor resource loading (JS, CSS, images, etc.)
- `trackLongTasks: true` - Track tasks that block the main thread
- `trackUserInteractions: true` - Monitor clicks and user interactions
- `forwardErrorsToLogs: true` - Send browser errors to OpenObserve logs

## User Context

The integration automatically sets user context when a user is authenticated via Auth.js:

```typescript
{
  id: session.user.id || session.user.email || 'unknown',
  name: session.user.name || undefined,
  email: session.user.email || undefined,
}
```

User context is cleared when the user logs out.

## Development vs Production

### Development
- Session replay: 100% sampling
- All features enabled for testing

### Production
- Session replay: 50% sampling to reduce data volume
- All monitoring features enabled

## Troubleshooting

### RUM Not Initializing

Check browser console for:
```
OpenObserve credentials not configured. Skipping RUM initialization.
```

This means the required environment variables are not set. Ensure:
- `NEXT_PUBLIC_OPENOBSERVE_RUM_CLIENT_TOKEN` is set
- `NEXT_PUBLIC_OPENOBSERVE_ORG_ID` is set

### User Context Not Setting

The user context is set automatically when:
1. OpenObserve RUM is initialized
2. Auth.js session status changes to "authenticated"

Check browser console for errors related to `openobserveRum.setUser()`.

## Viewing Data in OpenObserve

1. Log in to OpenObserve dashboard at your configured site (api.openobserve.ai)
2. Navigate to RUM section
3. View:
   - Sessions
   - Session replays
   - Errors
   - Performance metrics
   - User interactions

## Further Reading

- [OpenObserve RUM Documentation](https://openobserve.ai/docs/rum/)
- [OpenObserve Browser SDK](https://github.com/openobserve/openobserve-browser-sdk)
