/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically called by Next.js when the server starts.
 * It's the recommended place to initialize monitoring SDKs and other
 * server-side instrumentation.
 *
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * This application uses two observability solutions:
 *   - Sentry/GlitchTip for error tracking and performance monitoring
 *   - OpenObserve for distributed tracing, metrics, and structured logs
 */

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize Sentry for Node.js server runtime
    await import("./sentry.server.config");

    // Initialize OpenTelemetry for distributed tracing
    const { initServerTelemetry } = await import('./instrumentation.server');
    await initServerTelemetry();
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Initialize Sentry for Edge runtime (middleware, edge functions)
    await import("./sentry.edge.config");
  }
}
