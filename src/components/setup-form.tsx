"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Input, Label, Panel } from "@/components/ui";

export function SetupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    setSaving(false);
    if (!response.ok) {
      setError((await response.json()).error ?? "Setup failed.");
      return;
    }
    router.push("/login");
  }

  return (
    <Panel className="w-full max-w-md">
      <h1 className="text-xl font-semibold">First admin setup</h1>
      <form onSubmit={submit} className="mt-5 grid gap-4">
        <Label>
          Name
          <Input name="name" required />
        </Label>
        <Label>
          Email
          <Input name="email" type="email" required />
        </Label>
        <Label>
          Password
          <Input name="password" type="password" minLength={10} required />
        </Label>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button disabled={saving}>{saving ? "Creating..." : "Create admin"}</Button>
      </form>
    </Panel>
  );
}
