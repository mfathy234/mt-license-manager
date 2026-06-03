import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { recipientSchema } from "@/lib/validators";

export async function GET() {
  const auth = await requireSession("license:read");
  if ("error" in auth) return auth.error;
  const recipients = await prisma.emailRecipient.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ recipients });
}

export async function POST(request: Request) {
  const auth = await requireSession("settings:write");
  if ("error" in auth) return auth.error;
  const input = recipientSchema.parse(await request.json());
  const recipient = await prisma.emailRecipient.create({ data: input });
  return NextResponse.json({ recipient }, { status: 201 });
}
