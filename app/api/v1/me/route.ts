import { NextRequest, NextResponse } from "next/server";
import { validateAccessToken } from "@/app/lib/oauth";
import { prisma } from "@/app/lib/prisma";

/**
 * GET /api/v1/me
 * Get current user information
 * Requires: read:user scope
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
  if (!tokenData.scopes.includes("read:user")) {
    return NextResponse.json(
      { error: "forbidden", message: "Insufficient scope" },
      { status: 403 }
    );
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: tokenData.userId },
    select: {
      id: true,
      name: true,
      email: true,
      accentColor: true,
      theme: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "not_found", message: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      preferences: {
        accent_color: user.accentColor,
        theme: user.theme,
      },
      created_at: user.createdAt.toISOString(),
    },
  });
}
