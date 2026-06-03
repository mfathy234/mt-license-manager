import { NextResponse } from "next/server";

import { jsonError, requireSession } from "@/lib/api";
import { writeAuditLog } from "@/lib/audit";
import { sendLicenseNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Params) {
  const auth = await requireSession("license:write");
  if ("error" in auth) return auth.error;
  const { id } = await context.params;

  const license = await prisma.license.findUnique({ where: { id } });
  if (!license) return jsonError("License not found.", 404);

  const result = await sendLicenseNotification(license.id, "manual");
  await writeAuditLog({
    userId: auth.session.user.id,
    action: "notification_send",
    entity: "License",
    entityId: id,
    metadata: result
  });
  return NextResponse.json(result);
}
