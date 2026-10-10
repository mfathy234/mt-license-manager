import Link from "next/link";
import type { ReactNode } from "react";

import type { PresentationTone } from "@/lib/presentation";
import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
  bodyClassName,
  title,
  description,
  actions,
}: {
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
}) {
  const hasHeader = Boolean(title || description || actions);

  return (
    <section
      className={cn(
        "min-w-0 rounded-lg border border-border bg-surface",
        className,
      )}
    >
      {hasHeader ? (
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            {title ? (
              <h2 className="truncate text-sm font-semibold">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center gap-2">
              {actions}
            </div>
          ) : null}
        </header>
      ) : null}
      <div
        className={cn(
          "min-w-0 p-4 [&>:last-child]:rounded-b-[calc(var(--radius-lg)-1px)]",
          bodyClassName,
        )}
      >{children}</div>
    </section>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-balance lg:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-0.5 max-w-[70ch] text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

const toneInk: Record<PresentationTone, string> = {
  neutral: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
};

const toneHint: Record<PresentationTone, string> = {
  neutral: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
};

export type StatItem = {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: PresentationTone;
  icon?: ReactNode;
  href?: string;
};

function StatCellContent({ label, value, hint, tone, icon }: StatItem) {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[13px] text-muted-foreground">{label}</p>
        {icon ? (
          <span
            className={cn(
              "shrink-0 [&>svg]:h-4 [&>svg]:w-4",
              tone ? toneHint[tone] : "text-muted-foreground",
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "tabular mt-1 text-2xl font-semibold leading-none",
          tone ? toneInk[tone] : "text-foreground",
        )}
      >
        {value}
      </p>
      {hint ? (
        <p
          className={cn(
            "mt-1.5 truncate text-xs",
            tone && tone !== "neutral" ? toneHint[tone] : "text-muted-foreground",
          )}
        >
          {hint}
        </p>
      ) : null}
    </>
  );
}

/** One bordered container split into hairline-divided cells; tone colors only the value, hint, and icon. */
export function StatStrip({ items }: { items: StatItem[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div
        className="-mb-px -mr-px grid grid-cols-2 lg:[grid-template-columns:repeat(var(--stat-count),minmax(0,1fr))]"
        style={{ ["--stat-count" as string]: items.length }}
      >
        {items.map((item) => {
          const cell =
            "block min-w-0 border-b border-r border-border bg-surface px-4 py-3 transition-colors duration-150";
          return item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className={cn(cell, "focus-ring hover:bg-muted/50")}
            >
              <StatCellContent {...item} />
            </Link>
          ) : (
            <div key={item.label} className={cell}>
              <StatCellContent {...item} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: string;
  tone?: PresentationTone;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3">
      <StatCellContent label={label} value={value} icon={icon} hint={hint} tone={tone} />
    </div>
  );
}
