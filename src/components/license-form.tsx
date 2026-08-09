"use client";

import { DayPicker } from "@daypicker/react";
import { CalendarDays, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ModernMultiSelect, ModernSelect } from "@/components/modern-select";
import { Button, Field, FormMessage, TextareaField } from "@/components/ui";
import { getErrorMessage, requestJson } from "@/lib/http";
import { cn } from "@/lib/utils";

/**
 * Navigation bounds for the calendar. Without these, a `dropdown` caption layout
 * defaults to "100 years ago until the end of the current year", which makes any
 * future expiry date unreachable.
 */
const YEARS_BACK = 15;
const YEARS_AHEAD = 30;
const CURRENT_YEAR = new Date().getFullYear();
const NAV_START_MONTH = new Date(CURRENT_YEAR - YEARS_BACK, 0, 1);
const NAV_END_MONTH = new Date(CURRENT_YEAR + YEARS_AHEAD, 11, 31);

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
    const formData = new FormData(event.currentTarget);
    setSaving(true);
    setError("");

    const data = {
      ...Object.fromEntries(formData),
      adminIds: formData.getAll("adminIds").map(String)
    };

    try {
      const payload = await requestJson<{ license: { id: string } }>(
        action === "create" ? "/api/licenses" : `/api/licenses/${license?.id}`,
        { method: action === "create" ? "POST" : "PUT", body: data }
      );
      router.push(`/licenses/${payload.license.id}`);
      router.refresh();
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Save failed."));
      setSaving(false);
    }
  }

  const value = (key: string) => (license?.[key] ? String(license[key]).slice(0, 10) : "");

  return (
    <form onSubmit={submit} className="grid gap-5">
      <FormSection title="Identity" description="What the subscription is and who it belongs to.">
        <Field label="Details" name="details" defaultValue={value("details")} required className="lg:col-span-2" />
        <ModernSelect label="Status" name="status" value={value("status")} options={toSelectOptions(lookupOptions.status)} />
        <ModernSelect
          label="Service type"
          name="serviceType"
          value={value("serviceType")}
          options={toSelectOptions(lookupOptions.serviceType)}
        />
        <ModernSelect label="Branch" name="branch" value={value("branch")} options={toSelectOptions(lookupOptions.branch)} />
        <Field label="Vendor" name="vendor" defaultValue={value("vendor")} />
        <Field label="Users count" name="usersCount" type="number" min="0" defaultValue={value("usersCount")} />
        <Field label="Owner account" name="ownerAccount" defaultValue={value("ownerAccount")} />
        <ModernMultiSelect
          label="Admins"
          name="adminIds"
          options={adminOptions.map((admin) => ({ value: admin.id, label: admin.name }))}
          selectedValues={Array.isArray(license?.adminIds) ? (license.adminIds as string[]) : []}
        />
      </FormSection>

      <FormSection title="Term" description="Dates and how the subscription renews.">
        <DatePickerField label="Start date" name="startDate" initialValue={value("startDate")} />
        <DatePickerField label="Expiry date" name="expiryDate" initialValue={value("expiryDate")} />
        <ModernSelect
          label="Payment method"
          name="paymentMethod"
          value={value("paymentMethod")}
          options={toSelectOptions(lookupOptions.paymentMethod)}
        />
        <ModernSelect
          label="Renewal frequency"
          name="renewalFrequency"
          value={value("renewalFrequency")}
          options={toSelectOptions(lookupOptions.renewalFrequency)}
        />
      </FormSection>

      <FormSection title="Cost" description="Leave blank where a currency does not apply.">
        <Field
          label="Monthly EGP"
          name="monthlyCostEgp"
          type="number"
          step="0.01"
          defaultValue={value("monthlyCostEgp") || value("costEgp")}
        />
        <Field label="Yearly EGP" name="yearlyCostEgp" type="number" step="0.01" defaultValue={value("yearlyCostEgp")} />
        <Field label="5 years EGP" name="fiveYearsCostEgp" type="number" step="0.01" defaultValue={value("fiveYearsCostEgp")} />
        <Field
          label="Monthly USD"
          name="monthlyCostUsd"
          type="number"
          step="0.01"
          defaultValue={value("monthlyCostUsd") || value("costUsd")}
        />
        <Field label="Yearly USD" name="yearlyCostUsd" type="number" step="0.01" defaultValue={value("yearlyCostUsd")} />
        <Field label="5 years USD" name="fiveYearsCostUsd" type="number" step="0.01" defaultValue={value("fiveYearsCostUsd")} />
      </FormSection>

      <FormSection title="Notes">
        <TextareaField label="Notes" name="notes" defaultValue={value("notes")} className="lg:col-span-2" />
      </FormSection>

      {error ? <FormMessage tone="danger">{error}</FormMessage> : null}

      <div className="flex justify-end border-t border-border pt-5">
        <Button loading={saving}>
          {saving ? null : <Save aria-hidden className="h-4 w-4" />}
          {saving ? "Saving..." : "Save license"}
        </Button>
      </div>
    </form>
  );
}

function FormSection({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="grid gap-4">
      <legend className="sr-only">{title}</legend>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function toSelectOptions(options: Array<{ id: string; value: string }> = []) {
  return options.map((option) => ({ value: option.value, label: option.value }));
}

function DatePickerField({ label, name, initialValue }: { label: string; name: string; initialValue?: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(() => parseDateInput(initialValue));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const isoValue = selected ? toDateInputValue(selected) : "";
  const displayValue = selected ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(selected) : "";

  return (
    <div className="relative" ref={containerRef}>
      <input type="hidden" name={name} value={isoValue} />
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "focus-ring group relative flex h-14 w-full items-center justify-between gap-3 rounded-xl border bg-elevated/80 px-4 pb-2 pt-6 text-left text-sm shadow-sm transition duration-150 ease-out-quart hover:border-primary/40",
          open ? "border-primary/60" : "border-border"
        )}
      >
        <span className={cn("truncate", !displayValue && "text-muted-foreground")}>{displayValue || "Select a date"}</span>
        <CalendarDays aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
        <span
          className={cn(
            "pointer-events-none absolute left-4 top-2 text-xs font-medium transition-colors",
            open ? "text-primary" : "text-muted-foreground"
          )}
        >
          {label}
        </span>
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label={label}
          className="glass-surface absolute left-0 top-16 z-dropdown rounded-2xl border p-3 shadow-popover"
        >
          <DayPicker
            mode="single"
            selected={selected}
            defaultMonth={selected ?? new Date()}
            startMonth={NAV_START_MONTH}
            endMonth={NAV_END_MONTH}
            onSelect={(date) => {
              setSelected(date);
              if (date) setOpen(false);
            }}
            captionLayout="dropdown"
            classNames={{
              // The library stylesheet is not imported; every visual rule lives
              // here or under `.license-datepicker` in globals.css.
              root: "license-datepicker relative",
              months: "flex",
              month: "space-y-2",
              month_caption: "flex items-center gap-2 pb-1 pr-[80px]",
              dropdowns: "flex items-center gap-2",
              dropdown_root: "relative inline-flex",
              dropdown: "absolute inset-0 h-full w-full cursor-pointer opacity-0",
              caption_label:
                "inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-elevated px-3 text-sm font-medium",
              chevron: "h-4 w-4 shrink-0 fill-current",
              nav: "absolute right-0 top-0 flex gap-1",
              button_previous:
                "focus-ring grid h-9 w-9 place-items-center rounded-lg border border-border bg-elevated text-muted-foreground transition hover:text-foreground disabled:opacity-40",
              button_next:
                "focus-ring grid h-9 w-9 place-items-center rounded-lg border border-border bg-elevated text-muted-foreground transition hover:text-foreground disabled:opacity-40",
              weekdays: "grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground",
              weekday: "h-7 font-medium leading-7",
              week: "grid grid-cols-7 gap-1",
              day: "h-9 w-9",
              day_button: "focus-ring h-9 w-9 rounded-lg text-sm transition hover:bg-muted",
              selected: "day-selected",
              today: "day-today",
              outside: "day-outside",
              disabled: "day-disabled"
            }}
          />
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2">
            <button
              type="button"
              className="focus-ring rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onClick={() => setSelected(undefined)}
            >
              Clear
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="focus-ring rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                onClick={() => {
                  setSelected(new Date());
                  setOpen(false);
                }}
              >
                Today
              </button>
              <button
                type="button"
                className="focus-ring rounded-lg px-3 py-2 text-xs font-medium text-primary transition hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function parseDateInput(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
