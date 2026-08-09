"use client";

import { Plus } from "lucide-react";

import { useFormSubmit } from "@/components/admin/use-form-submit";
import { Button, Field, FormMessage } from "@/components/ui";

export function GroupForm() {
  const { status, message, submit, saving } = useFormSubmit({
    url: "/api/groups",
    successMessage: "Group added.",
    toBody: (form) => ({
      name: String(form.get("name") ?? "").trim(),
      active: true,
      recipientIds: []
    })
  });

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
      <Field label="Group name" name="name" autoComplete="off" required />
      <Button loading={saving} size="lg" className="w-full sm:w-auto">
        {saving ? null : <Plus aria-hidden className="h-4 w-4" />}
        {saving ? "Adding..." : "Add group"}
      </Button>
      {status === "error" || status === "success" ? (
        <div className="sm:col-span-2">
          <FormMessage tone={status === "error" ? "danger" : "success"}>{message}</FormMessage>
        </div>
      ) : null}
    </form>
  );
}
