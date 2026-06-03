import { NextResponse } from "next/server";
import { z } from "zod";

import { requireSession } from "@/lib/api";
import { writeAuditLog } from "@/lib/audit";
import { encryptLicenseFields, legacyAdminNames } from "@/lib/license-secure";
import { prisma } from "@/lib/prisma";

const rowSchema = z.object({
  status: z.string().nullable().optional(),
  serviceType: z.string().nullable().optional(),
  details: z.string().min(1),
  branch: z.string().nullable().optional(),
  vendor: z.string().nullable().optional(),
  usersCount: z.number().nullable().optional(),
  ownerAccount: z.string().nullable().optional(),
  admins: z.string().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  expiryDate: z.string().datetime().nullable().optional(),
  paymentMethod: z.string().nullable().optional(),
  renewalFrequency: z.string().nullable().optional(),
  costEgp: z.number().nullable().optional(),
  costUsd: z.number().nullable().optional(),
  monthlyCostEgp: z.number().nullable().optional(),
  yearlyCostEgp: z.number().nullable().optional(),
  fiveYearsCostEgp: z.number().nullable().optional(),
  monthlyCostUsd: z.number().nullable().optional(),
  yearlyCostUsd: z.number().nullable().optional(),
  fiveYearsCostUsd: z.number().nullable().optional(),
  notes: z.string().nullable().optional()
});

const confirmSchema = z.object({
  filename: z.string().min(1),
  rows: z.array(rowSchema).min(1),
  lookups: z
    .array(
      z.object({
        category: z.string(),
        value: z.string(),
        sortOrder: z.number().int()
      })
    )
    .optional()
});

export async function POST(request: Request) {
  const auth = await requireSession("import:write");
  if ("error" in auth) return auth.error;

  const input = confirmSchema.parse(await request.json());
  const result = await prisma.$transaction(async (tx) => {
    const batch = await tx.importBatch.create({
      data: {
        filename: input.filename,
        rowCount: input.rows.length,
        rawRows: input.rows,
        createdById: auth.session.user.id
      }
    });
    for (const lookup of input.lookups ?? []) {
      await tx.lookupValue.upsert({
        where: { category_value: { category: lookup.category, value: lookup.value } },
        create: lookup,
        update: { sortOrder: lookup.sortOrder, active: true }
      });
    }
    for (const row of input.rows) {
      const admins = legacyAdminNames(row.admins);
      const adminRecords = await Promise.all(
        admins.map((name) =>
          tx.licenseAdmin.upsert({
            where: { name },
            create: { name },
            update: { active: true }
          })
        )
      );
      await tx.license.create({
        data: {
          usersCount: row.usersCount,
          startDate: row.startDate ? new Date(row.startDate) : null,
          expiryDate: row.expiryDate ? new Date(row.expiryDate) : null,
          costEgp: row.costEgp,
          costUsd: row.costUsd,
          monthlyCostEgp: row.monthlyCostEgp,
          yearlyCostEgp: row.yearlyCostEgp,
          fiveYearsCostEgp: row.fiveYearsCostEgp,
          monthlyCostUsd: row.monthlyCostUsd,
          yearlyCostUsd: row.yearlyCostUsd,
          fiveYearsCostUsd: row.fiveYearsCostUsd,
          createdById: auth.session.user.id,
          encryptedData: {
            create: encryptLicenseFields({
              status: row.status,
              serviceType: row.serviceType,
              details: row.details,
              branch: row.branch,
              vendor: row.vendor,
              ownerAccount: row.ownerAccount,
              paymentMethod: row.paymentMethod,
              renewalFrequency: row.renewalFrequency,
              notes: row.notes
            })
          },
          adminAssignments: {
            create: adminRecords.map((admin) => ({ adminId: admin.id }))
          }
        }
      });
    }
    return batch;
  });

  await writeAuditLog({
    userId: auth.session.user.id,
    action: "import_confirm",
    entity: "ImportBatch",
    entityId: result.id,
    metadata: { rows: input.rows.length }
  });
  return NextResponse.json({ batch: result });
}
