"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Input, Label, Panel } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false
    });
    setSaving(false);
    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Panel className="w-full max-w-md">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <form onSubmit={submit} className="mt-5 grid gap-4">
        <Label>
          Email
          <Input name="email" type="email" required />
        </Label>
        <Label>
          Password
          <Input name="password" type="password" required />
        </Label>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button disabled={saving}>{saving ? "Signing in..." : "Sign in"}</Button>
      </form>
    </Panel>
  );
}
