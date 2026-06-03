import { LookupsManager } from "@/components/lookups-manager";
import { Panel } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function LookupsPage() {
  const values = await prisma.lookupValue.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Lookups</h1>
        <p className="text-sm text-muted-foreground">Reference values imported from the workbook or maintained through the API.</p>
      </div>
      <Panel>
        <LookupsManager initialValues={values} />
      </Panel>
    </div>
  );
}
