import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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
