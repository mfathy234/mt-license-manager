"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { Button, SecondaryButton } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/feedback";

/** Keeps a destructive button label readable when an item has a very long name. */
const MAX_LABEL_NAME = 32;

function shorten(name: string) {
  return name.length > MAX_LABEL_NAME ? `${name.slice(0, MAX_LABEL_NAME - 1)}…` : name;
}

export type ConfirmDialogProps = {
  open: boolean;
  /** The exact thing being destroyed. Named in the message and on the confirm button. */
  itemName: string;
  title: string;
  /** What happens on confirm — spell out anything that goes with the item. */
  description: string;
  /** Verb used in the confirm button, e.g. "Delete". */
  confirmVerb?: string;
  busy?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * The single confirmation step for irreversible actions. Every destructive path
 * in the app routes through here so the wording, the escape hatches, and the
 * "name the item" rule stay consistent and cannot be skipped.
 */
export function ConfirmDialog({
  open,
  itemName,
  title,
  description,
  confirmVerb = "Delete",
  busy = false,
  error,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-backdrop grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
      onPointerDown={(event) => {
        // Cancel is the safe default, so a click outside dismisses.
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="glass-surface z-modal w-full max-w-md rounded-2xl border p-5 shadow-glass"
      >
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-danger/10 text-danger">
            <AlertTriangle aria-hidden className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-dialog-title" className="text-lg font-semibold">
              {title}
            </h2>
            <p id="confirm-dialog-description" className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <p className="mt-4 truncate rounded-xl border border-border bg-elevated px-4 py-3 text-sm font-medium" title={itemName}>
          {itemName}
        </p>

        {error ? (
          <div className="mt-4">
            <FormMessage tone="danger">{error}</FormMessage>
          </div>
        ) : null}

        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
          <SecondaryButton type="button" autoFocus onClick={onCancel} disabled={busy}>
            Cancel
          </SecondaryButton>
          <Button type="button" variant="danger" onClick={onConfirm} loading={busy}>
            {busy ? `${confirmVerb}ing...` : `${confirmVerb} ${shorten(itemName)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
