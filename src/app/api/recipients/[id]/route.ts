import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { recipientSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const auth = await requireSession("license:read");
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const recipient = await prisma.emailRecipient.findUnique({ where: { id } });
  return NextResponse.json({ recipient });
}

export async function PUT(request: Request, context: Params) {
  const auth = await requireSession("settings:write");
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const input = recipientSchema.parse(await request.json());
  const recipient = await prisma.emailRecipient.update({ where: { id }, data: input });
  return NextResponse.json({ recipient });
}

export async function DELETE(_request: Request, context: Params) {
  const auth = await requireSession("settings:write");
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  await prisma.emailRecipient.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
