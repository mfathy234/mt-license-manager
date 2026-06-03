import { NextResponse } from "next/server";

import { jsonError, requireSession } from "@/lib/api";
import { writeAuditLog } from "@/lib/audit";
import { decryptLicense, encryptLicenseFields } from "@/lib/license-secure";
import { prisma } from "@/lib/prisma";
import { licenseSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const auth = await requireSession("license:read");
  if ("error" in auth) return auth.error;
  const { id } = await context.params;

  const license = await prisma.license.findUnique({
    where: { id },
    include: {
      encryptedData: true,
      adminAssignments: { include: { admin: true } },
      credentials: { select: { id: true, label: true, createdAt: true, updatedAt: true } },
      notificationTargets: { include: { recipient: true, group: true } },
      histories: { orderBy: { createdAt: "desc" }, take: 20 }
    }
  });
  if (!license) return jsonError("License not found.", 404);
  return NextResponse.json({ license: decryptLicense(license) });
}

export async function PUT(request: Request, context: Params) {
  const auth = await requireSession("license:write");
  if ("error" in auth) return auth.error;
  const { id } = await context.params;

  const parsed = licenseSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError(parsed.error.message);

  const {
    recipientIds = [],
    groupIds = [],
    adminIds = [],
    status,
    serviceType,
    details,
    branch,
    vendor,
    ownerAccount,
    paymentMethod,
    renewalFrequency,
    notes,
    ...data
  } = parsed.data;
  const encryptedData = encryptLicenseFields({
    status,
    serviceType,
    details,
    branch,
    vendor,
    ownerAccount,
    paymentMethod,
    renewalFrequency,
    notes
  });
  const license = await prisma.$transaction(async (tx) => {
    await tx.licenseNotificationTarget.deleteMany({ where: { licenseId: id } });
    await tx.licenseAdminAssignment.deleteMany({ where: { licenseId: id } });
    return tx.license.update({
      where: { id },
      data: {
        ...data,
        status: null,
        serviceType: null,
        details: null,
        branch: null,
        vendor: null,
        ownerAccount: null,
        admins: null,
        paymentMethod: null,
        renewalFrequency: null,
        notes: null,
        encryptedData: {
          upsert: {
            create: encryptedData,
            update: encryptedData
          }
        },
        adminAssignments: { create: adminIds.map((adminId) => ({ adminId })) },
        notificationTargets: {
          create: [
            ...recipientIds.map((recipientId) => ({ recipientId })),
            ...groupIds.map((groupId) => ({ groupId }))
          ]
        }
      },
      include: { encryptedData: true, adminAssignments: { include: { admin: true } } }
    });
  });

  await writeAuditLog({ userId: auth.session.user.id, action: "license_update", entity: "License", entityId: id });
  return NextResponse.json({ license: decryptLicense(license) });
}

export async function DELETE(_request: Request, context: Params) {
  const auth = await requireSession("license:delete");
  if ("error" in auth) return auth.error;
  const { id } = await context.params;

  await prisma.license.delete({ where: { id } });
  await writeAuditLog({ userId: auth.session.user.id, action: "license_delete", entity: "License", entityId: id });
  return NextResponse.json({ ok: true });
}
