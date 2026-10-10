"use client";

import { Power, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { publishManagementSuccess } from "@/components/admin/management-feedback";
import { useFormSubmit } from "@/components/admin/use-form-submit";
import { RowActionButton, RowActions } from "@/components/admin/row-action";
import { Button, ConfirmDialog, Field, FormMessage } from "@/components/ui";
import { getErrorMessage, requestJson } from "@/lib/http";

export function RecipientForm() {
  const { status, message, submit, saving } = useFormSubmit({
    url: "/api/recipients",
    successMessage: "Recipient added.",
    toBody: (form) => ({
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      active: true,
    }),
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid gap-2 border-b border-border p-4"
    >
      <div className="grid items-end gap-3 lg:grid-cols-[1fr_1fr_auto]">
        <Field label="Name" name="name" autoComplete="off" required />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="off"
          required
        />
        <Button loading={saving}>
          {saving ? null : <Plus aria-hidden className="h-4 w-4" />}
          {saving ? "Adding..." : "Add recipient"}
        </Button>
      </div>
      {status === "error" || status === "success" ? (
        <FormMessage tone={status === "error" ? "danger" : "success"}>
          {message}
        </FormMessage>
      ) : null}
    </form>
  );
}

type RecipientActionRecord = {
  id: string;
  name: string;
  email: string;
  active: boolean;
};

export function RecipientActions({
  recipient,
}: {
  recipient: RecipientActionRecord;
}) {
  const { status, message, submit, saving } = useFormSubmit({
    url: `/api/recipients/${recipient.id}`,
    method: "PUT",
    resetOnSuccess: false,
    successMessage: recipient.active
      ? "Recipient deactivated."
      : "Recipient activated.",
    toBody: () => ({
      name: recipient.name,
      email: recipient.email,
      active: !recipient.active,
    }),
  });

  const verb = recipient.active ? "Deactivate" : "Activate";

  return (
    <div className="grid justify-items-end gap-1">
      <RowActions>
        <form onSubmit={submit}>
          <RowActionButton
            type="submit"
            label={verb}
            loading={saving}
            icon={<Power aria-hidden className="h-4 w-4" />}
            aria-label={`${verb} ${recipient.name}`}
          />
        </form>
        <RecipientDeleteButton recipient={recipient} />
      </RowActions>
      {status === "error" || status === "success" ? (
        <FormMessage tone={status === "error" ? "danger" : "success"}>
          {message}
        </FormMessage>
      ) : null}
    </div>
  );
}

function RecipientDeleteButton({
  recipient,
}: {
  recipient: RecipientActionRecord;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setDeleting(true);
    setError("");

    try {
      await requestJson(`/api/recipients/${recipient.id}`, {
        method: "DELETE",
      });
      publishManagementSuccess("recipients", `${recipient.name} was deleted.`);
      setOpen(false);
      router.refresh();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Delete failed."));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <RowActionButton
        type="button"
        label="Delete"
        tone="danger"
        icon={<Trash2 aria-hidden className="h-4 w-4" />}
        aria-label={`Delete ${recipient.name}`}
        onClick={() => setOpen(true)}
      />
      <ConfirmDialog
        open={open}
        itemName={`${recipient.name} (${recipient.email})`}
        title="Delete this recipient?"
        description="Their group memberships and license notification assignments are deleted with them. This cannot be undone."
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
