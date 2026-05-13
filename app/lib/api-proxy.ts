/**
 * API Proxy Utility
 *
 * Forwards authenticated requests from Next.js to the Vapor backend API.
 * Handles request/response transformation and error handling.
 */

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:8080";
const BACKEND_API_KEY = process.env.BACKEND_API_KEY || "";

export interface ProxyOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  userId?: string; // User ID from token validation
}

/**
 * Proxy a request to the backend API
 *
 * @param path - API path (e.g., "/workouts", "/workout-plans")
 * @param options - Request options
 * @returns Response from backend
 */
export async function proxyToBackend(
  path: string,
  options: ProxyOptions = {}
): Promise<Response> {
  const { method = "GET", body, headers = {}, userId } = options;

  // Build the full backend URL
  const url = `${BACKEND_API_URL}${path}`;

  // Prepare headers
  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Add backend API key for authentication
  if (BACKEND_API_KEY) {
    requestHeaders["X-API-Key"] = BACKEND_API_KEY;
  }

  // Add user context header if available
  if (userId) {
    requestHeaders["X-User-ID"] = userId;
  }

  // Prepare fetch options
  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // Add body for POST/PUT/PATCH requests
  if (body && ["POST", "PUT", "PATCH"].includes(method)) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    // Make request to backend
    const response = await fetch(url, fetchOptions);

    // Return the response as-is
    // Next.js will handle streaming it back to the client
    return response;
  } catch (error) {
    // Network error or backend unavailable
    console.error("Backend proxy error:", error);

    return new Response(
      JSON.stringify({
        error: "backend_unavailable",
        message: "Could not connect to backend API",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Convert a fetch Response to a Next.js Response
 * Useful when you need to modify the response before returning
 */
export async function responseToNextResponse(response: Response): Promise<Response> {
  const body = await response.text();

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
