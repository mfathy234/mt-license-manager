"use client";

import { Eye, EyeOff, Save, Settings2, UserPlus } from "lucide-react";
import { useId, useState } from "react";

import { RowActionButton } from "@/components/admin/row-action";
import { useFormSubmit } from "@/components/admin/use-form-submit";
import { Button, Field, FormMessage, SelectField } from "@/components/ui";

const MIN_PASSWORD_LENGTH = 10;

export function UserInviteForm() {
  const [revealPassword, setRevealPassword] = useState(false);
  const { status, message, submit, saving } = useFormSubmit({
    url: "/api/users/invite",
    successMessage:
      "User created. Share the temporary password with them directly.",
    toBody: (form) => ({
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      role: String(form.get("role") ?? "viewer"),
      temporaryPassword: String(form.get("temporaryPassword") ?? ""),
    }),
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid gap-2 border-b border-border p-4"
    >
      <div className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_9rem_1fr_auto]">
        <Field label="Name" name="name" autoComplete="off" />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="off"
          required
        />
        <SelectField label="Role" name="role" defaultValue="viewer">
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
          adornment={
            <button
              type="button"
              onClick={() => setRevealPassword((value) => !value)}
              aria-label={revealPassword ? "Hide password" : "Show password"}
              className="focus-ring grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
            >
              {revealPassword ? (
                <EyeOff aria-hidden className="h-4 w-4" />
              ) : (
                <Eye aria-hidden className="h-4 w-4" />
              )}
            </button>
          }
        />
        <Button loading={saving}>
          {saving ? null : <UserPlus aria-hidden className="h-4 w-4" />}
          {saving ? "Creating user..." : "Create user"}
        </Button>
      </div>
      <p className="text-xs text-foreground-muted">
        Viewers read only, editors manage licenses. The temporary password needs
        at least {MIN_PASSWORD_LENGTH} characters.
      </p>
      {status === "error" || status === "success" ? (
        <FormMessage tone={status === "error" ? "danger" : "success"}>
          {message}
        </FormMessage>
      ) : null}
    </form>
  );
}

type UserAccessRecord = {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "invited" | "disabled";
};

export function UserAccessActions({ user }: { user: UserAccessRecord }) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  return (
    <div className="grid justify-items-end gap-2">
      <RowActionButton
        type="button"
        label={expanded ? "Close" : "Manage"}
        icon={<Settings2 aria-hidden className="h-4 w-4" />}
        showLabel
        aria-expanded={expanded}
        aria-controls={panelId}
        aria-label={
          expanded
            ? `Close management for ${user.email}`
            : `Manage ${user.email}`
        }
        onClick={() => setExpanded((value) => !value)}
      />
      {expanded ? (
        <div
          id={panelId}
          className="grid w-full gap-3 rounded-md bg-muted/60 p-3 text-left sm:min-w-[17rem]"
        >
          <UserRoleForm user={user} />
          <UserStatusForm user={user} />
        </div>
      ) : null}
    </div>
  );
}

function UserRoleForm({ user }: { user: UserAccessRecord }) {
  const { status, message, submit, saving } = useFormSubmit({
    url: `/api/users/${user.id}/role`,
    method: "PATCH",
    resetOnSuccess: false,
    successMessage: `Role updated for ${user.email}.`,
    toBody: (form) => ({ role: String(form.get("role") ?? user.role) }),
  });

  return (
    <form onSubmit={submit} className="grid gap-2">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
        <SelectField label="Role" name="role" defaultValue={user.role}>
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </SelectField>
        <Button
          type="submit"
          variant="secondary"
          size="md"
          loading={saving}
          aria-label={`Save role for ${user.email}`}
        >
          {saving ? null : <Save aria-hidden className="h-4 w-4" />}
          Save
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

function UserStatusForm({ user }: { user: UserAccessRecord }) {
  const { status, message, submit, saving } = useFormSubmit({
    url: `/api/users/${user.id}/status`,
    method: "PATCH",
    resetOnSuccess: false,
    successMessage: `Status updated for ${user.email}.`,
    toBody: (form) => ({
      status: String(form.get("status") ?? user.status),
    }),
  });

  return (
    <form onSubmit={submit} className="grid gap-2">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
        <SelectField label="Status" name="status" defaultValue={user.status}>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="disabled">Disabled</option>
        </SelectField>
        <Button
          type="submit"
          variant="secondary"
          size="md"
          loading={saving}
          aria-label={`Save status for ${user.email}`}
        >
          {saving ? null : <Save aria-hidden className="h-4 w-4" />}
          Save
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
