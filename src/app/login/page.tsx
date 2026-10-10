import { CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-[100dvh] bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      <section className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        <LoginForm />
      </section>

      <aside className="relative hidden overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="relative z-10 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-md bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.ico" alt="Microtec" className="h-full w-full" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">
              Microtec
            </p>
            <p className="text-xs text-sidebar-foreground/60">
              License Manager
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg py-12">
          <span className="mb-5 grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-accent">
            <ShieldCheck aria-hidden className="h-5 w-5" />
          </span>
          <h2 className="max-w-md text-2xl font-semibold leading-snug tracking-tight text-white">
            Secure license operations, kept in one place.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-sidebar-foreground/70">
            Review renewals, ownership, credentials, and notification activity
            through a focused operational workspace.
          </p>

          <ul className="mt-6 grid gap-3 text-sm text-sidebar-foreground/80">
            <li className="flex items-center gap-3">
              <CheckCircle2
                aria-hidden
                className="h-4 w-4 shrink-0 text-accent"
              />
              Permission-aware access for every role
            </li>
            <li className="flex items-center gap-3">
              <LockKeyhole
                aria-hidden
                className="h-4 w-4 shrink-0 text-accent"
              />
              Credentials remain protected by existing security controls
            </li>
          </ul>
        </div>

        <p className="relative z-10 text-xs text-sidebar-foreground/60">
          Authorized Microtec users only
        </p>
      </aside>
    </main>
  );
}
