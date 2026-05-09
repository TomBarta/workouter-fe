/**
 * app/components/TelemetryInit.tsx — Client-side telemetry bootstrap component
 *
 * WHY THIS FILE EXISTS
 * ─────────────────────────────────────────────────────────────────────────────
 * Next.js App Router layouts are Server Components by default, which means they
 * run on the server (and during SSR) and cannot use browser-only APIs such as
 * `window`, `document`, or React hooks like `useEffect`.
 *
 * `initBrowserTelemetry()` (from app/lib/telemetry-browser.ts) must run exactly
 * once inside the browser after the initial mount — never on the server — so it
 * can register the WebTracerProvider, auto-instrumentations, and the click
 * listener against the live DOM.
 *
 * This tiny component acts as the bridge:
 *   • `"use client"` opts it into the React Client Component model, ensuring it
 *     is hydrated in the browser and is permitted to use React hooks.
 *   • A single `useEffect` with an empty dependency array (`[]`) fires once
 *     after the component mounts, which is always inside the browser.
 *   • `initBrowserTelemetry()` is itself idempotent (it tracks a module-level
 *     `_initialised` flag), so even if React's Strict Mode double-invokes
 *     effects in development the telemetry stack is only set up once.
 *   • The component renders `null` — it has no visible output and adds nothing
 *     to the DOM, keeping the rendered HTML identical to what it would be
 *     without telemetry.
 *
 * USAGE
 * ─────────────────────────────────────────────────────────────────────────────
 * Render `<TelemetryInit />` once inside the `<body>` of the root layout
 * (app/layout.tsx).  Because the root layout is a Server Component it cannot
 * use `useEffect` itself, but it *can* render a Client Component child:
 *
 *   // app/layout.tsx  (Server Component — no "use client" directive)
 *   import TelemetryInit from '@/app/components/TelemetryInit';
 *
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html lang="en">
 *         <body>
 *           <TelemetryInit />
 *           {children}
 *         </body>
 *       </html>
 *     );
 *   }
 *
 * RENDERING MODEL
 * ─────────────────────────────────────────────────────────────────────────────
 * During SSR the component is serialised as an empty React node (null) — the
 * server emits no markup for it.  On the client the component is hydrated,
 * `useEffect` fires, and `initBrowserTelemetry()` bootstraps the OTel stack
 * before any user interaction can take place.  The tiny React subtree overhead
 * is negligible compared with the OTel SDK bundle itself.
 */

'use client';

import { useEffect } from 'react';
import { initBrowserTelemetry } from '@/app/lib/telemetry-browser';

/**
 * Invisible client component whose sole responsibility is to call
 * `initBrowserTelemetry()` once after the application mounts in the browser.
 *
 * Renders nothing — returns `null` — so it is safe to place anywhere inside
 * the component tree without affecting layout or styling.
 */
export default function TelemetryInit(): null {
  useEffect(() => {
    // initBrowserTelemetry() is idempotent: the first call sets up the
    // WebTracerProvider, auto-instrumentations, and the click listener;
    // every subsequent call returns early.  The empty dependency array
    // ensures this effect runs only once per page lifecycle.
    initBrowserTelemetry();
  }, []);

  // This component exists purely for its side-effect.  It renders no DOM
  // nodes so it has zero impact on the visible page or accessibility tree.
  return null;
}
