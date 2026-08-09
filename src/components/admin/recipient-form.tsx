"use client";

import { Plus } from "lucide-react";

import { useFormSubmit } from "@/components/admin/use-form-submit";
import { Button, Field, FormMessage } from "@/components/ui";

export function RecipientForm() {
  const { status, message, submit, saving } = useFormSubmit({
    url: "/api/recipients",
    successMessage: "Recipient added.",
    toBody: (form) => ({
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      active: true
    })
  });

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" autoComplete="off" required />
        <Field label="Email" name="email" type="email" autoComplete="off" required />
      </div>

      {status === "error" || status === "success" ? (
        <FormMessage tone={status === "error" ? "danger" : "success"}>{message}</FormMessage>
      ) : null}

      <div className="flex justify-end">
        <Button loading={saving}>
          {saving ? null : <Plus aria-hidden className="h-4 w-4" />}
          {saving ? "Adding..." : "Add recipient"}
        </Button>
      </div>
    </form>
  );
}
