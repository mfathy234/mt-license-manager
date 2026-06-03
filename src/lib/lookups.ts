import { prisma } from "@/lib/prisma";

export async function getLicenseFormOptions() {
  const [admins, lookupValues] = await Promise.all([
    prisma.licenseAdmin.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.lookupValue.findMany({
      where: {
        active: true,
        category: { in: ["status", "branch", "serviceType", "paymentMethod", "renewalFrequency"] }
      },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { value: "asc" }]
    })
  ]);

  const lookupOptions: Record<string, Array<{ id: string; value: string }>> = {};
  for (const value of lookupValues) {
    lookupOptions[value.category] ??= [];
    lookupOptions[value.category].push({ id: value.id, value: value.value });
  }

  return { admins, lookupOptions };
}
