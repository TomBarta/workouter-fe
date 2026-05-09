import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import { validateAccessToken } from "@/app/lib/oauth";
import logger from "@/app/lib/logger";

/**
 * Named tracer for all spans originating from the workouts route.
 * Using a stable, reverse-DNS-style scope name lets OpenObserve dashboards
 * filter on the instrumentation scope independently of the service name.
 */
const tracer = trace.getTracer("workouter-fe/api/v1/workouts");

/**
 * GET /api/v1/workouts
 * List all workouts for the authenticated user
 * Requires: read:workouts scope
 */
export async function GET(request: NextRequest) {
  return tracer.startActiveSpan("GET /api/v1/workouts", async (span) => {
    try {
      // Extract Bearer token
      const authHeader = request.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        logger.info("GET /api/v1/workouts — missing or invalid authorization header", {
          route: "GET /api/v1/workouts",
        });
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Missing or invalid authorization header",
        });
        return NextResponse.json(
          { error: "unauthorized", message: "Missing or invalid authorization header" },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);

      // Validate token
      const tokenData = await validateAccessToken(token);
      if (!tokenData) {
        logger.info("GET /api/v1/workouts — invalid or expired token", {
          route: "GET /api/v1/workouts",
        });
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Invalid or expired token",
        });
        return NextResponse.json(
          { error: "unauthorized", message: "Invalid or expired token" },
          { status: 401 }
        );
      }

      // Record the authenticated user on the active span so it is searchable
      // in OpenObserve without needing to parse the log message.
      span.setAttribute("user.id", tokenData.userId);

      logger.info("GET /api/v1/workouts — authenticated", {
        route: "GET /api/v1/workouts",
        userId: tokenData.userId,
      });

      // Check scope
      if (!tokenData.scopes.includes("read:workouts")) {
        logger.info("GET /api/v1/workouts — insufficient scope", {
          route: "GET /api/v1/workouts",
          userId: tokenData.userId,
        });
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Insufficient scope",
        });
        return NextResponse.json(
          { error: "forbidden", message: "Insufficient scope" },
          { status: 403 }
        );
      }

      // Wrap the database query in a child span so the latency is clearly
      // separated from the auth and serialisation work in trace waterfall views.
      const result = await tracer.startActiveSpan(
        "db.query.workouts",
        {
          attributes: {
            "db.system": "postgresql",
            "db.operation": "findMany",
          },
        },
        async (dbSpan) => {
          try {
            // Placeholder query result — implement when the Workout Prisma
            // model is added to the schema.
            const workouts: unknown[] = [];

            dbSpan.setStatus({ code: SpanStatusCode.OK });
            return workouts;
          } catch (dbErr) {
            dbSpan.setStatus({
              code: SpanStatusCode.ERROR,
              message: dbErr instanceof Error ? dbErr.message : String(dbErr),
            });
            dbSpan.recordException(
              dbErr instanceof Error ? dbErr : new Error(String(dbErr))
            );
            throw dbErr;
          } finally {
            dbSpan.end();
          }
        }
      );

      logger.info("GET /api/v1/workouts — success", {
        route: "GET /api/v1/workouts",
        userId: tokenData.userId,
        count: result.length,
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return NextResponse.json({
        workouts: result,
        total: result.length,
      });
    } catch (err) {
      // Capture exception in both GlitchTip and OpenObserve
      Sentry.captureException(err, {
        tags: {
          endpoint: "/api/v1/workouts",
          method: "GET",
        },
      });

      logger.error("GET /api/v1/workouts — unhandled error", {
        route: "GET /api/v1/workouts",
        error: err instanceof Error ? err.message : String(err),
      });
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err instanceof Error ? err.message : String(err),
      });
      span.recordException(
        err instanceof Error ? err : new Error(String(err))
      );
      return NextResponse.json(
        { error: "server_error", message: "An unexpected error occurred" },
        { status: 500 }
      );
    } finally {
      span.end();
    }
  });
}

/**
 * POST /api/v1/workouts
 * Create a new workout
 * Requires: write:workouts scope
 */
export async function POST(request: NextRequest) {
  return tracer.startActiveSpan("POST /api/v1/workouts", async (span) => {
    try {
      // Extract Bearer token
      const authHeader = request.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        logger.info("POST /api/v1/workouts — missing or invalid authorization header", {
          route: "POST /api/v1/workouts",
        });
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Missing or invalid authorization header",
        });
        return NextResponse.json(
          { error: "unauthorized", message: "Missing or invalid authorization header" },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);

      // Validate token
      const tokenData = await validateAccessToken(token);
      if (!tokenData) {
        logger.info("POST /api/v1/workouts — invalid or expired token", {
          route: "POST /api/v1/workouts",
        });
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Invalid or expired token",
        });
        return NextResponse.json(
          { error: "unauthorized", message: "Invalid or expired token" },
          { status: 401 }
        );
      }

      // Record the authenticated user on the active span.
      span.setAttribute("user.id", tokenData.userId);

      logger.info("POST /api/v1/workouts — authenticated", {
        route: "POST /api/v1/workouts",
        userId: tokenData.userId,
      });

      // Check scope
      if (!tokenData.scopes.includes("write:workouts")) {
        logger.info("POST /api/v1/workouts — insufficient scope", {
          route: "POST /api/v1/workouts",
          userId: tokenData.userId,
        });
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Insufficient scope",
        });
        return NextResponse.json(
          { error: "forbidden", message: "Insufficient scope" },
          { status: 403 }
        );
      }

      // Parse and validate the request body.
      let body: { name?: unknown; steps?: unknown };
      try {
        body = await request.json();
      } catch (parseErr) {
        logger.error("POST /api/v1/workouts — invalid JSON body", {
          route: "POST /api/v1/workouts",
          userId: tokenData.userId,
          error: parseErr instanceof Error ? parseErr.message : String(parseErr),
        });
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Invalid JSON body",
        });
        span.recordException(
          parseErr instanceof Error ? parseErr : new Error(String(parseErr))
        );
        return NextResponse.json(
          { error: "invalid_request", message: "Invalid JSON body" },
          { status: 400 }
        );
      }

      if (!body.name || !body.steps) {
        logger.info("POST /api/v1/workouts — missing required fields", {
          route: "POST /api/v1/workouts",
          userId: tokenData.userId,
        });
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Missing required fields",
        });
        return NextResponse.json(
          { error: "invalid_request", message: "Missing required fields" },
          { status: 400 }
        );
      }

      // Wrap the database write in a child span.
      const created = await tracer.startActiveSpan(
        "db.query.workouts",
        {
          attributes: {
            "db.system": "postgresql",
            "db.operation": "create",
          },
        },
        async (dbSpan) => {
          try {
            // Placeholder — implement once the Workout Prisma model exists.
            const record = body;

            dbSpan.setStatus({ code: SpanStatusCode.OK });
            return record;
          } catch (dbErr) {
            dbSpan.setStatus({
              code: SpanStatusCode.ERROR,
              message: dbErr instanceof Error ? dbErr.message : String(dbErr),
            });
            dbSpan.recordException(
              dbErr instanceof Error ? dbErr : new Error(String(dbErr))
            );
            throw dbErr;
          } finally {
            dbSpan.end();
          }
        }
      );

      logger.info("POST /api/v1/workouts — success", {
        route: "POST /api/v1/workouts",
        userId: tokenData.userId,
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return NextResponse.json(
        {
          message: "Workout creation endpoint ready",
          data: created,
        },
        { status: 201 }
      );
    } catch (err) {
      // Capture exception in both GlitchTip and OpenObserve
      Sentry.captureException(err, {
        tags: {
          endpoint: "/api/v1/workouts",
          method: "POST",
        },
      });

      logger.error("POST /api/v1/workouts — unhandled error", {
        route: "POST /api/v1/workouts",
        error: err instanceof Error ? err.message : String(err),
      });
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err instanceof Error ? err.message : String(err),
      });
      span.recordException(
        err instanceof Error ? err : new Error(String(err))
      );
      return NextResponse.json(
        { error: "server_error", message: "An unexpected error occurred" },
        { status: 500 }
      );
    } finally {
      span.end();
    }
  });
}
