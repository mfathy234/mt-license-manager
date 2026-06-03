"use client";

import { DayPicker } from "@daypicker/react";
import { CalendarDays, Save } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type LicenseFormProps = {
  action: "create" | "update";
  license?: Record<string, unknown>;
  adminOptions?: Array<{ id: string; name: string }>;
  lookupOptions?: Record<string, Array<{ id: string; value: string }>>;
};

export function LicenseForm({ action, license, adminOptions = [], lookupOptions = {} }: LicenseFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const data = {
      ...Object.fromEntries(formData),
      adminIds: formData.getAll("adminIds").map(String)
    };
    const response = await fetch(action === "create" ? "/api/licenses" : `/api/licenses/${license?.id}`, {
      method: action === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    setSaving(false);
    if (!response.ok) {
      setError((await response.json()).error ?? "Save failed.");
      return;
    }
    const payload = await response.json();
    router.push(`/licenses/${payload.license.id}`);
    router.refresh();
  }

  const value = (key: string) => (license?.[key] ? String(license[key]).slice(0, 10) : "");

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-2">
      <FloatingInput label="Details" name="details" defaultValue={value("details")} required />
      <FloatingSelect label="Status" name="status" defaultValue={value("status")} options={lookupOptions.status} />
      <FloatingSelect label="Service type" name="serviceType" defaultValue={value("serviceType")} options={lookupOptions.serviceType} />
      <FloatingSelect label="Branch" name="branch" defaultValue={value("branch")} options={lookupOptions.branch} />
      <FloatingInput label="Vendor" name="vendor" defaultValue={value("vendor")} />
      <FloatingInput label="Users count" name="usersCount" type="number" min="0" defaultValue={value("usersCount")} />
      <FloatingInput label="Owner account" name="ownerAccount" defaultValue={value("ownerAccount")} />
      <FloatingMultiSelect
        label="Admins"
        name="adminIds"
        options={adminOptions.map((admin) => ({ value: admin.id, label: admin.name }))}
        selectedValues={Array.isArray(license?.adminIds) ? (license.adminIds as string[]) : []}
      />
      <FloatingDatePicker label="Start date" name="startDate" initialValue={value("startDate")} />
      <FloatingDatePicker label="Expiry date" name="expiryDate" initialValue={value("expiryDate")} />
      <FloatingSelect label="Payment method" name="paymentMethod" defaultValue={value("paymentMethod")} options={lookupOptions.paymentMethod} />
      <FloatingSelect label="Renewal frequency" name="renewalFrequency" defaultValue={value("renewalFrequency")} options={lookupOptions.renewalFrequency} />
      <FloatingInput label="Monthly EGP" name="monthlyCostEgp" type="number" step="0.01" defaultValue={value("monthlyCostEgp") || value("costEgp")} />
      <FloatingInput label="Yearly EGP" name="yearlyCostEgp" type="number" step="0.01" defaultValue={value("yearlyCostEgp")} />
      <FloatingInput label="5 Years EGP" name="fiveYearsCostEgp" type="number" step="0.01" defaultValue={value("fiveYearsCostEgp")} />
      <FloatingInput label="Monthly USD" name="monthlyCostUsd" type="number" step="0.01" defaultValue={value("monthlyCostUsd") || value("costUsd")} />
      <FloatingInput label="Yearly USD" name="yearlyCostUsd" type="number" step="0.01" defaultValue={value("yearlyCostUsd")} />
      <FloatingInput label="5 Years USD" name="fiveYearsCostUsd" type="number" step="0.01" defaultValue={value("fiveYearsCostUsd")} />
      <div className="lg:col-span-2">
        <FloatingTextarea label="Notes" name="notes" defaultValue={value("notes")} />
      </div>
      {error ? <p className="text-sm text-danger lg:col-span-2">{error}</p> : null}
      <div className="lg:col-span-2">
        <Button disabled={saving}>
          <Save aria-hidden className="h-4 w-4" />
          {saving ? "Saving..." : "Save license"}
        </Button>
      </div>
    </form>
  );
}

function FloatingSelect({
  label,
  name,
  defaultValue,
  options = []
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options?: Array<{ id: string; value: string }>;
}) {
  return (
    <label className="group relative block">
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="focus-ring h-14 w-full rounded-xl border border-border bg-elevated/80 px-4 pb-2 pt-6 text-sm shadow-sm transition hover:border-primary/40"
      >
        <option value="">Not set</option>
        {options.map((option) => (
          <option key={option.id} value={option.value}>
            {option.value}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute left-4 top-2 text-xs font-medium text-muted-foreground transition-all group-focus-within:text-primary">
        {label}
      </span>
    </label>
  );
}

function FloatingMultiSelect({
  label,
  name,
  options,
  selectedValues
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  selectedValues: string[];
}) {
  return (
    <label className="group relative block">
      <select
        name={name}
        multiple
        defaultValue={selectedValues}
        className="focus-ring min-h-28 w-full rounded-xl border border-border bg-elevated/80 px-4 pb-2 pt-7 text-sm shadow-sm transition hover:border-primary/40"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute left-4 top-2 text-xs font-medium text-muted-foreground transition-all group-focus-within:text-primary">
        {label}
      </span>
    </label>
  );
}

type FloatingInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
};

function FloatingInput({ label, className, ...props }: FloatingInputProps) {
  return (
    <label className="group relative block">
      <input
        placeholder=" "
        className={cn(
          "focus-ring peer h-14 w-full rounded-xl border border-border bg-elevated/80 px-4 pb-2 pt-6 text-sm shadow-sm transition placeholder:text-transparent hover:border-primary/40",
          className
        )}
        {...props}
      />
      <span className="pointer-events-none absolute left-4 top-2 text-xs font-medium text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary">
        {label}
      </span>
    </label>
  );
}

type FloatingTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  name: string;
};

function FloatingTextarea({ label, className, ...props }: FloatingTextareaProps) {
  return (
    <label className="group relative block">
      <textarea
        placeholder=" "
        className={cn(
          "focus-ring peer min-h-28 w-full rounded-xl border border-border bg-elevated/80 px-4 pb-3 pt-7 text-sm shadow-sm transition placeholder:text-transparent hover:border-primary/40",
          className
        )}
        {...props}
      />
      <span className="pointer-events-none absolute left-4 top-2 text-xs font-medium text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary">
        {label}
      </span>
    </label>
  );
}

function FloatingDatePicker({ label, name, initialValue }: { label: string; name: string; initialValue?: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(() => {
    if (!initialValue) return undefined;
    const parsed = new Date(`${initialValue}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  });

  const isoValue = selected ? toDateInputValue(selected) : "";
  const displayValue = selected
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(selected)
    : "";

  return (
    <div className="relative">
      <input type="hidden" name={name} value={isoValue} />
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "focus-ring group relative flex h-14 w-full items-center justify-between rounded-xl border border-border bg-elevated/80 px-4 pb-2 pt-6 text-left text-sm shadow-sm transition hover:border-primary/40",
          open && "border-primary/60"
        )}
      >
        <span className={cn("truncate", !displayValue && "text-transparent")}>{displayValue || "Select date"}</span>
        <CalendarDays aria-hidden className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
        <span
          className={cn(
            "pointer-events-none absolute left-4 text-xs font-medium text-muted-foreground transition-all",
            displayValue ? "top-2 text-xs" : "top-4 text-sm",
            open && "top-2 text-xs text-primary"
          )}
        >
          {label}
        </span>
      </button>
      {open ? (
        <div className="glass-surface absolute left-0 top-16 z-30 rounded-2xl border p-3 shadow-glass">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(date) => {
              setSelected(date);
              if (date) setOpen(false);
            }}
            captionLayout="dropdown"
            classNames={{
              root: "license-datepicker",
              months: "flex",
              month: "space-y-3",
              month_caption: "flex items-center justify-center gap-2 px-2",
              caption_label: "text-sm font-semibold",
              dropdowns: "flex items-center justify-center gap-2",
              dropdown: "rounded-lg border border-border bg-elevated px-2 py-1 text-sm",
              nav: "absolute right-3 top-3 flex gap-1",
              button_previous:
                "grid h-8 w-8 place-items-center rounded-lg border border-border bg-elevated text-muted-foreground hover:text-foreground",
              button_next:
                "grid h-8 w-8 place-items-center rounded-lg border border-border bg-elevated text-muted-foreground hover:text-foreground",
              weekdays: "grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground",
              weekday: "h-7 leading-7",
              week: "grid grid-cols-7 gap-1",
              day: "h-9 w-9 rounded-lg text-sm transition hover:bg-muted",
              day_button: "h-9 w-9 rounded-lg",
              selected: "bg-primary text-primary-foreground hover:bg-primary",
              today: "text-primary font-semibold",
              outside: "text-muted-foreground/45",
              disabled: "text-muted-foreground/35"
            }}
          />
          <div className="mt-2 flex justify-between border-t border-border pt-2">
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setSelected(undefined)}
            >
              Clear
            </button>
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-xs font-medium text-primary hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
