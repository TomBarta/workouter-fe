import { NextRequest, NextResponse } from "next/server";
import { proxyToBackend } from "@/app/lib/api-proxy";

/**
 * GET /api/test/backend
 * Test endpoint to verify backend connectivity through Cloudflare Access tunnel
 */
export async function GET(request: NextRequest) {
  try {
    // Test backend endpoint
    const testPath = request.nextUrl.searchParams.get("path") || "/workout";
    const method = request.nextUrl.searchParams.get("method") || "GET";
    console.log(`Testing backend: ${method} ${process.env.BACKEND_API_URL}${testPath}`);

    // Make direct fetch instead of using proxy to avoid body consumption issues
    const url = `${process.env.BACKEND_API_URL}${testPath}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add backend API key
    if (process.env.BACKEND_API_KEY) {
      headers["X-API-Key"] = process.env.BACKEND_API_KEY;
    }

    // Add Cloudflare Access headers
    if (process.env.CF_ACCESS_CLIENT_ID && process.env.CF_ACCESS_CLIENT_SECRET) {
      headers["CF-Access-Client-Id"] = process.env.CF_ACCESS_CLIENT_ID;
      headers["CF-Access-Client-Secret"] = process.env.CF_ACCESS_CLIENT_SECRET;
    }

    // Sample workout data for POST
    const sampleWorkout = {
      name: "Test Workout",
      date: new Date().toISOString(),
      steps: [
        {
          name: "Bench Press",
          sets: [{ reps: 10, weight: 135, unit: "lbs" }]
        }
      ]
    };

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (method === "POST") {
      fetchOptions.body = JSON.stringify(sampleWorkout);
    }

    const response = await fetch(url, fetchOptions);

    // Read response
    const statusCode = response.status;
    const responseHeaders = Object.fromEntries(response.headers.entries());

    // Get body as text first to avoid consumption issues
    const bodyText = await response.text();
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch {
      body = bodyText;
    }

    return NextResponse.json({
      success: statusCode < 400,
      test: "Backend connectivity via Cloudflare Access",
      backend_url: process.env.BACKEND_API_URL,
      cf_access_configured: !!(process.env.CF_ACCESS_CLIENT_ID && process.env.CF_ACCESS_CLIENT_SECRET),
      response: {
        status: statusCode,
        headers: responseHeaders,
        body,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        test: "Backend connectivity via Cloudflare Access",
        backend_url: process.env.BACKEND_API_URL,
        cf_access_configured: !!(process.env.CF_ACCESS_CLIENT_ID && process.env.CF_ACCESS_CLIENT_SECRET),
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
