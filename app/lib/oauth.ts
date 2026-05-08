import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface OAuthTokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
}

/**
 * Generates a cryptographically secure random string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Validates an OAuth access token and returns the associated user and scopes
 */
export async function validateAccessToken(token: string) {
  const accessToken = await prisma.oAuthAccessToken.findUnique({
    where: { token },
    include: {
      client: true,
    },
  });

  if (!accessToken) {
    return null;
  }

  // Check if token is expired
  if (accessToken.expiresAt < new Date()) {
    return null;
  }

  return {
    userId: accessToken.userId,
    clientId: accessToken.clientId,
    scopes: accessToken.scope,
  };
}

/**
 * Creates an authorization code for the OAuth flow
 */
export async function createAuthorizationCode({
  clientId,
  userId,
  redirectUri,
  scope,
}: {
  clientId: string;
  userId: string;
  redirectUri: string;
  scope: string[];
}) {
  const code = generateSecureToken(32);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.oAuthAuthorizationCode.create({
    data: {
      code,
      clientId,
      userId,
      redirectUri,
      scope,
      expiresAt,
    },
  });

  return code;
}

/**
 * Exchanges an authorization code for an access token
 */
export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<OAuthTokenResponse | null> {
  // Find the authorization code
  const authCode = await prisma.oAuthAuthorizationCode.findUnique({
    where: { code },
    include: {
      client: true,
    },
  });

  if (!authCode) {
    return null;
  }

  // Validate authorization code
  if (
    authCode.used ||
    authCode.expiresAt < new Date() ||
    authCode.clientId !== clientId ||
    authCode.redirectUri !== redirectUri
  ) {
    return null;
  }

  // Validate client credentials
  const client = authCode.client;
  const secretMatch = await bcrypt.compare(clientSecret, client.clientSecret);

  if (!secretMatch || !client.isActive) {
    return null;
  }

  // Mark code as used
  await prisma.oAuthAuthorizationCode.update({
    where: { code },
    data: { used: true },
  });

  // Generate access token
  const accessToken = generateSecureToken(48);
  const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

  await prisma.oAuthAccessToken.create({
    data: {
      token: accessToken,
      clientId,
      userId: authCode.userId,
      scope: authCode.scope,
      expiresAt,
    },
  });

  return {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600,
    scope: authCode.scope.join(" "),
  };
}

/**
 * Validates client credentials (for client_credentials flow if needed)
 */
export async function validateClient(clientId: string, clientSecret: string) {
  const client = await prisma.oAuthClient.findUnique({
    where: { clientId },
  });

  if (!client || !client.isActive) {
    return null;
  }

  const secretMatch = await bcrypt.compare(clientSecret, client.clientSecret);

  if (!secretMatch) {
    return null;
  }

  return client;
}
