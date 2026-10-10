import type { ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui";
import { cn } from "@/lib/utils";

type RowActionButtonProps = Omit<
  ButtonProps,
  "variant" | "size" | "children"
> & {
  label: string;
  tone?: "default" | "danger";
  icon: ReactNode;
  showLabel?: boolean;
};

export function RowActionButton({
  label,
  tone = "default",
  icon,
  showLabel = false,
  loading,
  className,
  ...props
}: RowActionButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      loading={loading}
      title={label}
      className={cn(
        !showLabel && "lg:w-8 lg:px-0",
        tone === "danger" &&
          "text-danger hover:bg-danger-surface hover:text-danger",
        className,
      )}
      {...props}
    >
      {loading ? null : icon}
      <span className={cn(!showLabel && "lg:sr-only")}>{label}</span>
    </Button>
  );
}

export function RowActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      {children}
    </div>
  );
}
