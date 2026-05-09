/**
 * app/api/telemetry/traces/route.ts — Browser-to-OpenObserve OTLP trace proxy
 *
 * WHY THIS FILE EXISTS
 * ─────────────────────────────────────────────────────────────────────────────
 * Browser-based OpenTelemetry SDKs (e.g. @opentelemetry/sdk-trace-web with an
 * OTLPTraceExporter) need to ship spans to a collector endpoint.  Calling the
 * OpenObserve OTLP endpoint directly from the browser would require embedding
 * HTTP Basic-Auth credentials in the client bundle — exposing them to anyone
 * who opens DevTools.
 *
 * This Next.js App-Router POST handler acts as a thin, server-side reverse
 * proxy:
 *
 *   Browser (OTLPTraceExporter)
 *       │
 *       │  POST /api/telemetry/traces   (no auth, same origin)
 *       ▼
 *   Next.js server  ◄── this file
 *       │
 *       │  POST OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
 *       │  Authorization: Basic <base64(USERNAME:PASSWORD)>
 *       ▼
 *   OpenObserve OTLP/HTTP traces endpoint
 *
 * Credentials (OPENOBSERVE_USERNAME / OPENOBSERVE_PASSWORD) are read from
 * server-side environment variables and are never included in any response
 * sent back to the browser.
 *
 * REQUEST CONTRACT
 * ─────────────────────────────────────────────────────────────────────────────
 * Method  : POST
 * Path    : /api/telemetry/traces
 * Body    : Raw binary (Protobuf) or JSON OTLP trace export payload — whatever
 *           the browser OTLPTraceExporter sends.  The body is forwarded byte-
 *           for-byte without deserialisation.
 * Headers : The Content-Type header from the browser request is forwarded
 *           intact so that the OpenObserve receiver can select the correct
 *           decoder (application/x-protobuf or application/json).
 *
 * RESPONSE CONTRACT
 * ─────────────────────────────────────────────────────────────────────────────
 * The HTTP status code and response body returned by OpenObserve are forwarded
 * verbatim to the browser so that the OTLPTraceExporter can detect export
 * errors and retry if necessary.
 *
 * ERROR HANDLING
 * ─────────────────────────────────────────────────────────────────────────────
 * • Missing / mis-configured endpoint env var → 502 Bad Gateway
 * • Network error reaching OpenObserve         → 502 Bad Gateway
 * • Non-2xx response from OpenObserve          → forwarded to the browser
 *
 * ENVIRONMENT VARIABLES
 * ─────────────────────────────────────────────────────────────────────────────
 * OTEL_EXPORTER_OTLP_TRACES_ENDPOINT  (required)
 *   Full URL of the OpenObserve OTLP/HTTP traces endpoint.
 *   e.g. http://localhost:5080/api/default/traces
 *
 * OPENOBSERVE_USERNAME  (required)
 *   HTTP Basic-Auth username — typically the OpenObserve account email.
 *
 * OPENOBSERVE_PASSWORD  (required)
 *   HTTP Basic-Auth password.  Keep this secret; never commit it.
 */

import { type NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

/**
 * Fallback traces endpoint used when the env var is absent so that local
 * development with a self-hosted OpenObserve instance works out of the box.
 */
const DEFAULT_TRACES_ENDPOINT = 'http://localhost:5080/api/default/traces';

/**
 * Build the HTTP Basic-Auth header value from the given credentials.
 *
 * The username and password are joined with a colon, Base64-encoded, and
 * prefixed with "Basic " in accordance with RFC 7617.
 *
 * Running on the Node.js runtime means `Buffer` is always available; no
 * polyfill is required.
 */
function buildBasicAuthHeader(username: string, password: string): string {
  return (
    'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
  );
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

/**
 * POST /api/telemetry/traces
 *
 * Reads the raw request body and proxies it to the configured
 * OTEL_EXPORTER_OTLP_TRACES_ENDPOINT, injecting a server-side Basic-Auth
 * header so that browser clients never have access to the credentials.
 *
 * The upstream HTTP status code and response body are forwarded verbatim to
 * the caller so that the OTLP exporter can apply its standard retry logic.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Resolve upstream endpoint ──────────────────────────────────────────
  const tracesEndpoint: string =
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ?? DEFAULT_TRACES_ENDPOINT;

  // ── Build Basic-Auth header ────────────────────────────────────────────
  // Both variables default to an empty string if absent; the resulting
  // Authorization header will be malformed, and OpenObserve will reject it
  // with a 401 — which is forwarded to the browser as-is and surfaced to the
  // developer in the Network panel.
  const username: string = process.env.OPENOBSERVE_USERNAME ?? '';
  const password: string = process.env.OPENOBSERVE_PASSWORD ?? '';
  const authHeader: string = buildBasicAuthHeader(username, password);

  // ── Determine Content-Type to forward ────────────────────────────────
  // The browser OTLP exporter sets this to either:
  //   • application/x-protobuf  — binary Protobuf payload (default)
  //   • application/json        — JSON-encoded OTLP payload
  // Forwarding the header verbatim ensures OpenObserve selects the correct
  // decoder without any transformation on our part.
  const contentType: string =
    request.headers.get('content-type') ?? 'application/x-protobuf';

  // ── Read raw body ─────────────────────────────────────────────────────
  // `request.arrayBuffer()` returns the raw bytes without any JSON parsing or
  // string conversion, which is exactly what we need when the payload may be
  // binary Protobuf data.  Using arrayBuffer() also avoids the overhead of
  // unnecessary re-serialisation.
  let body: ArrayBuffer;
  try {
    body = await request.arrayBuffer();
  } catch (err: unknown) {
    // This would only happen if the client closed the connection mid-stream.
    const message =
      err instanceof Error ? err.message : 'Failed to read request body';
    return new NextResponse(
      JSON.stringify({ error: 'bad_request', message }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // ── Proxy to OpenObserve ──────────────────────────────────────────────
  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(tracesEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        Authorization: authHeader,
      },
      body,
    });
  } catch (err: unknown) {
    // Network-level failure (DNS resolution error, connection refused, …).
    // Return a 502 Bad Gateway so the browser-side exporter knows the export
    // did not reach the collector and can schedule a retry.
    const message =
      err instanceof Error
        ? err.message
        : 'Failed to reach the OTLP traces endpoint';
    return new NextResponse(
      JSON.stringify({ error: 'upstream_unavailable', message }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // ── Forward upstream response ─────────────────────────────────────────
  // Read the full upstream body as an ArrayBuffer so we can relay it without
  // any Content-Type-dependent parsing.  This preserves binary or text
  // responses from OpenObserve (e.g. a JSON error envelope) correctly.
  const upstreamBody: ArrayBuffer = await upstreamResponse.arrayBuffer();

  // Determine the response Content-Type to set on the reply.  OpenObserve
  // typically returns application/json for both success and error responses;
  // falling back to application/octet-stream is a safe default for unexpected
  // binary payloads.
  const upstreamContentType: string =
    upstreamResponse.headers.get('content-type') ??
    'application/octet-stream';

  return new NextResponse(upstreamBody, {
    status: upstreamResponse.status,
    headers: {
      'Content-Type': upstreamContentType,
    },
  });
}
