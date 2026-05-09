// This file configures the Sentry SDK for the browser (client-side).
// It is automatically picked up by the Next.js + Sentry integration.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // ---------------------------------------------------------------------------
  // Core — GlitchTip DSN
  // GlitchTip is Sentry-protocol compatible, so the standard Sentry SDK works
  // against it as-is. Point NEXT_PUBLIC_SENTRY_DSN at your GlitchTip project DSN.
  // ---------------------------------------------------------------------------
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // ---------------------------------------------------------------------------
  // Environment & release
  // ---------------------------------------------------------------------------
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "development",
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  // ---------------------------------------------------------------------------
  // Tunnel — proxy Sentry envelopes through our own API route so that
  // ad-blockers and privacy extensions cannot block error reports.
  // ---------------------------------------------------------------------------
  tunnel: "/api/tunnel",

  // ---------------------------------------------------------------------------
  // Performance tracing
  // ---------------------------------------------------------------------------
  // Capture 10 % of transactions in production; increase for staging/dev.
  tracesSampleRate:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === "production" ? 0.1 : 1.0,

  // ---------------------------------------------------------------------------
  // Session Replay
  // Record 10 % of all sessions, but always capture sessions containing errors.
  // ---------------------------------------------------------------------------
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      // Mask all text content and block all media by default to protect PII.
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // ---------------------------------------------------------------------------
  // beforeSend — drop events that are pure 401 Unauthorized noise.
  // These typically come from unauthenticated API calls that are expected
  // (e.g. probing session state on page load) and do not represent bugs.
  // ---------------------------------------------------------------------------
  beforeSend(event) {
    // Drop events whose primary exception value contains "Unauthorized" or
    // whose HTTP response status is 401.
    const exceptions = event.exception?.values ?? [];

    for (const exception of exceptions) {
      const message = exception.value ?? "";

      if (
        /unauthorized/i.test(message) ||
        /401/i.test(message)
      ) {
        return null; // returning null drops the event entirely
      }
    }

    // Also drop if the event itself carries a 401 status code in its request
    // context (some SDKs surface this differently).
    const statusCode = (event.contexts?.response as { status_code?: number } | undefined)
      ?.status_code;

    if (statusCode === 401) {
      return null;
    }

    return event;
  },
});
