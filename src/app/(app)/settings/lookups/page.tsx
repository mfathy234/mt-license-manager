import { LookupsManager } from "@/components/lookups-manager";
import { PageHeader } from "@/components/ui";
import { requirePagePermission } from "@/lib/page-auth";
import { prisma } from "@/lib/prisma";

export default async function LookupsPage() {
  await requirePagePermission("settings:write");
  const values = await prisma.lookupValue.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Lookups"
        description="Reference values that populate the status, service, branch, payment, and renewal dropdowns."
      />
      <LookupsManager initialValues={values} />
    </div>
  );
}
