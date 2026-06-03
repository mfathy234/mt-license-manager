import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export function SecondaryButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-elevated px-4 text-sm font-medium transition hover:bg-muted",
        className
      )}
      {...props}
    />
  );
}

export function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 transition hover:brightness-105"
    >
      {children}
    </Link>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="focus-ring h-10 w-full rounded-md border border-border bg-elevated px-3 text-sm shadow-sm placeholder:text-muted-foreground"
      {...props}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="focus-ring min-h-24 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground"
      {...props}
    />
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-sm font-medium text-foreground">{children}</label>;
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-lg border border-border bg-surface/90 p-5 shadow-panel backdrop-blur-sm", className)}>{children}</section>;
}

export function StatusPill({ value }: { value?: string | null }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
      {value || "Not set"}
    </span>
  );
}
