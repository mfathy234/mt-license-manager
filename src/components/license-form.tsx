"use client";

import { DayPicker } from "@daypicker/react";
import { CalendarDays, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ModernMultiSelect, ModernSelect } from "@/components/modern-select";
import { Button, Field, FormMessage, TextareaField } from "@/components/ui";
import { getErrorMessage, requestJson } from "@/lib/http";
import {
  licenseFormFieldErrors,
  type LicenseFormFieldErrors,
} from "@/lib/presentation";
import { cn, toDateInputValue, toDateOnlyInput } from "@/lib/utils";

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

export function LicenseForm({
  action,
  license,
  adminOptions = [],
  lookupOptions = {},
}: LicenseFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LicenseFormFieldErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!fieldErrors.details) return;
    const details = formRef.current?.elements.namedItem("details");
    if (details instanceof HTMLElement) details.focus();
  }, [fieldErrors.details]);

  function handleInvalid(event: React.InvalidEvent<HTMLFormElement>) {
    const control = event.target;
    if (!(control instanceof HTMLInputElement) || control.name !== "details") {
      return;
    }

    event.preventDefault();
    setError("");
    setFieldErrors(licenseFormFieldErrors({ details: control.value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError("");

    const data = {
      ...Object.fromEntries(formData),
      adminIds: formData.getAll("adminIds").map(String),
    };
    const nextFieldErrors = licenseFormFieldErrors({
      details: formData.get("details"),
    });
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    setSaving(true);

    try {
      const payload = await requestJson<{ license: { id: string } }>(
        action === "create" ? "/api/licenses" : `/api/licenses/${license?.id}`,
        { method: action === "create" ? "POST" : "PUT", body: data },
      );
      // `refresh()` fired straight after `push()` invalidates the router cache
      // mid-transition and strands the navigation, leaving the button stuck on
      // "Saving..." even though the save succeeded. A create navigates to a page
      // it has never fetched, so the push alone is already fresh; an update is
      // already on its own page and only needs the refresh.
      if (action === "create") {
        router.push(`/licenses/${payload.license.id}`);
      } else {
        router.refresh();
      }
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Save failed."));
    } finally {
      setSaving(false);
    }
  }

  /** Reads a field as text. Values are rendered whole — never truncated. */
  const value = (key: string) => {
    const raw = license?.[key];
    return raw === null || raw === undefined ? "" : String(raw);
  };

  /** Reads a date field as the `YYYY-MM-DD` the picker and hidden input expect. */
  const dateValue = (key: string) => toDateOnlyInput(license?.[key]);

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      onInvalid={handleInvalid}
      className="grid divide-y divide-border"
    >
      <FormSection
        title="License identity"
        description="What the subscription is and how it is classified."
        columns="lg:grid-cols-3"
      >
        <Field
          label="Details"
          name="details"
          defaultValue={value("details")}
          error={fieldErrors.details}
          required
          className="lg:col-span-2"
        />
        <Field label="Vendor" name="vendor" defaultValue={value("vendor")} />
        <ModernSelect
          placeholder="Select…"
          label="Status"
          name="status"
          value={value("status")}
          options={toSelectOptions(lookupOptions.status)}
        />
        <ModernSelect
          placeholder="Select…"
          label="Service type"
          name="serviceType"
          value={value("serviceType")}
          options={toSelectOptions(lookupOptions.serviceType)}
        />
        <ModernSelect
          placeholder="Select…"
          label="Branch"
          name="branch"
          value={value("branch")}
          options={toSelectOptions(lookupOptions.branch)}
        />
      </FormSection>

      <FormSection
        title="Ownership"
        description="Who is accountable and how many seats."
        columns="lg:grid-cols-3"
      >
        <Field
          label="Owner account"
          name="ownerAccount"
          defaultValue={value("ownerAccount")}
        />
        <ModernMultiSelect
          label="Admins"
          name="adminIds"
          options={adminOptions.map((admin) => ({
            value: admin.id,
            label: admin.name,
          }))}
          selectedValues={
            Array.isArray(license?.adminIds)
              ? (license.adminIds as string[])
              : []
          }
        />
        <Field
          label="Users count"
          name="usersCount"
          type="number"
          min="0"
          defaultValue={value("usersCount")}
        />
      </FormSection>

      <FormSection
        title="Term and renewal"
        description="Contract dates, payment, and renewal cycle."
        columns="lg:grid-cols-4"
      >
        <DatePickerField
          label="Start date"
          name="startDate"
          initialValue={dateValue("startDate")}
        />
        <DatePickerField
          label="Expiry date"
          name="expiryDate"
          initialValue={dateValue("expiryDate")}
        />
        <ModernSelect
          placeholder="Select…"
          label="Payment method"
          name="paymentMethod"
          value={value("paymentMethod")}
          options={toSelectOptions(lookupOptions.paymentMethod)}
        />
        <ModernSelect
          placeholder="Select…"
          label="Renewal frequency"
          name="renewalFrequency"
          value={value("renewalFrequency")}
          options={toSelectOptions(lookupOptions.renewalFrequency)}
        />
      </FormSection>

      <FormSection
        title="Costs"
        description="Contracted amounts in EGP and USD."
        columns="lg:grid-cols-3"
      >
        <Field
          label="Monthly EGP"
          name="monthlyCostEgp"
          type="number"
          step="0.01"
          defaultValue={value("monthlyCostEgp") || value("costEgp")}
        />
        <Field
          label="Yearly EGP"
          name="yearlyCostEgp"
          type="number"
          step="0.01"
          defaultValue={value("yearlyCostEgp")}
        />
        <Field
          label="5 years EGP"
          name="fiveYearsCostEgp"
          type="number"
          step="0.01"
          defaultValue={value("fiveYearsCostEgp")}
        />
        <Field
          label="Monthly USD"
          name="monthlyCostUsd"
          type="number"
          step="0.01"
          defaultValue={value("monthlyCostUsd") || value("costUsd")}
        />
        <Field
          label="Yearly USD"
          name="yearlyCostUsd"
          type="number"
          step="0.01"
          defaultValue={value("yearlyCostUsd")}
        />
        <Field
          label="5 years USD"
          name="fiveYearsCostUsd"
          type="number"
          step="0.01"
          defaultValue={value("fiveYearsCostUsd")}
        />
      </FormSection>

      <FormSection title="Notes" columns="sm:grid-cols-1">
        <TextareaField
          label="Notes"
          name="notes"
          defaultValue={value("notes")}
        />
      </FormSection>

      {error ? (
        <div className="px-4 py-3">
          <FormMessage tone="danger">{error}</FormMessage>
        </div>
      ) : null}

      <div className="sticky bottom-0 z-sticky flex justify-end gap-2 rounded-b-lg bg-surface/95 px-4 py-3 backdrop-blur">
        <Button
          type="button"
          variant="ghost"
          disabled={saving}
          onClick={() => router.push("/licenses")}
        >
          Cancel
        </Button>
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
  columns,
  children,
}: {
  title: string;
  description?: string;
  columns: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="grid gap-3 px-4 py-4 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-x-8">
      <legend className="sr-only">{title}</legend>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className={cn("grid gap-x-4 gap-y-3 sm:grid-cols-2", columns)}>
        {children}
      </div>
    </fieldset>
  );
}

function toSelectOptions(options: Array<{ id: string; value: string }> = []) {
  return options.map((option) => ({
    value: option.value,
    label: option.value,
  }));
}

function DatePickerField({
  label,
  name,
  initialValue,
}: {
  label: string;
  name: string;
  initialValue?: string;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(() =>
    parseDateInput(initialValue),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Re-sync when the server sends a different stored date (e.g. after a save
  // refreshes the edit page); local picks are otherwise left untouched.
  useEffect(() => {
    setSelected(parseDateInput(initialValue));
  }, [initialValue]);

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
  const displayValue = selected
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(selected)
    : "";

  return (
    <div className="relative grid gap-1" ref={containerRef}>
      <input type="hidden" name={name} value={isoValue} />
      <span className="text-xs font-medium text-foreground-muted">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "focus-ring group flex h-10 w-full items-center justify-between gap-3 rounded-md border bg-surface px-3 text-left text-sm transition-colors duration-150 ease-out-quart hover:border-primary/50 lg:h-9",
          open ? "border-primary" : "border-control-border",
        )}
      >
        <span
          className={cn("truncate", !displayValue && "text-muted-foreground")}
        >
          {displayValue || "Select a date"}
        </span>
        <CalendarDays
          aria-hidden
          className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary"
        />
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label={label}
          className="glass-surface absolute left-0 top-full z-dropdown mt-1 rounded-xl border p-3 shadow-popover"
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
              dropdown:
                "absolute inset-0 h-full w-full cursor-pointer opacity-0",
              caption_label:
                "inline-flex h-9 items-center gap-1 rounded-md border border-border bg-elevated px-3 text-sm font-medium",
              chevron: "h-4 w-4 shrink-0 fill-current",
              nav: "absolute right-0 top-0 flex gap-1",
              button_previous:
                "focus-ring grid h-9 w-9 place-items-center rounded-md border border-border bg-elevated text-muted-foreground transition hover:text-foreground disabled:opacity-40",
              button_next:
                "focus-ring grid h-9 w-9 place-items-center rounded-md border border-border bg-elevated text-muted-foreground transition hover:text-foreground disabled:opacity-40",
              weekdays:
                "grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground",
              weekday: "h-7 font-medium leading-7",
              week: "grid grid-cols-7 gap-1",
              day: "h-9 w-9",
              day_button:
                "focus-ring h-9 w-9 rounded-md text-sm transition hover:bg-muted",
              selected: "day-selected",
              today: "day-today",
              outside: "day-outside",
              disabled: "day-disabled",
            }}
          />
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2">
            <button
              type="button"
              className="focus-ring rounded-md px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onClick={() => setSelected(undefined)}
            >
              Clear
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="focus-ring rounded-md px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                onClick={() => {
                  setSelected(new Date());
                  setOpen(false);
                }}
              >
                Today
              </button>
              <button
                type="button"
                className="focus-ring rounded-md px-3 py-2 text-xs font-medium text-primary transition hover:bg-muted"
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
