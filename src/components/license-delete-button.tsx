"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, type ButtonSize } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getErrorMessage, requestJson } from "@/lib/http";

type LicenseDeleteButtonProps = {
  licenseId: string;
  /** Shown in the confirmation message and on the confirm button. */
  licenseName: string;
  size?: ButtonSize;
  /** Where to go once the license is gone. Omit to stay put and just refresh. */
  redirectTo?: string;
  /** Drops the visible label for tight rows; the accessible name still names the license. */
  iconOnly?: boolean;
};

export function LicenseDeleteButton({
  licenseId,
  licenseName,
  size = "md",
  redirectTo,
  iconOnly = false
}: LicenseDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setDeleting(true);
    setError("");
    try {
      await requestJson(`/api/licenses/${licenseId}`, { method: "DELETE" });
      setOpen(false);
      // Never both: a `refresh()` chasing a `push()` cancels the navigation.
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Delete failed."));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="danger"
        size={size}
        aria-label={`Delete ${licenseName}`}
        title={iconOnly ? `Delete ${licenseName}` : undefined}
        onClick={() => setOpen(true)}
      >
        <Trash2 aria-hidden className="h-4 w-4" />
        {iconOnly ? null : "Delete"}
      </Button>
      <ConfirmDialog
        open={open}
        itemName={licenseName}
        title="Delete this license?"
        description="Its credentials, notification targets, and notification history are deleted with it. This cannot be undone."
        busy={deleting}
        error={error}
        onConfirm={remove}
        onCancel={() => {
          if (deleting) return;
          setOpen(false);
          setError("");
        }}
      />
    </>
  );
}
