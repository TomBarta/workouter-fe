/**
 * POST /api/tunnel
 *
 * A Sentry "tunnel" endpoint that proxies Sentry envelopes through the
 * Next.js server so that browser ad-blockers and privacy extensions cannot
 * block error reports sent to GlitchTip.
 *
 * How Sentry envelopes work
 * ─────────────────────────
 * An envelope is a newline-delimited text payload.  The very first line is a
 * JSON object called the "envelope header".  It always contains a `dsn` field
 * whose value is the project DSN the SDK was initialised with:
 *
 *   {"event_id":"...","sent_at":"...","dsn":"https://<key>@<host>/<projectId>"}
 *   {"type":"event"}
 *   {"exception":{"values":[...]}, ...}
 *
 * This handler:
 *   1. Reads the raw request body as text.
 *   2. Extracts the envelope header from the first line.
 *   3. Parses the DSN to derive the upstream GlitchTip ingest URL.
 *   4. Validates that the DSN host matches the configured GlitchTip host so
 *      the tunnel cannot be abused as an open proxy to arbitrary servers.
 *   5. Forwards the complete, unmodified body to the correct GlitchTip
 *      envelope endpoint.
 *   6. Returns the upstream HTTP status code to the SDK.
 *
 * Environment variables
 * ─────────────────────
 *   NEXT_PUBLIC_SENTRY_DSN  — The GlitchTip DSN (required).  Used to derive
 *                             the allowed upstream host for the security check.
 *
 * References
 * ──────────
 *   https://docs.sentry.io/platforms/javascript/troubleshooting/#using-the-tunnel-option
 *   https://develop.sentry.dev/sdk/envelopes/
 */

import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

// Maximum envelope size to prevent DoS attacks (1MB)
const MAX_ENVELOPE_SIZE = 1024 * 1024;

// Opt into Node.js runtime for better error handling and logging
export const runtime = "nodejs";

// Force dynamic behavior to ensure fresh validation on every request
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Shape of the first line of every Sentry envelope payload. */
interface EnvelopeHeader {
  dsn?: string;
  event_id?: string;
  sent_at?: string;
  sdk?: {
    name?: string;
    version?: string;
  };
  trace?: {
    trace_id?: string;
    public_key?: string;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse the DSN string and return its constituent parts.
 *
 * A Sentry/GlitchTip DSN follows the URL format:
 *   https://<publicKey>@<host>/<projectId>
 *
 * Returns `null` when the value is missing or cannot be parsed as a URL.
 */
function parseDsn(
  dsn: string
): { host: string; projectId: string; publicKey: string } | null {
  let url: URL;

  try {
    url = new URL(dsn);
  } catch {
    return null;
  }

  // The path is "/<projectId>" — strip the leading slash.
  const projectId = url.pathname.replace(/^\//, "").trim();

  if (!projectId) {
    return null;
  }

  // The public key is the username component of the authority.
  const publicKey = url.username;

  if (!publicKey) {
    return null;
  }

  // host includes the port when non-standard, e.g. "app.glitchtip.com:443".
  const host = url.host;

  return { host, projectId, publicKey };
}

/**
 * Build the GlitchTip / Sentry envelope ingest URL from the parsed DSN parts.
 *
 * GlitchTip mirrors the Sentry envelope endpoint path exactly:
 *   https://<host>/api/<projectId>/envelope/
 */
function buildUpstreamUrl(dsn: string): string | null {
  let url: URL;

  try {
    url = new URL(dsn);
  } catch {
    return null;
  }

  const projectId = url.pathname.replace(/^\//, "").trim();

  if (!projectId) {
    return null;
  }

  // Reconstruct origin (scheme + host) without credentials so we don't
  // forward the public key as part of the upstream URL — GlitchTip reads the
  // key from the envelope header, not the request URL.
  const origin = `${url.protocol}//${url.host}`;

  return `${origin}/api/${projectId}/envelope/`;
}

/**
 * Derive the allowed upstream host from the server-side DSN env var.
 *
 * We use NEXT_PUBLIC_SENTRY_DSN because it is the same DSN the browser SDK is
 * initialised with (see sentry.client.config.ts).  The public key is already
 * visible in the client bundle so there is no secret-exposure risk here.
 *
 * Returns `null` when the variable is not set or cannot be parsed.
 */
function getAllowedHost(): string | null {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    return null;
  }

  const parsed = parseDsn(dsn);

  return parsed ? parsed.host : null;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // -------------------------------------------------------------------------
  // 1. Read the raw envelope body as text.
  //    We must not call request.json() / request.formData() etc. because the
  //    Sentry envelope format is newline-delimited text, not JSON.
  // -------------------------------------------------------------------------
  let envelopeBody: string;

  try {
    envelopeBody = await request.text();
  } catch {
    return NextResponse.json(
      { error: "Failed to read request body" },
      { status: 400 }
    );
  }

  if (!envelopeBody) {
    return NextResponse.json(
      { error: "Empty request body" },
      { status: 400 }
    );
  }

  // Check envelope size to prevent DoS attacks
  if (envelopeBody.length > MAX_ENVELOPE_SIZE) {
    return NextResponse.json(
      { error: "Envelope payload too large" },
      { status: 413 }
    );
  }

  // -------------------------------------------------------------------------
  // 2. Extract the envelope header from the first line.
  //    The Sentry envelope spec guarantees the first line is always a JSON
  //    object (the envelope header).
  // -------------------------------------------------------------------------
  const firstNewline = envelopeBody.indexOf("\n");
  const envelopeHeaderLine =
    firstNewline === -1 ? envelopeBody : envelopeBody.slice(0, firstNewline);

  let envelopeHeader: EnvelopeHeader;

  try {
    envelopeHeader = JSON.parse(envelopeHeaderLine) as EnvelopeHeader;
  } catch {
    return NextResponse.json(
      { error: "Invalid envelope header — first line is not valid JSON" },
      { status: 400 }
    );
  }

  // -------------------------------------------------------------------------
  // 3. Extract and validate the DSN from the envelope header.
  // -------------------------------------------------------------------------
  const dsn = envelopeHeader.dsn;

  if (!dsn || typeof dsn !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid `dsn` field in envelope header" },
      { status: 400 }
    );
  }

  const parsed = parseDsn(dsn);

  if (!parsed) {
    return NextResponse.json(
      { error: "Could not parse DSN from envelope header" },
      { status: 400 }
    );
  }

  // Validate project ID format (should be numeric)
  if (!/^\d+$/.test(parsed.projectId)) {
    return NextResponse.json(
      { error: "Invalid project ID format" },
      { status: 400 }
    );
  }

  // -------------------------------------------------------------------------
  // 4. Security check — only forward envelopes to the configured GlitchTip
  //    host.  This prevents the tunnel from being abused as an open HTTP proxy
  //    that could exfiltrate data to arbitrary third-party servers.
  // -------------------------------------------------------------------------
  const allowedHost = getAllowedHost();

  if (allowedHost && parsed.host !== allowedHost) {
    return NextResponse.json(
      {
        error: `DSN host '${parsed.host}' does not match configured host '${allowedHost}'`,
      },
      { status: 400 }
    );
  }

  // Warn in development when the env var is absent — the host check is skipped
  // but we still forward the envelope so local testing works without full env
  // setup.
  if (!allowedHost && process.env.NODE_ENV !== "production") {
    console.warn(
      "[tunnel] NEXT_PUBLIC_SENTRY_DSN is not set — skipping host validation. " +
        "Set the variable in .env.local to enable the security check."
    );
  }

  // In production the absence of the env var is a hard error: we refuse to
  // forward because we cannot verify the destination is safe.
  if (!allowedHost && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Tunnel is not configured — NEXT_PUBLIC_SENTRY_DSN is not set" },
      { status: 500 }
    );
  }

  // -------------------------------------------------------------------------
  // 5. Build the upstream GlitchTip envelope URL.
  // -------------------------------------------------------------------------
  const upstreamUrl = buildUpstreamUrl(dsn);

  if (!upstreamUrl) {
    return NextResponse.json(
      { error: "Could not construct upstream URL from DSN" },
      { status: 400 }
    );
  }

  // -------------------------------------------------------------------------
  // 6. Forward the raw envelope body to GlitchTip.
  //    We pass the body through unchanged — GlitchTip reads the project key
  //    and other metadata from the envelope header itself, not from the URL or
  //    extra headers.
  // -------------------------------------------------------------------------
  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        // The Sentry envelope content type is required by the ingest server.
        "Content-Type": "application/x-sentry-envelope",
      },
      body: envelopeBody,
    });
  } catch (err) {
    // Network-level failure (DNS, TCP, TLS …)
    console.error("[tunnel] Failed to reach GlitchTip upstream:", err);

    return NextResponse.json(
      { error: "Failed to reach upstream GlitchTip ingest endpoint" },
      { status: 502 }
    );
  }

  // -------------------------------------------------------------------------
  // 7. Return the upstream HTTP status code to the Sentry SDK.
  //    The SDK uses this status to decide whether to retry the envelope.
  //    We intentionally do not forward upstream response headers or body to
  //    avoid leaking server-side information to the browser.
  // -------------------------------------------------------------------------
  return new NextResponse(null, { status: upstreamResponse.status });
}
