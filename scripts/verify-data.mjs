import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const [licenses, encrypted, plaintext, admins, assignments, lookups, monthlyUsd, yearlyUsd] = await Promise.all([
  prisma.license.count(),
  prisma.licenseEncryptedData.count(),
  prisma.license.count({
    where: {
      OR: [{ details: { not: null } }, { vendor: { not: null } }, { admins: { not: null } }, { ownerAccount: { not: null } }]
    }
  }),
  prisma.licenseAdmin.count(),
  prisma.licenseAdminAssignment.count(),
  prisma.lookupValue.count(),
  prisma.license.count({ where: { monthlyCostUsd: { not: null } } }),
  prisma.license.count({ where: { yearlyCostUsd: { not: null } } })
]);

console.log(
  JSON.stringify({
    licenses,
    encrypted,
    plaintextTextRows: plaintext,
    admins,
    assignments,
    lookups,
    monthlyUsd,
    yearlyUsd
  })
);

await prisma.$disconnect();
