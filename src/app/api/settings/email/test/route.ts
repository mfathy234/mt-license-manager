import { NextResponse } from "next/server";
import { z } from "zod";

import { requireSession } from "@/lib/api";
import { sendTestEmail } from "@/lib/email";

const schema = z.object({ to: z.string().trim().email() });

export async function POST(request: Request) {
  const auth = await requireSession("settings:write");
  if ("error" in auth) return auth.error;
  const { to } = schema.parse(await request.json());
  await sendTestEmail(to);
  return NextResponse.json({ ok: true });
}
