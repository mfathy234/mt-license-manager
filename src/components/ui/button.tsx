import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "focus-ring inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out-quart disabled:pointer-events-none disabled:opacity-45 motion-safe:active:scale-[0.98]";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover",
  secondary:
    "border border-border bg-surface text-foreground hover:bg-muted",
  ghost: "text-foreground-muted hover:bg-muted hover:text-foreground",
  danger: "bg-danger text-white shadow-sm hover:bg-danger/90",
};

/** Heights match the form controls (h-10 touch, h-9 at lg) so buttons sit inline with fields. */
const sizes: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-md px-3 text-sm lg:h-8",
  md: "h-10 gap-2 rounded-md px-3.5 text-sm lg:h-9",
  lg: "h-11 gap-2 rounded-md px-4 text-sm lg:h-10",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  type = "submit",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
      ) : null}
      {children}
    </button>
  );
}

export function SecondaryButton({
  className,
  ...props
}: Omit<ButtonProps, "variant">) {
  return <Button variant="secondary" className={className} {...props} />;
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
    </Link>
  );
}

/** Compact square button for icon-only affordances; 40px on touch, 36px at lg. */
export function IconButton({
  label,
  className,
  variant = "secondary",
  children,
  type = "button",
  ...props
}: Omit<ButtonProps, "size"> & { label: string }) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(base, variants[variant], "h-10 w-10 rounded-md lg:h-9 lg:w-9", className)}
      {...props}
    >
      {children}
    </button>
  );
}
