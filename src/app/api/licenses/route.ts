import { NextResponse } from "next/server";

import { jsonError, requireSession } from "@/lib/api";
import { writeAuditLog } from "@/lib/audit";
import { sendLicenseNotification } from "@/lib/email";
import { decryptLicense, encryptLicenseFields } from "@/lib/license-secure";
import { prisma } from "@/lib/prisma";
import { licenseSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const auth = await requireSession("license:read");
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim().toLowerCase();

  const licenses = await prisma.license.findMany({
    orderBy: [{ expiryDate: "asc" }, { createdAt: "asc" }],
    include: {
      encryptedData: true,
      adminAssignments: { include: { admin: true } },
      notificationTargets: true,
      credentials: { select: { id: true } }
    }
  });
  const decrypted = licenses.map(decryptLicense);
  const filtered = query
    ? decrypted.filter((license) =>
        [license.details, license.vendor, license.branch, license.serviceType, license.adminsDisplay]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(query))
      )
    : decrypted;
  return NextResponse.json({ licenses: filtered });
}

export async function POST(request: Request) {
  const auth = await requireSession("license:write");
  if ("error" in auth) return auth.error;

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
  const license = await prisma.license.create({
    data: {
      ...data,
      createdById: auth.session.user.id,
      encryptedData: { create: encryptedData },
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

  await writeAuditLog({
    userId: auth.session.user.id,
    action: "license_create",
    entity: "License",
    entityId: license.id
  });

  try {
    await sendLicenseNotification(license.id, "created");
  } catch {
    // Missing SMTP settings should not block license creation.
  }

  return NextResponse.json({ license: decryptLicense(license) }, { status: 201 });
}
