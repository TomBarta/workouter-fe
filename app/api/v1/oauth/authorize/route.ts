import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { createAuthorizationCode } from "@/app/lib/oauth";

/**
 * OAuth 2.0 Authorization Endpoint
 * GET /api/v1/oauth/authorize
 *
 * Query params:
 * - response_type: "code"
 * - client_id: OAuth client ID
 * - redirect_uri: Where to redirect after authorization
 * - scope: Space-separated list of requested scopes
 * - state: Optional state parameter for CSRF protection
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const responseType = searchParams.get("response_type");
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const scope = searchParams.get("scope");
  const state = searchParams.get("state");

  // Validate required parameters
  if (
    !responseType ||
    responseType !== "code" ||
    !clientId ||
    !redirectUri ||
    !scope
  ) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Missing or invalid parameters" },
      { status: 400 }
    );
  }

  // Check if user is authenticated
  const session = await auth();
  if (!session?.user?.id) {
    // Redirect to login with callback
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Validate client
  const client = await prisma.oAuthClient.findUnique({
    where: { clientId },
  });

  if (!client || !client.isActive) {
    return NextResponse.json(
      { error: "invalid_client", error_description: "Client not found or inactive" },
      { status: 400 }
    );
  }

  // Validate redirect URI
  if (!client.redirectUris.includes(redirectUri)) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Invalid redirect_uri" },
      { status: 400 }
    );
  }

  // Parse and validate scopes
  const requestedScopes = scope.split(" ");
  const validScopes = requestedScopes.filter((s) =>
    client.allowedScopes.includes(s)
  );

  if (validScopes.length === 0) {
    return NextResponse.json(
      { error: "invalid_scope", error_description: "No valid scopes requested" },
      { status: 400 }
    );
  }

  // Create authorization code
  const code = await createAuthorizationCode({
    clientId,
    userId: session.user.id,
    redirectUri,
    scope: validScopes,
  });

  // Redirect back to client with code
  const redirectUrl = new URL(redirectUri);
  redirectUrl.searchParams.set("code", code);
  if (state) {
    redirectUrl.searchParams.set("state", state);
  }

  return NextResponse.redirect(redirectUrl);
}
