import { NextResponse } from "next/server";

import { handleApiError, jsonError, requireSession, zodMessage } from "@/lib/api";
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

  try {
    const parsed = recipientSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(zodMessage(parsed.error));

    const recipient = await prisma.emailRecipient.create({ data: parsed.data });
    return NextResponse.json({ recipient }, { status: 201 });
  } catch (error) {
    return handleApiError(error, { conflictMessage: "A recipient with that email address already exists." });
  }
}
