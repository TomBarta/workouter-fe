/**
 * GET /api/health
 *
 * Health-check endpoint for uptime monitoring (e.g. GlitchTip, Uptime Robot,
 * AWS ALB target-group checks, Kubernetes liveness/readiness probes).
 *
 * Behaviour
 * ─────────
 * • Runs a raw `SELECT 1` against the database via `prisma.$queryRaw` to
 *   verify that the application can reach and query its primary data store.
 * • Returns HTTP 200 with a JSON body on success:
 *     { status: 'healthy', timestamp: '<ISO-8601>', services: { database: 'ok' } }
 * • Returns HTTP 503 with a JSON body on any failure:
 *     { status: 'unhealthy', error: '<message>' }
 *
 * The endpoint intentionally keeps the error message terse — enough to be
 * actionable in a monitoring dashboard without exposing internal connection
 * strings or stack traces to unauthenticated callers.
 *
 * No authentication is required so that external monitoring services can reach
 * it without credentials.  The route is deliberately read-only (`SELECT 1`)
 * so there is no mutation risk.
 *
 * Cache
 * ─────
 * The `dynamic = 'force-dynamic'` export prevents Next.js from statically
 * caching the response at build time, ensuring every request executes the
 * live database probe.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// Opt out of static generation — every request must hit the live database.
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    // Run a minimal round-trip query.  `SELECT 1` is supported by every
    // SQL-compatible database (PostgreSQL, MySQL, SQLite) and exercises the
    // full connection-pool → database path without touching application tables.
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "healthy",
        timestamp,
        services: {
          database: "ok",
        },
      },
      { status: 200 }
    );
  } catch (err) {
    // Extract a safe, human-readable message from whatever was thrown.
    const message =
      err instanceof Error ? err.message : "Unknown database error";

    console.error("[health] Database probe failed:", err);

    return NextResponse.json(
      {
        status: "unhealthy",
        error: message,
      },
      { status: 503 }
    );
  }
}
