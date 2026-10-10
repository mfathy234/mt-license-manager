"use client";

import { CheckCircle2, FileSpreadsheet, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Button,
  FileField,
  FormMessage,
  LinkButton,
  Panel,
  SecondaryButton,
} from "@/components/ui";
import { categorizeImportResults } from "@/lib/excel";
import { getErrorMessage, requestJson } from "@/lib/http";

type Preview = {
  filename: string;
  rowCount: number;
  rows: unknown[];
  lookups: unknown[];
};

type ImportConfirmation = {
  batch: {
    rowCount: number;
  };
};

export function ImportWorkbook() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [result, setResult] = useState<ImportConfirmation | null>(null);
  const [error, setError] = useState("");
  const [selectedFilename, setSelectedFilename] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [importing, setImporting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPreviewing(true);
    setError("");

    try {
      const response = await fetch("/api/import/preview", {
        method: "POST",
        body: new FormData(form),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(payload?.error ?? "Import preview failed.");
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
      const confirmation = await requestJson<ImportConfirmation>(
        "/api/import/confirm",
        {
          method: "POST",
          body: preview,
        },
      );
      setResult(confirmation);
      setPreview(null);
      router.refresh();
    } catch (confirmError) {
      setError(getErrorMessage(confirmError, "Import failed."));
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    formRef.current?.reset();
    setPreview(null);
    setResult(null);
    setError("");
    setSelectedFilename("");
  }

  if (result) {
    const summary = categorizeImportResults(result);

    return (
      <Panel title="Import complete" bodyClassName="grid gap-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 aria-hidden className="h-5 w-5 shrink-0 text-success" />
          <div>
            <p className="text-sm font-medium">
              {summary.imported}{" "}
              {summary.imported === 1 ? "row was" : "rows were"} imported
            </p>
            <p className="text-xs text-muted-foreground">
              This import is transactional, so no rows were skipped or failed.
            </p>
          </div>
        </div>
        <SummaryStrip
          items={[
            { label: "Imported", value: summary.imported, tone: "text-success" },
            { label: "Skipped", value: summary.skipped, tone: "text-foreground" },
            { label: "Failed", value: summary.failed, tone: "text-danger" },
          ]}
        />
        <div className="flex flex-wrap gap-2">
          <LinkButton href="/licenses">View licenses</LinkButton>
          <SecondaryButton type="button" onClick={reset}>
            <RotateCcw aria-hidden className="h-4 w-4" />
            Import another workbook
          </SecondaryButton>
        </div>
      </Panel>
    );
  }

  if (preview) {
    return (
      <Panel
        title={importing ? "Importing workbook" : "Review import"}
        description={
          importing
            ? "Keep this page open while the workbook is imported."
            : "Nothing is saved until you confirm."
        }
        bodyClassName="grid gap-4"
      >
        <div className="flex min-w-0 items-center gap-3">
          {importing ? (
            <Upload
              aria-hidden
              className="h-5 w-5 shrink-0 animate-pulse text-primary"
            />
          ) : (
            <FileSpreadsheet
              aria-hidden
              className="h-5 w-5 shrink-0 text-primary"
            />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{preview.filename}</p>
            <p className="tabular text-xs text-muted-foreground">
              {preview.rowCount} {preview.rowCount === 1 ? "row" : "rows"}{" "}
              ready to import
            </p>
          </div>
        </div>
        {error ? <FormMessage tone="danger">{error}</FormMessage> : null}
        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-3">
          <SecondaryButton type="button" onClick={reset} disabled={importing}>
            Cancel
          </SecondaryButton>
          <Button
            type="button"
            onClick={confirm}
            loading={importing}
            disabled={importing}
          >
            {importing ? "Importing..." : "Confirm import"}
          </Button>
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      title="Choose a workbook"
      description="Upload an Excel workbook to review it before any rows are saved."
      bodyClassName="p-0"
    >
      <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
        <form
          ref={formRef}
          onSubmit={submit}
          className="grid content-start gap-3 p-4"
        >
          <FileField
            label="Workbook"
            name="file"
            accept=".xlsx,.xls"
            required
            disabled={previewing}
            hint={
              selectedFilename
                ? `Selected: ${selectedFilename}`
                : "Accepted formats: .xlsx and .xls"
            }
            onChange={(event) =>
              setSelectedFilename(event.currentTarget.files?.[0]?.name ?? "")
            }
          />
          {error ? <FormMessage tone="danger">{error}</FormMessage> : null}
          <div className="flex justify-end">
            <Button loading={previewing} className="w-full sm:w-auto">
              {previewing ? null : <Upload aria-hidden className="h-4 w-4" />}
              {previewing ? "Reading..." : "Preview workbook"}
            </Button>
          </div>
        </form>
        <div className="border-t border-border p-4 text-sm lg:border-l lg:border-t-0">
          <h3 className="text-sm font-semibold">Before you upload</h3>
          <ul className="mt-2 grid gap-1.5 text-muted-foreground">
            <li>Use an .xlsx or .xls file with a License sheet.</li>
            <li>A Lookups sheet is optional.</li>
            <li>You review the rows before anything is saved.</li>
          </ul>
        </div>
      </div>
    </Panel>
  );
}

function SummaryStrip({
  items,
}: {
  items: { label: string; value: number; tone: string }[];
}) {
  return (
    <dl className="grid grid-cols-3 divide-x divide-border overflow-hidden rounded-lg border border-border">
      {items.map((item) => (
        <div key={item.label} className="px-4 py-2.5">
          <dt className="text-xs font-medium text-muted-foreground">
            {item.label}
          </dt>
          <dd
            className={`tabular mt-0.5 text-xl font-semibold ${item.tone}`}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
