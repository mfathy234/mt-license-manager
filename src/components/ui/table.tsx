import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Table primitives shared by every list in the app. The wrapper owns horizontal
 * scrolling so wide tables never push the page sideways.
 */
export function TableScroll({
  children,
  className,
  minWidthClassName
}: {
  children: ReactNode;
  className?: string;
  minWidthClassName?: string;
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className={cn("w-full border-separate border-spacing-0 text-left text-sm", minWidthClassName)}>
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="sticky top-0 z-10 bg-surface">{children}</thead>;
}

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center"
} as const;

export function Th({
  children,
  align = "left",
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & { align?: keyof typeof alignClass }) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap border-b border-border bg-surface px-3 py-2.5 text-xs font-semibold text-muted-foreground first:pl-1 last:pr-1",
        alignClass[align],
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function Tr({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn("transition-colors duration-150 ease-out-quart hover:bg-muted/45", className)}>{children}</tr>;
}

export function Td({
  children,
  align = "left",
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & { align?: keyof typeof alignClass }) {
  return (
    <td
      className={cn(
        "border-b border-border/70 px-3 py-3 align-middle first:pl-1 last:pr-1",
        alignClass[align],
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableEmpty({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="border-b border-border/70 px-3 py-12">
        {children}
      </td>
    </tr>
  );
}
