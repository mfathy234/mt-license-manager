import { ImportWorkbook } from "@/components/import-workbook";
import { PageHeader } from "@/components/ui";
import { requirePageSession } from "@/lib/page-auth";

export default async function ImportPage() {
  await requirePageSession();

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Import workbook"
        description="Preview and import the Microtec license spreadsheet. Nothing is written until you confirm."
      />
      <ImportWorkbook />
    </div>
  );
}
