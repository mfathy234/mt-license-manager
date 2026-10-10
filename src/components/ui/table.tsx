import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Table primitives shared by every list in the app. The wrapper owns horizontal
 * scrolling so wide tables never push the page sideways.
 */
export function TableScroll({
  children,
  className,
  minWidthClassName,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  minWidthClassName?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      data-native-scroll
      role={ariaLabel ? "region" : undefined}
      aria-label={ariaLabel}
      tabIndex={ariaLabel ? 0 : undefined}
      className={cn(
        "max-w-full overflow-x-auto overscroll-contain rounded-lg border border-border bg-surface [.p-0>&]:rounded-t-none [.p-0>&]:border-0",
        className,
      )}
    >
      <table
        className={cn(
          "w-full border-separate border-spacing-0 text-left text-sm",
          minWidthClassName,
        )}
      >
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="sticky top-0 z-sticky bg-table-header text-table-header-foreground">
      {children}
    </thead>
  );
}

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

export function Th({
  children,
  align = "left",
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & {
  align?: keyof typeof alignClass;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap border-b border-border bg-table-header px-3 py-2 text-xs font-medium text-table-header-foreground",
        alignClass[align],
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function Tr({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={cn(
        "transition-colors duration-150 ease-out-quart [&:last-child>td]:border-b-0 hover:bg-muted/50",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function Td({
  children,
  align = "left",
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & {
  align?: keyof typeof alignClass;
}) {
  return (
    <td
      className={cn(
        "border-b border-border px-3 py-2 align-middle text-sm",
        alignClass[align],
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableEmpty({
  colSpan,
  children,
}: {
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-8">
        {children}
      </td>
    </tr>
  );
}
