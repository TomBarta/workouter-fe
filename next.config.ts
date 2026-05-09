import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// ---------------------------------------------------------------------------
// Base Next.js configuration
// ---------------------------------------------------------------------------
const nextConfig: NextConfig = {
  /* config options here */
};

// ---------------------------------------------------------------------------
// Sentry / GlitchTip build-time configuration
//
// withSentryConfig wraps the Next.js config to:
//   1. Inject the Sentry webpack plugin that uploads source maps at build time.
//   2. Auto-instrument server components, API routes, and middleware.
//   3. Tree-shake Sentry logger statements from production bundles.
//
// All options below are controlled by environment variables so the same
// next.config.ts works across local dev, CI, staging, and production without
// modification.
//
// Required environment variables (set in .env.local or your CI/CD platform):
//   SENTRY_URL          — Base URL of your GlitchTip instance
//                         e.g. https://app.glitchtip.com
//   SENTRY_ORG          — GlitchTip organisation slug
//   SENTRY_PROJECT      — GlitchTip project slug
//   SENTRY_AUTH_TOKEN   — API token with project:write scope (for source maps)
//
// See .env.example for the full list of variables used across all Sentry
// config files (client / server / edge).
// ---------------------------------------------------------------------------
export default withSentryConfig(nextConfig, {
  // -------------------------------------------------------------------------
  // GlitchTip instance URL
  // The Sentry webpack plugin uses this as the base URL when communicating
  // with the GlitchTip API (e.g. to create releases and upload source maps).
  // Defaults to https://sentry.io when omitted, so this MUST be set to point
  // at your self-hosted GlitchTip deployment.
  // -------------------------------------------------------------------------
  url: process.env.SENTRY_URL,

  // -------------------------------------------------------------------------
  // Organisation & project slugs
  // These identify which GlitchTip project receives the uploaded source maps
  // and release artifacts.  They must match exactly what is shown in the
  // GlitchTip dashboard (Settings → Projects).
  // -------------------------------------------------------------------------
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // -------------------------------------------------------------------------
  // Auth token — required for source-map upload
  // Create a token at GlitchTip → User Settings → Auth Tokens with at least
  // the project:write scope, then expose it as SENTRY_AUTH_TOKEN in CI.
  // -------------------------------------------------------------------------
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // -------------------------------------------------------------------------
  // widenClientFileUpload
  // By default the Sentry webpack plugin only uploads source maps for files
  // that are directly referenced by a Sentry stack frame.  Enabling this
  // option uploads ALL client-side files so that even lazily-loaded chunks
  // and dynamic imports are de-obfuscated in GlitchTip stack traces.
  // -------------------------------------------------------------------------
  widenClientFileUpload: true,

  // -------------------------------------------------------------------------
  // hideSourceMaps
  // Prevents client-side source maps from being served to end users while
  // still making them available to GlitchTip for stack-trace de-obfuscation.
  // The plugin deletes the .map files from the Next.js output after upload.
  // -------------------------------------------------------------------------
  hideSourceMaps: true,

  // -------------------------------------------------------------------------
  // disableLogger
  // Tree-shakes all Sentry.logger.* calls (debug / info / warn / error) from
  // the production bundle, reducing bundle size and avoiding accidental
  // exposure of internal diagnostic messages to users.
  // -------------------------------------------------------------------------
  disableLogger: true,

  // -------------------------------------------------------------------------
  // reactComponentAnnotation
  // Instruments React components at build time to add data-sentry-component
  // and data-sentry-element attributes to the rendered DOM.  These annotations
  // appear in GlitchTip breadcrumbs and replays, making it much easier to
  // identify which component triggered an error without reading raw JSX paths.
  // -------------------------------------------------------------------------
  reactComponentAnnotation: {
    enabled: true,
  },

  // -------------------------------------------------------------------------
  // Silent mode
  // Suppresses the Sentry webpack plugin's verbose build output (progress bars,
  // upload confirmations, etc.) so CI logs stay readable.  Remove or set to
  // false if you need to debug source-map upload issues.
  // -------------------------------------------------------------------------
  silent: true,
});
