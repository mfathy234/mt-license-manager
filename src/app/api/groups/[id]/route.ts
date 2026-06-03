import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { groupSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const auth = await requireSession("license:read");
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const group = await prisma.emailGroup.findUnique({
    where: { id },
    include: { members: { include: { recipient: true } } }
  });
  return NextResponse.json({ group });
}

export async function PUT(request: Request, context: Params) {
  const auth = await requireSession("settings:write");
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const { recipientIds = [], ...input } = groupSchema.parse(await request.json());
  const group = await prisma.$transaction(async (tx) => {
    await tx.emailGroupMember.deleteMany({ where: { groupId: id } });
    return tx.emailGroup.update({
      where: { id },
      data: { ...input, members: { create: recipientIds.map((recipientId) => ({ recipientId })) } },
      include: { members: true }
    });
  });
  return NextResponse.json({ group });
}

export async function DELETE(_request: Request, context: Params) {
  const auth = await requireSession("settings:write");
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  await prisma.emailGroup.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
