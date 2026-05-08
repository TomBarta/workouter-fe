import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/app/lib/oauth";

/**
 * OAuth 2.0 Token Endpoint
 * POST /api/v1/oauth/token
 *
 * Body params (application/x-www-form-urlencoded):
 * - grant_type: "authorization_code"
 * - code: Authorization code from /authorize
 * - redirect_uri: Same redirect_uri used in /authorize
 * - client_id: OAuth client ID
 * - client_secret: OAuth client secret
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const grantType = formData.get("grant_type") as string;
    const code = formData.get("code") as string;
    const redirectUri = formData.get("redirect_uri") as string;
    const clientId = formData.get("client_id") as string;
    const clientSecret = formData.get("client_secret") as string;

    // Validate required parameters
    if (!grantType || !code || !redirectUri || !clientId || !clientSecret) {
      return NextResponse.json(
        {
          error: "invalid_request",
          error_description: "Missing required parameters",
        },
        { status: 400 }
      );
    }

    // Only support authorization_code grant type
    if (grantType !== "authorization_code") {
      return NextResponse.json(
        {
          error: "unsupported_grant_type",
          error_description: "Only authorization_code grant type is supported",
        },
        { status: 400 }
      );
    }

    // Exchange code for token
    const tokenResponse = await exchangeCodeForToken(
      code,
      clientId,
      clientSecret,
      redirectUri
    );

    if (!tokenResponse) {
      return NextResponse.json(
        {
          error: "invalid_grant",
          error_description: "Invalid or expired authorization code",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(tokenResponse);
  } catch (error) {
    console.error("Token exchange error:", error);
    return NextResponse.json(
      {
        error: "server_error",
        error_description: "An error occurred while processing the request",
      },
      { status: 500 }
    );
  }
}
