// This file configures the Sentry SDK for the Node.js server runtime.
// It is automatically picked up by the Next.js + Sentry integration.
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
  // GlitchTip is Sentry-protocol compatible, so the standard Sentry SDK works
  // against it as-is. Point SENTRY_DSN at your GlitchTip project DSN.
  // This is a server-only env var (no NEXT_PUBLIC_ prefix) so it is never
  // shipped to the browser bundle.
  // ---------------------------------------------------------------------------
  dsn: process.env.SENTRY_DSN,

  // ---------------------------------------------------------------------------
  // Environment & release
  // These are injected at build / deploy time (e.g. by CI or Vercel).
  //   SENTRY_ENVIRONMENT  — "production" | "staging" | "development"
  //   SENTRY_RELEASE      — typically the git SHA or package version
  // ---------------------------------------------------------------------------
  environment: process.env.SENTRY_ENVIRONMENT ?? "development",
  release: process.env.SENTRY_RELEASE,

  // ---------------------------------------------------------------------------
  // Performance tracing
  // Capture 10 % of server-side transactions in production to keep the volume
  // manageable; use 100 % in all other environments for full observability.
  // ---------------------------------------------------------------------------
  tracesSampleRate:
    process.env.SENTRY_ENVIRONMENT === "production" ? 0.1 : 1.0,

  // ---------------------------------------------------------------------------
  // Integrations
  // prismaIntegration() instruments the Prisma client via AsyncLocalStorage so
  // that every database query appears as a child span of the active
  // transaction. This gives full request → DB visibility in GlitchTip / Sentry.
  // ---------------------------------------------------------------------------
  integrations: [
    Sentry.prismaIntegration(),
  ],

  // ---------------------------------------------------------------------------
  // beforeSend — drop events that are pure 401 Unauthorized noise.
  // These typically come from unauthenticated API calls that are expected
  // (e.g. probing session state on page load) and do not represent bugs.
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
