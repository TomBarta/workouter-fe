// This file configures the Sentry SDK for the Edge runtime (middleware, Edge
// API routes, Edge Server Components).  It is automatically picked up by the
// Next.js + Sentry integration when the "sentry.edge.config" entrypoint is
// referenced in next.config.ts / next.config.js.
//
// IMPORTANT — Edge runtime constraints
// ─────────────────────────────────────
// The Edge runtime is a strict subset of the browser Web APIs.  It does NOT
// support Node.js built-ins (fs, net, AsyncLocalStorage, etc.), so:
//   • No Prisma / database integrations.
//   • No Node profiling integrations.
//   • Only Web-compatible Sentry features are available here.
//
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

/**
 * Helper to safely extract HTTP status code from a Sentry event
 */
function getResponseStatusCode(event: Sentry.Event): number | undefined {
  const response = event.contexts?.response;
  if (
    response &&
    typeof response === "object" &&
    "status_code" in response &&
    typeof response.status_code === "number"
  ) {
    return response.status_code;
  }
  return undefined;
}

Sentry.init({
  // ---------------------------------------------------------------------------
  // Core — GlitchTip DSN
  // GlitchTip is fully Sentry-protocol compatible, so the standard Sentry SDK
  // communicates with it without modification.
  //
  // SENTRY_DSN is a server-only environment variable (no NEXT_PUBLIC_ prefix)
  // so it is never shipped to the browser bundle.  It must be set in the
  // deployment environment (e.g. Vercel project settings, .env.local for local
  // dev) and will be read at Edge-function initialisation time.
  //
  // Example value:
  //   SENTRY_DSN=https://<key>@app.glitchtip.com/<project-id>
  // ---------------------------------------------------------------------------
  dsn: process.env.SENTRY_DSN,

  // ---------------------------------------------------------------------------
  // Environment & release
  // Injected at build / deploy time (e.g. by CI or Vercel system env vars).
  //
  //   SENTRY_ENVIRONMENT  — "production" | "staging" | "development"
  //   SENTRY_RELEASE      — typically the git SHA or semantic version string
  //
  // Falls back to "development" when the variable is absent so that local
  // testing never silently attributes events to an unknown environment.
  // ---------------------------------------------------------------------------
  environment: process.env.SENTRY_ENVIRONMENT ?? "development",
  release: process.env.SENTRY_RELEASE,

  // ---------------------------------------------------------------------------
  // Performance tracing
  // Keep the sample rate minimal in production to avoid overwhelming the
  // GlitchTip ingest quota.  Use 100 % in staging / development so every
  // trace is visible during active development and QA.
  //
  //   Production  → 10 %  (0.1)
  //   Other envs  → 100 % (1.0)
  // ---------------------------------------------------------------------------
  tracesSampleRate:
    process.env.SENTRY_ENVIRONMENT === "production" ? 0.1 : 1.0,

  // ---------------------------------------------------------------------------
  // beforeSend — drop events that are pure 401 Unauthorized noise.
  // These typically arise from legitimate unauthenticated requests (e.g.
  // middleware checking session state) and do not represent application bugs.
  // Filtering them server-side keeps the GlitchTip issue list clean and avoids
  // consuming ingest quota on expected, benign errors.
  // ---------------------------------------------------------------------------
  beforeSend(event) {
    const exceptions = event.exception?.values ?? [];

    for (const exception of exceptions) {
      const message = exception.value ?? "";

      // Only drop if it's specifically an HTTP auth-related error
      if (
        (exception.type === "HTTPError" ||
          exception.type === "FetchError" ||
          exception.type === "Error") &&
        (/^(Unauthorized|401 Unauthorized)$/i.test(message) ||
          /^401:\s/i.test(message))
      ) {
        return null; // returning null drops the event entirely
      }
    }

    // Also drop if the event itself carries a 401 status code in its response context
    const statusCode = getResponseStatusCode(event);

    if (statusCode === 401) {
      return null;
    }

    return event;
  },
});
