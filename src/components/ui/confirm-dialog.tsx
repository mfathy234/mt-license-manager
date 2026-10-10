"use client";

import { AlertTriangle } from "lucide-react";

import { Button, SecondaryButton } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormMessage } from "@/components/ui/feedback";

/** Keeps a destructive button label readable when an item has a very long name. */
const MAX_LABEL_NAME = 32;

function shorten(name: string) {
  return name.length > MAX_LABEL_NAME
    ? `${name.slice(0, MAX_LABEL_NAME - 1)}…`
    : name;
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
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      busy={busy}
      role="alertdialog"
      ariaLabelledBy="confirm-dialog-title"
      ariaDescribedBy="confirm-dialog-description"
      panelClassName="max-w-md p-4"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-danger-surface text-danger">
          <AlertTriangle aria-hidden className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 id="confirm-dialog-title" className="text-base font-semibold">
            {title}
          </h2>
          <p
            id="confirm-dialog-description"
            className="mt-1 text-[13px] text-muted-foreground"
          >
            {description}
          </p>
        </div>
      </div>

      <p
        className="mt-3 truncate rounded-md bg-muted px-3 py-2 text-sm font-medium"
        title={itemName}
      >
        {itemName}
      </p>

      {error ? (
        <div className="mt-3">
          <FormMessage tone="danger">{error}</FormMessage>
        </div>
      ) : null}

      <div className="mt-4 flex justify-end gap-2">
        <SecondaryButton
          type="button"
          data-dialog-initial-focus
          onClick={onCancel}
          disabled={busy}
        >
          Cancel
        </SecondaryButton>
        <Button
          type="button"
          variant="danger"
          onClick={onConfirm}
          loading={busy}
        >
          {busy
            ? `${confirmVerb}ing...`
            : `${confirmVerb} ${shorten(itemName)}`}
        </Button>
      </div>
    </Dialog>
  );
}
