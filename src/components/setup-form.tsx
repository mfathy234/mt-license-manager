"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Field, FormMessage, Panel } from "@/components/ui";
import { getErrorMessage, requestJson } from "@/lib/http";

const MIN_PASSWORD_LENGTH = 10;

export function SetupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setSaving(true);
    setError("");

    try {
      await requestJson("/api/setup", { method: "POST", body: data });
      router.push("/login");
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Setup failed."));
      setSaving(false);
    }
  }

  return (
    <Panel className="w-full max-w-md">
      <h1 className="text-xl font-semibold">First admin setup</h1>
      <p className="mt-1 text-sm text-muted-foreground">This account gets full access to every license and setting.</p>
      <form onSubmit={submit} noValidate className="mt-6 grid gap-4">
        <Field label="Name" name="name" autoComplete="name" required />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field
          label="Password"
          name="password"
          type="password"
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          required
        />
        {error ? <FormMessage tone="danger">{error}</FormMessage> : null}
        <Button loading={saving} className="w-full">
          {saving ? "Creating..." : "Create admin"}
        </Button>
      </form>
    </Panel>
  );
}
