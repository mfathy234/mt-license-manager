import type { ReactNode } from "react";

import type { PresentationTone } from "@/lib/presentation";
import { toneClassName } from "@/lib/presentation";
import { cn } from "@/lib/utils";

export type Tone = PresentationTone;

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
  failed: "danger",
};

export function toneForValue(value?: string | null): Tone {
  if (!value) return "neutral";
  return toneByValue[value.trim().toLowerCase()] ?? "neutral";
}

export function StatusPill({
  value,
  tone,
  className,
}: {
  value?: string | null;
  tone?: Tone;
  className?: string;
}) {
  const resolved = tone ?? toneForValue(value);
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md border px-1.5 py-0.5 text-xs font-medium",
        toneClassName(resolved),
        className,
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
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-sm justify-items-center gap-1 text-center">
      {icon ? (
        <span className="mb-1 grid h-8 w-8 place-items-center rounded-md bg-muted text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      ) : null}
      <p className="text-sm font-medium">{title}</p>
      {description ? (
        <p className="text-[13px] text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-1.5">{action}</div> : null}
    </div>
  );
}

export function FormMessage({
  tone,
  children,
}: {
  tone: Tone;
  children: ReactNode;
}) {
  if (!children) return null;
  return (
    <p
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "rounded-md border px-3 py-2 text-[13px] font-medium",
        toneClassName(tone),
      )}
    >
      {children}
    </p>
  );
}
