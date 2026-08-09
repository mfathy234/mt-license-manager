import { NextResponse } from "next/server";

import { handleApiError, jsonError, requireSession, zodMessage } from "@/lib/api";
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

  try {
    const parsed = groupSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(zodMessage(parsed.error));

    const { recipientIds = [], ...input } = parsed.data;
    const group = await prisma.emailGroup.create({
      data: {
        ...input,
        members: { create: recipientIds.map((recipientId) => ({ recipientId })) }
      },
      include: { members: true }
    });
    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    return handleApiError(error, { conflictMessage: "A group with that name already exists." });
  }
}
