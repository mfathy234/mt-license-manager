import { ImportWorkbook } from "@/components/import-workbook";
import { PageHeader } from "@/components/ui";

export default function ImportPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Import workbook"
        description="Preview and import the Microtec license spreadsheet. Nothing is written until you confirm."
      />
      <ImportWorkbook />
    </div>
  );
}
