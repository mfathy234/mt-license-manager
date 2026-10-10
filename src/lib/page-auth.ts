import { redirect } from "next/navigation";

import { getProtectedSession } from "@/lib/auth";
import { can, type Action } from "@/lib/permissions";

/**
 * Page-local authorization boundary for every authenticated route entry point.
 * Revalidation errors fail closed to login; cached session data is never used.
 */
export async function requirePageSession() {
  try {
    const session = await getProtectedSession();
    if (session) return session;
  } catch {
    // Redirect below so Next's redirect signal is never swallowed by this catch.
  }

  redirect("/login");
}

/**
 * Revalidates the session before checking the current stored role. Authenticated
 * users without the requested permission return to the safe app entry point.
 */
export async function requirePagePermission(action: Action) {
  const session = await requirePageSession();

  if (!can(session.user?.role, action)) {
    redirect("/dashboard");
  }

  return session;
}
