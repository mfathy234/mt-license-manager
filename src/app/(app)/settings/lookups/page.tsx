import { LookupsManager } from "@/components/lookups-manager";
import { PageHeader, Panel } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function LookupsPage() {
  const values = await prisma.lookupValue.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Lookups"
        description="Reference values that populate the status, service, branch, payment, and renewal dropdowns."
      />
      <Panel>
        <LookupsManager initialValues={values} />
      </Panel>
    </div>
  );
}
