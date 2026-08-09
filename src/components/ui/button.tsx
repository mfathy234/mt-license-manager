import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "focus-ring inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium transition duration-150 ease-out-quart disabled:pointer-events-none disabled:opacity-45 motion-safe:active:translate-y-px";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/90",
  secondary: "border border-border bg-elevated text-foreground hover:border-primary/40 hover:bg-muted",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  danger: "bg-danger text-white shadow-sm shadow-danger/25 hover:bg-danger/90"
};

/** `lg` matches the 56px form-control height so buttons can sit inline with fields. */
const sizes: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-lg px-3 text-sm",
  md: "h-11 gap-2 rounded-xl px-4 text-sm",
  lg: "h-14 gap-2 rounded-xl px-5 text-sm"
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
      {loading ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function SecondaryButton({ className, ...props }: Omit<ButtonProps, "variant">) {
  return <Button variant="secondary" className={className} {...props} />;
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}

/** Compact square button for icon-only affordances; still meets the 44px touch target at `md`. */
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
      className={cn(base, variants[variant], "h-11 w-11 rounded-xl", className)}
      {...props}
    >
      {children}
    </button>
  );
}
