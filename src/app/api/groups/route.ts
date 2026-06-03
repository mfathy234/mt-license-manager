import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { groupSchema } from "@/lib/validators";

export async function GET() {
  const auth = await requireSession("license:read");
  if ("error" in auth) return auth.error;
  const groups = await prisma.emailGroup.findMany({
    orderBy: { name: "asc" },
    include: { members: { include: { recipient: true } } }
  });
  return NextResponse.json({ groups });
}

export async function POST(request: Request) {
  const auth = await requireSession("settings:write");
  if ("error" in auth) return auth.error;
  const { recipientIds = [], ...input } = groupSchema.parse(await request.json());
  const group = await prisma.emailGroup.create({
    data: {
      ...input,
      members: { create: recipientIds.map((recipientId) => ({ recipientId })) }
    },
    include: { members: true }
  });
  return NextResponse.json({ group }, { status: 201 });
}
