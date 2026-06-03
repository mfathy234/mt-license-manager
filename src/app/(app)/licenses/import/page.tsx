import { ImportWorkbook } from "@/components/import-workbook";

export default function ImportPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Import workbook</h1>
        <p className="text-sm text-muted-foreground">Preview and import the Microtec license spreadsheet.</p>
      </div>
      <ImportWorkbook />
    </div>
  );
}
