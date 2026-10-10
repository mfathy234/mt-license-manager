"use client";

import { Save, Send } from "lucide-react";
import { useState, type ReactNode } from "react";

import {
  Button,
  Checkbox,
  Field,
  FormMessage,
  Panel,
  SecondaryButton,
} from "@/components/ui";
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

export function EmailSettingsForm({
  settings,
  hasPassword,
}: {
  settings: EmailSettings | null;
  hasPassword: boolean;
}) {
  const [saveFeedback, setSaveFeedback] = useState<Feedback>(null);
  const [testFeedback, setTestFeedback] = useState<Feedback>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const { password, ...settingsValues } = raw;
    setSaving(true);
    setSaveFeedback(null);

    try {
      await requestJson("/api/settings/email", {
        method: "PUT",
        body: {
          ...settingsValues,
          secure: raw.secure === "on",
          port: Number(raw.port || 587),
          ...(typeof password === "string" && password.length > 0
            ? { password }
            : {}),
        },
      });
      setSaveFeedback({ tone: "success", message: "SMTP settings saved." });
    } catch (error) {
      setSaveFeedback({
        tone: "danger",
        message: getErrorMessage(error, "Save failed."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function sendTest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const to = new FormData(event.currentTarget).get("testTo");

    if (!to) {
      setTestFeedback({
        tone: "danger",
        message: "Add a test recipient address first.",
      });
      return;
    }

    setTesting(true);
    setTestFeedback(null);

    try {
      await requestJson("/api/settings/email/test", {
        method: "POST",
        body: { to },
      });
      setTestFeedback({
        tone: "success",
        message: `Test email sent to ${to}.`,
      });
    } catch (error) {
      setTestFeedback({
        tone: "danger",
        message: getErrorMessage(error, "Test email failed."),
      });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="grid gap-4">
      <form aria-label="SMTP settings" onSubmit={save} className="contents">
        <Panel bodyClassName="p-0">
          <div className="divide-y divide-border">
            <SettingsSection
              title="Connection"
              description="SMTP server and transport security."
            >
              <Field
                label="SMTP host"
                name="host"
                defaultValue={settings?.host ?? ""}
                autoComplete="off"
              />
              <Field
                label="Port"
                name="port"
                type="number"
                defaultValue={settings?.port ?? 587}
              />
              <Checkbox
                name="secure"
                defaultChecked={Boolean(settings?.secure)}
                label="Use TLS from connection start"
                hint="Enable for port 465. Leave off for STARTTLS on 587."
                className="sm:col-span-2"
              />
            </SettingsSection>

            <SettingsSection
              title="Authentication"
              description="Credentials from your mail provider. The saved password is never displayed."
            >
              <Field
                label="Username"
                name="username"
                defaultValue={settings?.username ?? ""}
                autoComplete="off"
              />
              <Field
                label="Password"
                name="password"
                type="password"
                autoComplete="new-password"
                hint={
                  hasPassword
                    ? "Leave blank to keep the existing password."
                    : "Enter the SMTP password to complete initial setup."
                }
              />
            </SettingsSection>

            <SettingsSection
              title="Sender identity"
              description="Name and address shown on license emails."
            >
              <Field
                label="From name"
                name="fromName"
                defaultValue={settings?.fromName ?? ""}
              />
              <Field
                label="From email"
                name="fromEmail"
                type="email"
                defaultValue={settings?.fromEmail ?? ""}
              />
            </SettingsSection>
          </div>

          <div className="flex flex-col-reverse items-stretch gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-end">
            {saveFeedback ? (
              <div className="sm:mr-auto">
                <FormMessage tone={saveFeedback.tone}>
                  {saveFeedback.message}
                </FormMessage>
              </div>
            ) : null}
            <Button loading={saving}>
              {saving ? null : <Save aria-hidden className="h-4 w-4" />}
              {saving ? "Saving..." : "Save settings"}
            </Button>
          </div>
        </Panel>
      </form>

      <form aria-label="SMTP test message" onSubmit={sendTest}>
        <Panel bodyClassName="p-0">
          <SettingsSection
            title="Test message"
            description="Send a delivery check using the saved settings."
          >
            <div className="grid items-start gap-3 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <Field
                label="Test recipient"
                name="testTo"
                type="email"
                hint="Used by Send test only."
              />
              <SecondaryButton
                type="submit"
                loading={testing}
                className="sm:mt-5"
              >
                {testing ? null : <Send aria-hidden className="h-4 w-4" />}
                {testing ? "Sending..." : "Send test"}
              </SecondaryButton>
            </div>
            {testFeedback ? (
              <div className="sm:col-span-2">
                <FormMessage tone={testFeedback.tone}>
                  {testFeedback.message}
                </FormMessage>
              </div>
            ) : null}
          </SettingsSection>
        </Panel>
      </form>
    </div>
  );
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-3 px-4 py-4 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="grid content-start items-start gap-x-4 gap-y-3 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}
