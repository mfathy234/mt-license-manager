"use client";

import { Save, Send } from "lucide-react";
import { useState } from "react";

import { Button, Checkbox, Field, FormMessage, SecondaryButton } from "@/components/ui";
import { getErrorMessage, requestJson } from "@/lib/http";

type EmailSettings = {
  host?: string | null;
  port?: number | null;
  secure?: boolean | null;
  username?: string | null;
  fromName?: string | null;
  fromEmail?: string | null;
};

type Feedback = { tone: "success" | "danger"; message: string } | null;

export function EmailSettingsForm({ settings }: { settings: EmailSettings | null }) {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    setSaving(true);
    setFeedback(null);

    try {
      await requestJson("/api/settings/email", {
        method: "PUT",
        body: { ...raw, secure: raw.secure === "on", port: Number(raw.port || 587) }
      });
      setFeedback({ tone: "success", message: "SMTP settings saved." });
    } catch (error) {
      setFeedback({ tone: "danger", message: getErrorMessage(error, "Save failed.") });
    } finally {
      setSaving(false);
    }
  }

  async function sendTest(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    const to = form ? new FormData(form).get("testTo") : null;

    if (!to) {
      setFeedback({ tone: "danger", message: "Add a test recipient address first." });
      return;
    }

    setTesting(true);
    setFeedback(null);

    try {
      await requestJson("/api/settings/email/test", { method: "POST", body: { to } });
      setFeedback({ tone: "success", message: `Test email sent to ${to}.` });
    } catch (error) {
      setFeedback({ tone: "danger", message: getErrorMessage(error, "Test email failed.") });
    } finally {
      setTesting(false);
    }
  }

  return (
    <form onSubmit={save} className="grid gap-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="SMTP host" name="host" defaultValue={settings?.host ?? ""} autoComplete="off" />
        <Field label="Port" name="port" type="number" defaultValue={settings?.port ?? 587} />
        <Field label="Username" name="username" defaultValue={settings?.username ?? ""} autoComplete="off" />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="Leave blank to keep the existing password."
        />
        <Field label="From name" name="fromName" defaultValue={settings?.fromName ?? ""} />
        <Field label="From email" name="fromEmail" type="email" defaultValue={settings?.fromEmail ?? ""} />
        <Field label="Test recipient" name="testTo" type="email" hint="Used by Send test only." />
        <Checkbox
          name="secure"
          defaultChecked={Boolean(settings?.secure)}
          label="Use TLS from connection start"
          hint="Enable for port 465. Leave off for STARTTLS on 587."
        />
      </div>

      {feedback ? <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage> : null}

      <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
        <SecondaryButton type="button" onClick={sendTest} loading={testing}>
          {testing ? null : <Send aria-hidden className="h-4 w-4" />}
          {testing ? "Sending..." : "Send test"}
        </SecondaryButton>
        <Button loading={saving}>
          {saving ? null : <Save aria-hidden className="h-4 w-4" />}
          {saving ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
