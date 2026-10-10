"use client";

import { useId } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

/**
 * One field vocabulary for the whole app: label above, 40px control on touch
 * and 36px at lg, hairline border with a teal focus ring.
 */
const controlBase =
  "focus-ring w-full rounded-md border bg-surface px-3 text-sm transition-[border-color,box-shadow] duration-150 ease-out-quart placeholder:text-muted-foreground/70 hover:border-primary/50 focus:border-primary disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60";

const controlHeight = "h-10 lg:h-9";

function borderTone(error?: string) {
  return error ? "border-danger hover:border-danger" : "border-control-border";
}

type FieldChromeProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
  hintId?: string;
  errorId?: string;
};

function FieldChrome({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
  hintId,
  errorId,
}: FieldChromeProps) {
  return (
    <div className={cn("grid min-w-0 gap-1", className)}>
      <label
        htmlFor={htmlFor}
        className={cn(
          "text-xs font-medium",
          error ? "text-danger" : "text-foreground-muted",
        )}
      >
        <LabelText label={label} required={required} />
      </label>
      <div className="relative">{children}</div>
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function LabelText({ label, required }: { label: string; required?: boolean }) {
  return (
    <>
      {label}
      {required ? (
        <span aria-hidden className="text-danger">
          {" *"}
        </span>
      ) : null}
    </>
  );
}

function useFieldIds(hint?: string, error?: string) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return { id, hintId, errorId, describedBy: errorId ?? hintId };
}

export type FieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className"
> & {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  /** Rendered inside the control on the right, e.g. a show-password toggle. */
  adornment?: ReactNode;
};

export function Field({
  label,
  hint,
  error,
  className,
  required,
  adornment,
  ...props
}: FieldProps) {
  const { id, hintId, errorId, describedBy } = useFieldIds(hint, error);

  return (
    <FieldChrome
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={required}
      className={className}
      hintId={hintId}
      errorId={errorId}
    >
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          controlBase,
          controlHeight,
          borderTone(error),
          adornment && "pr-11",
        )}
        {...props}
      />
      {adornment ? (
        <div className="absolute right-1 top-1/2 -translate-y-1/2">
          {adornment}
        </div>
      ) : null}
    </FieldChrome>
  );
}

export type SelectFieldProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "className"
> & {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

export function SelectField({
  label,
  hint,
  error,
  className,
  required,
  children,
  ...props
}: SelectFieldProps) {
  const { id, hintId, errorId, describedBy } = useFieldIds(hint, error);

  return (
    <FieldChrome
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={required}
      className={className}
      hintId={hintId}
      errorId={errorId}
    >
      <select
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          controlBase,
          controlHeight,
          borderTone(error),
          "appearance-none pr-9",
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      >
        <path
          d="M6 8l4 4 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </FieldChrome>
  );
}

export type TextareaFieldProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className"
> & {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
};

export function TextareaField({
  label,
  hint,
  error,
  className,
  required,
  ...props
}: TextareaFieldProps) {
  const { id, hintId, errorId, describedBy } = useFieldIds(hint, error);

  return (
    <FieldChrome
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={required}
      className={className}
      hintId={hintId}
      errorId={errorId}
    >
      <textarea
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(controlBase, borderTone(error), "min-h-20 py-2")}
        {...props}
      />
    </FieldChrome>
  );
}

export type FileFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "type"
> & {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
};

export function FileField({
  label,
  hint,
  error,
  className,
  required,
  ...props
}: FileFieldProps) {
  const { id, hintId, errorId, describedBy } = useFieldIds(hint, error);

  return (
    <FieldChrome
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={required}
      className={className}
      hintId={hintId}
      errorId={errorId}
    >
      <input
        id={id}
        type="file"
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          controlBase,
          "flex h-10 items-center py-0 pl-1 lg:h-9",
          "file:mr-3 file:h-7 file:cursor-pointer file:rounded file:border-0 file:bg-muted file:px-3 file:text-sm file:font-medium file:text-foreground hover:file:bg-border",
          borderTone(error),
        )}
        {...props}
      />
    </FieldChrome>
  );
}

export function Checkbox({
  label,
  hint,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> & {
  label: string;
  hint?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("flex min-h-9 items-start gap-2.5 py-1.5", className)}>
      <input
        id={id}
        type="checkbox"
        className="focus-ring mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
        {...props}
      />
      <label
        htmlFor={id}
        className="grid gap-0.5 text-sm font-medium leading-tight"
      >
        {label}
        {hint ? (
          <span className="text-xs font-normal text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </label>
    </div>
  );
}
