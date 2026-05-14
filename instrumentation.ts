/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically called by Next.js when the server starts.
 * It's the recommended place to initialize monitoring SDKs and other
 * server-side instrumentation.
 *
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Initialize Sentry for Node.js server runtime
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  // Initialize Sentry for Edge runtime (middleware, edge functions)
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
