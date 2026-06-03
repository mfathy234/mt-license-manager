import { Panel, StatusPill } from "@/components/ui";
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr><th className="py-2">Category</th><th>Value</th><th>Order</th><th>Status</th></tr>
            </thead>
            <tbody>
              {values.map((value) => (
                <tr key={value.id} className="border-t border-border">
                  <td className="py-3 font-medium">{value.category}</td>
                  <td>{value.value}</td>
                  <td>{value.sortOrder}</td>
                  <td><StatusPill value={value.active ? "active" : "inactive"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
