/**
 * Auth Helper Functions
 * Utility functions for authentication in the Workouter app
 */

import { auth } from "./auth";
import { redirect } from "next/navigation";

/**
 * Require authentication - redirects to login if not authenticated
 * Use in Server Components or Server Actions
 * Returns session with guaranteed user object
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // TypeScript now knows user is defined
  return {
    ...session,
    user: session.user,
  };
}

/**
 * Get current user or null if not authenticated
 * Use in Server Components or Server Actions
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Check if user is authenticated
 * Use in Server Components or Server Actions
 */
export async function isAuthenticated() {
  const session = await auth();
  return !!session?.user?.id;
}

/**
 * Get user ID or throw error if not authenticated
 * Use in API routes or Server Actions where you need the user ID
 */
export async function requireUserId() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}
