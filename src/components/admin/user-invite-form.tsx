"use client";

import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";

import { useFormSubmit } from "@/components/admin/use-form-submit";
import { Button, Field, FormMessage, SelectField } from "@/components/ui";

const MIN_PASSWORD_LENGTH = 10;

export function UserInviteForm() {
  const [revealPassword, setRevealPassword] = useState(false);
  const { status, message, submit, saving } = useFormSubmit({
    url: "/api/users/invite",
    successMessage: "User created. Share the temporary password with them directly.",
    toBody: (form) => ({
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      role: String(form.get("role") ?? "viewer"),
      temporaryPassword: String(form.get("temporaryPassword") ?? "")
    })
  });

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <Field label="Name" name="name" autoComplete="off" />
        <Field label="Email" name="email" type="email" autoComplete="off" required />
        <SelectField label="Role" name="role" defaultValue="viewer" hint="Viewers read only. Editors manage licenses.">
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </SelectField>
        <Field
          label="Temporary password"
          name="temporaryPassword"
          type={revealPassword ? "text" : "password"}
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          required
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          adornment={
            <button
              type="button"
              onClick={() => setRevealPassword((value) => !value)}
              aria-label={revealPassword ? "Hide password" : "Show password"}
              className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {revealPassword ? <EyeOff aria-hidden className="h-4 w-4" /> : <Eye aria-hidden className="h-4 w-4" />}
            </button>
          }
        />
      </div>

      {status === "error" || status === "success" ? (
        <FormMessage tone={status === "error" ? "danger" : "success"}>{message}</FormMessage>
      ) : null}

      <div className="flex justify-end">
        <Button loading={saving}>
          {saving ? null : <UserPlus aria-hidden className="h-4 w-4" />}
          {saving ? "Creating user..." : "Create user"}
        </Button>
      </div>
    </form>
  );
}
