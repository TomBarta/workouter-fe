/**
 * app/lib/telemetry-browser.ts — Client-side OpenTelemetry bootstrap
 *
 * WHY THIS FILE EXISTS
 * ─────────────────────────────────────────────────────────────────────────────
 * The server-side OpenTelemetry setup in instrumentation.ts covers traces,
 * metrics, and logs that originate inside the Next.js Node.js runtime.  It
 * cannot observe what happens inside the user's browser — page loads, fetch
 * calls, XHR requests, or click interactions.
 *
 * This module provides a single entry-point, `initBrowserTelemetry()`, that
 * sets up the Web SDK on the client:
 *
 *   WebTracerProvider
 *     Manages the trace lifecycle in the browser.  Configured with a Resource
 *     that identifies the service as 'workouter-fe-browser' so browser spans
 *     are visually separated from server spans in OpenObserve dashboards.
 *
 *   OTLPTraceExporter  →  /api/telemetry/traces  (same-origin proxy)
 *     Ships completed spans to the Next.js API route that acts as a secure
 *     reverse proxy toward OpenObserve.  The browser never holds credentials.
 *
 *   BatchSpanProcessor
 *     Buffers spans and flushes them in batches rather than one-at-a-time to
 *     minimise the number of HTTP requests made from the browser tab.
 *
 *   ZoneContextManager
 *     Uses zone.js to propagate the active OpenTelemetry context across async
 *     boundaries (setTimeout, Promise micro-tasks, XHR callbacks, …).  This
 *     is essential for correctly parenting child spans created inside async
 *     code that was kicked off from within a parent span.
 *
 *   Auto-instrumentations
 *     • DocumentLoadInstrumentation  — records navigation timing
 *     • FetchInstrumentation         — wraps window.fetch
 *     • XMLHttpRequestInstrumentation — wraps XMLHttpRequest
 *
 *   Click listener
 *     A capture-phase click listener on the document root creates a short
 *     'user.click' span for every click event, carrying the element's tag name
 *     and a truncated version of its visible text content as span attributes.
 *     This gives product and engineering teams a cheap, automatic stream of
 *     user-interaction spans without manual instrumentation in every component.
 *
 * USAGE
 * ─────────────────────────────────────────────────────────────────────────────
 * Call `initBrowserTelemetry()` once from the root client component (or a
 * `"use client"` layout effect) after the app has mounted:
 *
 *   import { initBrowserTelemetry } from '@/app/lib/telemetry-browser';
 *
 *   // In a useEffect or similar client-only hook:
 *   initBrowserTelemetry();
 *
 * The function is idempotent — repeated calls after the first are no-ops.
 *
 * ENVIRONMENT
 * ─────────────────────────────────────────────────────────────────────────────
 * This module imports exclusively from packages that are safe to include in
 * browser bundles.  It must never be imported from server-only modules.  All
 * OpenTelemetry Node.js SDK packages (sdk-node, sdk-trace-node, …) remain
 * server-only and are loaded only through instrumentation.ts.
 */

'use client';

import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * The service name that appears in OpenObserve for all spans originating from
 * the browser.  Deliberately distinct from the server-side 'workouter-fe' so
 * that browser spans can be filtered independently in dashboards and alerts.
 */
const BROWSER_SERVICE_NAME = 'workouter-fe-browser';

/**
 * Maximum number of characters of an element's visible text that are included
 * in the 'ui.element.text' span attribute.  Truncation keeps span payloads
 * small and avoids accidentally exfiltrating large bodies of user-visible text
 * (e.g. a paragraph copied into a button label).
 */
const CLICK_TEXT_MAX_LENGTH = 60;

/**
 * Tracer name used when obtaining a tracer for the manual click spans.
 * Follows the instrumentation-scope naming convention (reverse-DNS style).
 */
const CLICK_TRACER_NAME = 'workouter-fe-browser/click-handler';

// ---------------------------------------------------------------------------
// Module-level initialisation guard
// ---------------------------------------------------------------------------

/**
 * Tracks whether `initBrowserTelemetry()` has already been called so that
 * multiple React renders or hot-module replacements do not re-register the
 * provider or add duplicate event listeners.
 */
let _initialised = false;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialise the browser-side OpenTelemetry stack.
 *
 * After the first successful call this function is a no-op.  Safe to call
 * from `useEffect` without a cleanup return — the provider and listener are
 * intentionally long-lived for the lifetime of the page.
 *
 * @returns The configured `WebTracerProvider`, or `undefined` if called
 *   outside a browser environment (e.g. during SSR) or after already being
 *   initialised.
 */
export function initBrowserTelemetry(): WebTracerProvider | undefined {
  // ── Environment guard ─────────────────────────────────────────────────
  // This module is bundled into the client JS chunk, but Next.js may execute
  // module-level code on the server during SSR.  Bail out if the Window API
  // is not available to avoid crashing the server render.
  if (typeof window === 'undefined') {
    return undefined;
  }

  // ── Idempotency guard ─────────────────────────────────────────────────
  if (_initialised) {
    return undefined;
  }
  _initialised = true;

  // ── Resource ──────────────────────────────────────────────────────────
  // The Resource is attached to every span emitted from this provider,
  // allowing OpenObserve to group all browser spans under the service name
  // 'workouter-fe-browser'.
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: BROWSER_SERVICE_NAME,
  });

  // ── OTLP trace exporter ───────────────────────────────────────────────
  // Spans are posted to the same-origin Next.js API route which adds
  // server-side credentials and forwards the payload to OpenObserve.
  // Using a relative URL keeps this working regardless of the deployment
  // origin (localhost, Vercel preview URL, production domain, …).
  const exporter = new OTLPTraceExporter({
    url: '/api/telemetry/traces',
  });

  // ── BatchSpanProcessor ────────────────────────────────────────────────
  // Buffers completed spans in memory and exports them in batches to
  // minimise the total number of HTTP requests the tab makes to the proxy
  // route.  The default batch size, export interval, and timeout are used.
  const processor = new BatchSpanProcessor(exporter);

  // ── WebTracerProvider ─────────────────────────────────────────────────
  // WebTracerProvider extends BasicTracerProvider with browser-appropriate
  // defaults.  The processor is passed through the constructor config so it
  // is attached before the provider registers with the global API — this
  // prevents a race where spans emitted by auto-instrumentations during the
  // very first page load miss the processor.
  const provider = new WebTracerProvider({
    resource,
    spanProcessors: [processor],
  });

  // ── ZoneContextManager ────────────────────────────────────────────────
  // zone.js monkey-patches async primitives (setTimeout, Promise, XHR, …)
  // to keep execution contexts associated with pending Tasks, enabling
  // correct OTel context propagation across await boundaries and callbacks.
  // Registering here overrides the default StackContextManager.
  provider.register({
    contextManager: new ZoneContextManager(),
  });

  // ── Auto-instrumentations ─────────────────────────────────────────────
  // Each instrumentation is instantiated, pointed at the now-registered
  // global tracer provider, and then enabled.  The order matches the likely
  // chronological firing order on a typical page load.

  // Captures the document load lifecycle (navigationStart → loadEventEnd)
  // as a parent span with child resource-timing spans for each sub-resource.
  const documentLoad = new DocumentLoadInstrumentation();
  documentLoad.setTracerProvider(provider);
  documentLoad.enable();

  // Wraps window.fetch to create a span for every outgoing fetch request,
  // propagating W3C trace-context headers so server-side spans can be linked.
  const fetchInstrumentation = new FetchInstrumentation();
  fetchInstrumentation.setTracerProvider(provider);
  fetchInstrumentation.enable();

  // Wraps XMLHttpRequest for legacy code paths that do not use fetch.
  const xhrInstrumentation = new XMLHttpRequestInstrumentation();
  xhrInstrumentation.setTracerProvider(provider);
  xhrInstrumentation.enable();

  // ── Click listener ────────────────────────────────────────────────────
  // Installed in capture phase so it fires before any component click
  // handler, guaranteeing that a 'user.click' span is always started even if
  // a child handler calls stopPropagation().
  document.addEventListener('click', _handleClick, { capture: true });

  return provider;
}

// ---------------------------------------------------------------------------
// Click span helper
// ---------------------------------------------------------------------------

/**
 * Handle a document-level click event by creating a short 'user.click' span
 * that records which element was clicked and what the user saw.
 *
 * The span is started and immediately ended because click handling is
 * synchronous from OTel's perspective — we are not awaiting any I/O.  Child
 * spans produced by the component's own onClick (e.g. a fetch triggered by
 * the click) will be linked as siblings rather than children, which is the
 * correct semantic: the click is an observation of a point-in-time event, not
 * a parent operation that the fetch is a part of.
 *
 * Span attributes:
 *   ui.element.tag   — lower-cased HTML tag name (e.g. 'button', 'a')
 *   ui.element.text  — visible text content, whitespace-normalised and
 *                      truncated to CLICK_TEXT_MAX_LENGTH characters
 *
 * @param event The native MouseEvent forwarded from the capture listener.
 */
function _handleClick(event: MouseEvent): void {
  const target = event.target;

  // Guard: the target must be an Element (not a text node or the document
  // itself) for the tag-name and text attributes to be meaningful.
  if (!(target instanceof Element)) {
    return;
  }

  // Lower-case the tag name to match the HTML convention (e.g. 'button').
  const tagName: string = target.tagName.toLowerCase();

  // Retrieve the raw text content and normalise whitespace so that attributes
  // contain readable prose rather than raw HTML indentation artefacts.
  const rawText: string = (target.textContent ?? '').replace(/\s+/g, ' ').trim();

  // Truncate to CLICK_TEXT_MAX_LENGTH characters to keep span payloads small
  // and avoid capturing large swaths of user-visible text unintentionally.
  const truncatedText: string =
    rawText.length > CLICK_TEXT_MAX_LENGTH
      ? rawText.slice(0, CLICK_TEXT_MAX_LENGTH) + '…'
      : rawText;

  // Obtain a tracer from the global API.  At this point the global provider
  // has been registered by `initBrowserTelemetry()`, so this returns the
  // real tracer backed by our WebTracerProvider.
  const tracer = trace.getTracer(CLICK_TRACER_NAME);

  // Use the current active context so that if the click occurs inside an
  // existing span (e.g. during a document load), the click span becomes a
  // child of that span.
  const ctx = context.active();

  // Start a span named 'user.click' with the element's tag and truncated text
  // as attributes, rooted in the currently active context.
  const span = tracer.startSpan(
    'user.click',
    {
      attributes: {
        'ui.element.tag': tagName,
        'ui.element.text': truncatedText,
      },
    },
    ctx
  );

  // End the span immediately — click handling is a point-in-time event.
  span.setStatus({ code: SpanStatusCode.OK });
  span.end();
}
