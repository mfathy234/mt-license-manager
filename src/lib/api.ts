import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { authOptions } from "@/lib/auth";
import { can, type Action } from "@/lib/permissions";

export async function requireSession(action?: Action) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (action && !can(session.user.role, action)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function zodMessage(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Invalid request.";
  const field = issue.path.filter((part) => typeof part === "string").join(".");
  return field ? `${field}: ${issue.message}` : issue.message;
}

/**
 * Turns thrown errors into responses the UI can actually show. Without this a
 * duplicate email or a schema miss surfaces as an opaque 500.
 */
export function handleApiError(error: unknown, options?: { conflictMessage?: string; notFoundMessage?: string }) {
  if (error instanceof ZodError) {
    return jsonError(zodMessage(error), 400);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return jsonError(options?.conflictMessage ?? "That value already exists.", 409);
    }
    if (error.code === "P2025") {
      return jsonError(options?.notFoundMessage ?? "Record not found.", 404);
    }
    if (error.code === "P2003") {
      return jsonError("A related record is missing or no longer exists.", 400);
    }
  }

  console.error("Unhandled API error", error);
  return jsonError("Something went wrong. Please try again.", 500);
}
