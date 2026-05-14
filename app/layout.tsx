/**
 * app/layout.tsx — Root layout (Server Component)
 *
 * This file is intentionally a Server Component (no client directive).
 * Next.js treats it as a React Server Component, which allows streaming the
 * initial HTML shell — including font variables, theme attributes, and
 * metadata — without waiting for any client-side JavaScript to execute.
 *
 * Browser-side telemetry is bootstrapped by the `<TelemetryInit />` child
 * component (app/components/TelemetryInit.tsx), which carries the client
 * directive and calls `initBrowserTelemetry()` inside a `useEffect`.  This
 * pattern keeps the layout itself a Server Component while still allowing a
 * client-side side-effect to run exactly once after mount.
 */

import type { Metadata } from "next";
import { Archivo_Black, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import TelemetryInit from "@/app/components/TelemetryInit";
import { Providers } from "@/components/Providers";

// ---------------------------------------------------------------------------
// Font configuration
// ---------------------------------------------------------------------------

/**
 * Archivo Black — used for display / heading text.
 * Exposed as the CSS custom property `--font-display`.
 */
const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

/**
 * Inter — used for body / UI text.
 * Exposed as the CSS custom property `--font-body`.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/**
 * JetBrains Mono — used for code / monospaced text.
 * Exposed as the CSS custom property `--font-mono`.
 */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Workouter",
  description: "Build structured Apple Watch and Garmin workouts",
};

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

/**
 * RootLayout wraps every page in the application with shared HTML structure,
 * global styles, and font variables.
 *
 * `<TelemetryInit />` is rendered inside `<body>` as an invisible Client
 * Component.  It produces no DOM output but fires `initBrowserTelemetry()`
 * after the first client-side mount, registering the WebTracerProvider,
 * auto-instrumentations (document load, fetch, XHR), and the click listener
 * that streams user-interaction spans to OpenObserve via `/api/telemetry/traces`.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      data-accent="coral"
      className={`${archivoBlack.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        {/*
         * TelemetryInit is a client component that calls
         * initBrowserTelemetry() inside a useEffect on first render.
         * It renders null so it has no visible impact on the page.
         */}
        <TelemetryInit />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
