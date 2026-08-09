"use client";

import { CheckCircle2, Upload } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, FileField, FormMessage, Panel, SecondaryButton } from "@/components/ui";
import { getErrorMessage, requestJson } from "@/lib/http";

type Preview = { filename: string; rowCount: number; rows: unknown[] };

export function ImportWorkbook() {
  const router = useRouter();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [importing, setImporting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPreviewing(true);
    setError("");

    try {
      const response = await fetch("/api/import/preview", { method: "POST", body: new FormData(form) });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error ?? "Import preview failed.");
      setPreview(payload as Preview);
    } catch (previewError) {
      setPreview(null);
      setError(getErrorMessage(previewError, "Import preview failed."));
    } finally {
      setPreviewing(false);
    }
  }

  async function confirm() {
    if (!preview) return;
    setImporting(true);
    setError("");

    try {
      await requestJson("/api/import/confirm", { method: "POST", body: preview });
      router.push("/licenses");
      router.refresh();
    } catch (confirmError) {
      setError(getErrorMessage(confirmError, "Import failed."));
      setImporting(false);
    }
  }

  return (
    <div className="grid gap-5">
      <Panel title="Choose a workbook" description="Excel files only. Nothing is saved until you confirm.">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <FileField label="Workbook" name="file" accept=".xlsx,.xls" required />
          <Button size="lg" loading={previewing} className="w-full sm:w-auto">
            {previewing ? null : <Upload aria-hidden className="h-4 w-4" />}
            {previewing ? "Reading..." : "Preview"}
          </Button>
        </form>
        {error ? (
          <div className="mt-4">
            <FormMessage tone="danger">{error}</FormMessage>
          </div>
        ) : null}
      </Panel>

      {preview ? (
        <Panel>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-start gap-3">
              <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div className="min-w-0">
                <p className="truncate font-medium">{preview.filename}</p>
                <p className="tabular text-sm text-muted-foreground">
                  {preview.rowCount} {preview.rowCount === 1 ? "row" : "rows"} ready to import
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <SecondaryButton type="button" onClick={() => setPreview(null)} disabled={importing}>
                Cancel
              </SecondaryButton>
              <Button type="button" onClick={confirm} loading={importing}>
                {importing ? "Importing..." : "Confirm import"}
              </Button>
            </div>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
