"use client";

import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Field, FormMessage, Panel } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSaving(true);
    setError("");

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setSaving(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Panel className="w-full max-w-sm" bodyClassName="p-6">
      <span className="mb-4 grid h-10 w-10 place-items-center overflow-hidden rounded-md border border-border bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.ico" alt="Microtec" className="h-full w-full" />
      </span>
      <h1
        id="login-title"
        className="text-xl font-semibold tracking-tight"
      >
        Sign in to your workspace
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Use your Microtec account to continue to License Manager.
      </p>
      <form onSubmit={submit} noValidate className="mt-5 grid gap-3">
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          required
        />
        <Field
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          adornment={
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              title={showPassword ? "Hide password" : "Show password"}
              className="focus-ring grid h-8 w-8 place-items-center rounded text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? (
                <EyeOff aria-hidden className="h-4 w-4" />
              ) : (
                <Eye aria-hidden className="h-4 w-4" />
              )}
            </button>
          }
        />
        {error ? <FormMessage tone="danger">{error}</FormMessage> : null}
        <Button loading={saving} className="mt-1 w-full">
          {saving ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Panel>
  );
}
