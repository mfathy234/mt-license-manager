import { NextResponse } from "next/server";
import { z } from "zod";

import { requireSession } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

const schema = z.object({
  category: z.string().trim().min(1),
  value: z.string().trim().min(1),
  sortOrder: z.coerce.number().int().default(0),
  active: z.boolean().default(true)
});

export async function PATCH(request: Request, context: Params) {
  const auth = await requireSession("settings:write");
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const input = schema.parse(await request.json());
  const value = await prisma.lookupValue.update({ where: { id }, data: input });
  return NextResponse.json({ value });
}
