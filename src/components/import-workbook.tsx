"use client";

import { Upload } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Input, Panel, SecondaryButton } from "@/components/ui";

export function ImportWorkbook() {
  const router = useRouter();
  const [preview, setPreview] = useState<{ filename: string; rowCount: number; rows: unknown[] } | null>(null);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/import/preview", { method: "POST", body: new FormData(event.currentTarget) });
    if (!response.ok) {
      setError((await response.json()).error ?? "Import preview failed.");
      return;
    }
    setPreview(await response.json());
  }

  async function confirm() {
    if (!preview) return;
    const response = await fetch("/api/import/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preview)
    });
    if (!response.ok) {
      setError((await response.json()).error ?? "Import failed.");
      return;
    }
    router.push("/licenses");
    router.refresh();
  }

  return (
    <div className="grid gap-5">
      <Panel>
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
          <Input name="file" type="file" accept=".xlsx,.xls" required />
          <Button>
            <Upload aria-hidden className="h-4 w-4" />
            Preview
          </Button>
        </form>
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      </Panel>
      {preview ? (
        <Panel>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">{preview.filename}</h2>
              <p className="text-sm text-muted-foreground">{preview.rowCount} rows ready to import</p>
            </div>
            <SecondaryButton onClick={confirm}>Confirm import</SecondaryButton>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
