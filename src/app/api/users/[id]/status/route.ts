import { NextResponse } from "next/server";
import { z } from "zod";

import { requireSession } from "@/lib/api";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };
const schema = z.object({ status: z.enum(["active", "invited", "disabled"]) });

export async function PATCH(request: Request, context: Params) {
  const auth = await requireSession("users:write");
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const input = schema.parse(await request.json());
  const user = await prisma.user.update({ where: { id }, data: { status: input.status } });
  await writeAuditLog({ userId: auth.session.user.id, action: "user_update", entity: "User", entityId: id });
  return NextResponse.json({ user });
}
