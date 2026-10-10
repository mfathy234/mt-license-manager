import { Search, X } from "lucide-react";
import type { ReactNode } from "react";

import { Button, LinkButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RecordList({
  children,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <ul
      aria-label={ariaLabel}
      className={cn(
        "m-0 list-none divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface p-0 [&>li]:px-4 [&>li]:py-3",
        className,
      )}
    >
      {children}
    </ul>
  );
}

export function ManagementSearch({
  action,
  ariaLabel,
  defaultValue,
  placeholder,
}: {
  action: string;
  ariaLabel: string;
  defaultValue: string;
  placeholder: string;
}) {
  return (
    <form
      role="search"
      action={action}
      className="flex items-center gap-2"
    >
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">{ariaLabel}</span>
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="focus-ring h-10 w-full rounded-md border border-control-border bg-surface pl-9 pr-3 text-sm transition-[border-color,box-shadow] duration-150 ease-out-quart placeholder:text-muted-foreground hover:border-primary/50 focus:border-primary lg:h-9"
        />
      </label>
      <Button type="submit" variant="secondary" className="shrink-0">
        Search
      </Button>
      {defaultValue ? (
        <LinkButton href={action} variant="ghost">
          <X aria-hidden className="h-4 w-4" />
          Clear
        </LinkButton>
      ) : null}
    </form>
  );
}
