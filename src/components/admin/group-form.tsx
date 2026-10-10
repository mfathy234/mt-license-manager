"use client";

import { Power, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { publishManagementSuccess } from "@/components/admin/management-feedback";
import { useFormSubmit } from "@/components/admin/use-form-submit";
import { RowActionButton, RowActions } from "@/components/admin/row-action";
import { ModernMultiSelect } from "@/components/modern-select";
import { Button, ConfirmDialog, Field, FormMessage } from "@/components/ui";
import { getErrorMessage, requestJson } from "@/lib/http";

type RecipientOption = { value: string; label: string };

export function GroupForm({
  recipientOptions,
}: {
  recipientOptions: RecipientOption[];
}) {
  const [formVersion, setFormVersion] = useState(0);
  const { status, message, submit, saving } = useFormSubmit({
    url: "/api/groups",
    successMessage: "Group added.",
    toBody: (form) => ({
      name: String(form.get("name") ?? "").trim(),
      active: true,
      recipientIds: form.getAll("recipientIds").map(String),
    }),
    onSuccess: () => setFormVersion((value) => value + 1),
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid gap-2 border-b border-border p-4"
    >
      <div className="grid items-end gap-3 lg:grid-cols-[1fr_1fr_auto]">
        <Field label="Group name" name="name" autoComplete="off" required />
        <ModernMultiSelect
          key={formVersion}
          label="Members"
          name="recipientIds"
          options={recipientOptions}
          selectedValues={[]}
        />
        <Button loading={saving}>
          {saving ? null : <Plus aria-hidden className="h-4 w-4" />}
          {saving ? "Adding..." : "Add group"}
        </Button>
      </div>
      {recipientOptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add a recipient before assigning members. You can still create an
          empty group.
        </p>
      ) : null}
      {status === "error" || status === "success" ? (
        <FormMessage tone={status === "error" ? "danger" : "success"}>
          {message}
        </FormMessage>
      ) : null}
    </form>
  );
}

type GroupActionRecord = {
  id: string;
  name: string;
  active: boolean;
  recipientIds: string[];
};

export function GroupActions({ group }: { group: GroupActionRecord }) {
  const { status, message, submit, saving } = useFormSubmit({
    url: `/api/groups/${group.id}`,
    method: "PUT",
    resetOnSuccess: false,
    successMessage: group.active ? "Group deactivated." : "Group activated.",
    toBody: () => ({
      name: group.name,
      active: !group.active,
      recipientIds: group.recipientIds,
    }),
  });

  const verb = group.active ? "Deactivate" : "Activate";

  return (
    <div className="grid justify-items-end gap-1">
      <RowActions>
        <form onSubmit={submit}>
          <RowActionButton
            type="submit"
            label={verb}
            loading={saving}
            icon={<Power aria-hidden className="h-4 w-4" />}
            aria-label={`${verb} ${group.name}`}
          />
        </form>
        <GroupDeleteButton group={group} />
      </RowActions>
      {status === "error" || status === "success" ? (
        <FormMessage tone={status === "error" ? "danger" : "success"}>
          {message}
        </FormMessage>
      ) : null}
    </div>
  );
}

function GroupDeleteButton({ group }: { group: GroupActionRecord }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setDeleting(true);
    setError("");

    try {
      await requestJson(`/api/groups/${group.id}`, { method: "DELETE" });
      publishManagementSuccess("groups", `${group.name} was deleted.`);
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
        aria-label={`Delete ${group.name}`}
        onClick={() => setOpen(true)}
      />
      <ConfirmDialog
        open={open}
        itemName={group.name}
        title="Delete this group?"
        description="Its memberships and license notification assignments are deleted with it. Recipients are not deleted. This cannot be undone."
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
