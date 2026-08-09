"use client";

import { useId } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * One field vocabulary for the whole app: 56px tall, 12px radius, label floating
 * inside the control. Every form surface uses these instead of hand-rolled inputs.
 */
const controlBase =
  "focus-ring peer w-full rounded-xl border bg-elevated/80 px-4 text-sm shadow-sm transition duration-150 ease-out-quart placeholder:text-muted-foreground/70 hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60";

const labelBase =
  "pointer-events-none absolute left-4 z-10 max-w-[calc(100%-2rem)] truncate font-medium transition-all duration-150 ease-out-quart";

function borderTone(error?: string) {
  return error ? "border-danger hover:border-danger" : "border-border";
}

function labelTone(error?: string) {
  return error ? "text-danger" : "text-muted-foreground peer-focus:text-primary";
}

type FieldChromeProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
  /** Ids of the hint/error nodes, wired into the control via aria-describedby. */
  describedBy?: string;
  hintId?: string;
  errorId?: string;
};

function FieldChrome({ hint, error, className, children, hintId, errorId }: FieldChromeProps) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="relative">{children}</div>
      {error ? (
        <p id={errorId} role="alert" className="px-1 text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="px-1 text-xs text-muted-foreground">
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

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  /** Rendered inside the control on the right, e.g. a show-password toggle. */
  adornment?: ReactNode;
};

export function Field({ label, hint, error, className, required, adornment, ...props }: FieldProps) {
  const { id, hintId, errorId, describedBy } = useFieldIds(hint, error);

  return (
    <FieldChrome label={label} hint={hint} error={error} className={className} hintId={hintId} errorId={errorId}>
      <input
        id={id}
        placeholder=" "
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          controlBase,
          borderTone(error),
          "h-14 pb-2 pt-6 placeholder:text-transparent",
          adornment && "pr-12"
        )}
        {...props}
      />
      <label
        htmlFor={id}
        className={cn(
          labelBase,
          labelTone(error),
          "top-2 text-xs peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs"
        )}
      >
        <LabelText label={label} required={required} />
      </label>
      {adornment ? <div className="absolute right-2 top-1/2 -translate-y-1/2">{adornment}</div> : null}
    </FieldChrome>
  );
}

export type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

export function SelectField({ label, hint, error, className, required, children, ...props }: SelectFieldProps) {
  const { id, hintId, errorId, describedBy } = useFieldIds(hint, error);

  return (
    <FieldChrome label={label} hint={hint} error={error} className={className} hintId={hintId} errorId={errorId}>
      <select
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(controlBase, borderTone(error), "h-14 appearance-none pb-2 pr-10 pt-6")}
        {...props}
      >
        {children}
      </select>
      <label htmlFor={id} className={cn(labelBase, labelTone(error), "top-2 text-xs")}>
        <LabelText label={label} required={required} />
      </label>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      >
        <path d="M6 8l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </FieldChrome>
  );
}

export type TextareaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
};

export function TextareaField({ label, hint, error, className, required, ...props }: TextareaFieldProps) {
  const { id, hintId, errorId, describedBy } = useFieldIds(hint, error);

  return (
    <FieldChrome label={label} hint={hint} error={error} className={className} hintId={hintId} errorId={errorId}>
      <textarea
        id={id}
        placeholder=" "
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(controlBase, borderTone(error), "min-h-28 pb-3 pt-7 placeholder:text-transparent")}
        {...props}
      />
      <label
        htmlFor={id}
        className={cn(
          labelBase,
          labelTone(error),
          "top-2 text-xs peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs"
        )}
      >
        <LabelText label={label} required={required} />
      </label>
    </FieldChrome>
  );
}

export type FileFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type"> & {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
};

/** File inputs cannot host a floating label, so the label sits above at the same rhythm. */
export function FileField({ label, hint, error, className, required, ...props }: FileFieldProps) {
  const { id, hintId, errorId, describedBy } = useFieldIds(hint, error);

  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className={cn("px-1 text-xs font-medium", error ? "text-danger" : "text-muted-foreground")}>
        <LabelText label={label} required={required} />
      </label>
      <input
        id={id}
        type="file"
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "focus-ring flex h-14 w-full items-center rounded-xl border bg-elevated/80 px-4 text-sm shadow-sm transition duration-150 ease-out-quart hover:border-primary/40",
          "file:mr-4 file:h-8 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:px-3 file:text-sm file:font-medium file:text-primary-foreground",
          borderTone(error)
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} role="alert" className="px-1 text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="px-1 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Checkbox({
  label,
  hint,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> & { label: string; hint?: string; className?: string }) {
  const id = useId();
  return (
    <div className={cn("flex min-h-14 items-start gap-3 rounded-xl border border-border bg-elevated/80 px-4 py-3", className)}>
      <input
        id={id}
        type="checkbox"
        className="focus-ring mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
        {...props}
      />
      <label htmlFor={id} className="grid gap-0.5 text-sm font-medium leading-tight">
        {label}
        {hint ? <span className="text-xs font-normal text-muted-foreground">{hint}</span> : null}
      </label>
    </div>
  );
}
