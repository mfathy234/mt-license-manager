import type { AuditAction } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function writeAuditLog(input: {
  userId?: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  metadata?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      userId: input.userId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      metadata: input.metadata === undefined ? undefined : (input.metadata as object)
    }
  });
}
