"use client";

import { Send, Save } from "lucide-react";
import { useState } from "react";

import { Button, Input, Label, SecondaryButton } from "@/components/ui";

type EmailSettings = {
  host?: string | null;
  port?: number | null;
  secure?: boolean | null;
  username?: string | null;
  fromName?: string | null;
  fromEmail?: string | null;
};

export function EmailSettingsForm({ settings }: { settings: EmailSettings | null }) {
  const [message, setMessage] = useState("");

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/settings/email", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...raw, secure: raw.secure === "on", port: Number(raw.port || 587) })
    });
    setMessage(response.ok ? "Saved." : "Save failed.");
  }

  async function test(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    const to = form ? new FormData(form).get("testTo") : null;
    const response = await fetch("/api/settings/email/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to })
    });
    setMessage(response.ok ? "Test email sent." : "Test email failed.");
  }

  return (
    <form onSubmit={save} className="grid gap-5 lg:grid-cols-2">
      <Label>
        SMTP host
        <Input name="host" defaultValue={settings?.host ?? ""} />
      </Label>
      <Label>
        Port
        <Input name="port" type="number" defaultValue={settings?.port ?? 587} />
      </Label>
      <Label>
        Username
        <Input name="username" defaultValue={settings?.username ?? ""} />
      </Label>
      <Label>
        Password
        <Input name="password" type="password" placeholder="Leave blank to keep existing password" />
      </Label>
      <Label>
        From name
        <Input name="fromName" defaultValue={settings?.fromName ?? ""} />
      </Label>
      <Label>
        From email
        <Input name="fromEmail" type="email" defaultValue={settings?.fromEmail ?? ""} />
      </Label>
      <Label>
        Test recipient
        <Input name="testTo" type="email" />
      </Label>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input name="secure" type="checkbox" defaultChecked={Boolean(settings?.secure)} className="h-4 w-4" />
        Use TLS from connection start
      </label>
      {message ? <p className="text-sm text-muted-foreground lg:col-span-2">{message}</p> : null}
      <div className="flex gap-3 lg:col-span-2">
        <Button>
          <Save aria-hidden className="h-4 w-4" />
          Save
        </Button>
        <SecondaryButton type="button" onClick={test}>
          <Send aria-hidden className="h-4 w-4" />
          Send test
        </SecondaryButton>
      </div>
    </form>
  );
}
