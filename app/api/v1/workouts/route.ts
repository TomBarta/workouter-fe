import { NextRequest, NextResponse } from "next/server";
import { validateAccessToken } from "@/app/lib/oauth";

/**
 * GET /api/v1/workouts
 * List all workouts for the authenticated user
 * Requires: read:workouts scope
 */
export async function GET(request: NextRequest) {
  // Extract Bearer token
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "unauthorized", message: "Missing or invalid authorization header" },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);

  // Validate token
  const tokenData = await validateAccessToken(token);
  if (!tokenData) {
    return NextResponse.json(
      { error: "unauthorized", message: "Invalid or expired token" },
      { status: 401 }
    );
  }

  // Check scope
  if (!tokenData.scopes.includes("read:workouts")) {
    return NextResponse.json(
      { error: "forbidden", message: "Insufficient scope" },
      { status: 403 }
    );
  }

  // Return empty array for now - implement when workout model is added
  return NextResponse.json({
    workouts: [],
    total: 0,
  });
}

/**
 * POST /api/v1/workouts
 * Create a new workout
 * Requires: write:workouts scope
 */
export async function POST(request: NextRequest) {
  // Extract Bearer token
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "unauthorized", message: "Missing or invalid authorization header" },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);

  // Validate token
  const tokenData = await validateAccessToken(token);
  if (!tokenData) {
    return NextResponse.json(
      { error: "unauthorized", message: "Invalid or expired token" },
      { status: 401 }
    );
  }

  // Check scope
  if (!tokenData.scopes.includes("write:workouts")) {
    return NextResponse.json(
      { error: "forbidden", message: "Insufficient scope" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    // Validate body (add proper validation with Zod in production)
    if (!body.name || !body.steps) {
      return NextResponse.json(
        { error: "invalid_request", message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Placeholder response - implement when workout model is added
    return NextResponse.json(
      {
        message: "Workout creation endpoint ready",
        data: body,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Invalid JSON body" },
      { status: 400 }
    );
  }
}
