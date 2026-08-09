import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<Tone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  success: "border-success/25 bg-success-surface text-success",
  warning: "border-warning/25 bg-warning-surface text-warning",
  danger: "border-danger/25 bg-danger-surface text-danger",
  info: "border-info/25 bg-info-surface text-info"
};

/**
 * Status words come from user-managed lookups, so the tone is inferred from the
 * word itself and falls back to neutral rather than guessing wrong.
 */
const toneByValue: Record<string, Tone> = {
  active: "success",
  enabled: "success",
  sent: "success",
  paid: "success",
  admin: "info",
  editor: "info",
  created: "info",
  manual: "info",
  expiry_reminder: "info",
  pending: "warning",
  invited: "warning",
  expiring: "warning",
  inactive: "neutral",
  viewer: "neutral",
  cancelled: "neutral",
  canceled: "neutral",
  disabled: "danger",
  expired: "danger",
  failed: "danger"
};

export function toneForValue(value?: string | null): Tone {
  if (!value) return "neutral";
  return toneByValue[value.trim().toLowerCase()] ?? "neutral";
}

export function StatusPill({
  value,
  tone,
  className
}: {
  value?: string | null;
  tone?: Tone;
  className?: string;
}) {
  const resolved = tone ?? toneForValue(value);
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
        toneClasses[resolved],
        className
      )}
    >
      {value?.replace(/_/g, " ") || "Not set"}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-md justify-items-center gap-2 text-center">
      {icon ? (
        <span className="mb-1 grid h-11 w-11 place-items-center rounded-xl border border-border bg-muted text-muted-foreground">
          {icon}
        </span>
      ) : null}
      <p className="font-medium">{title}</p>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function FormMessage({ tone, children }: { tone: Tone; children: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role={tone === "danger" ? "alert" : "status"}
      className={cn("rounded-xl border px-3 py-2 text-sm font-medium", toneClasses[tone])}
    >
      {children}
    </p>
  );
}
