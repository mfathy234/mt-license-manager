import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireSession("users:write");
  if ("error" in auth) return auth.error;
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    orderBy: { email: "asc" }
  });
  return NextResponse.json({ users });
}
