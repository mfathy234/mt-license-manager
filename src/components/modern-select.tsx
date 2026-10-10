"use client";

import Select, {
  type MultiValue,
  type SingleValue,
  type StylesConfig,
} from "react-select";
import { useId, useState } from "react";

import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
};

const selectLabel = "text-xs font-medium text-foreground-muted";

const selectStyles: StylesConfig<Option, boolean> = {
  control: (base, state) => ({
    ...base,
    minHeight: 36,
    borderRadius: "var(--radius-md)",
    borderColor: state.isFocused
      ? "hsl(var(--primary))"
      : "hsl(var(--control-border))",
    background: "hsl(var(--surface))",
    boxShadow: state.isFocused
      ? "0 0 0 2px hsl(var(--focus-ring) / 0.25)"
      : "none",
    padding: "0 2px",
    fontSize: 14,
    transition: "border-color 150ms ease, box-shadow 150ms ease",
    ":hover": { borderColor: "hsl(var(--primary) / 0.5)" },
  }),
  valueContainer: (base) => ({ ...base, padding: "0 8px", gap: 4 }),
  input: (base) => ({
    ...base,
    color: "hsl(var(--foreground))",
    margin: 0,
    padding: 0,
  }),
  singleValue: (base) => ({ ...base, color: "hsl(var(--foreground))" }),
  placeholder: (base) => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: 6,
    color: "hsl(var(--muted-foreground))",
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: 6,
    color: "hsl(var(--muted-foreground))",
  }),
  // Matches the `popover` step of the semantic z-scale in tailwind.config.ts.
  menuPortal: (base) => ({ ...base, zIndex: 60 }),
  menu: (base) => ({
    ...base,
    zIndex: 60,
    overflow: "hidden",
    borderRadius: "var(--radius-md)",
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--surface))",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.18)",
  }),
  menuList: (base) => ({ ...base, padding: 4, maxHeight: 260 }),
  option: (base, state) => ({
    ...base,
    padding: "6px 10px",
    fontSize: 14,
    borderRadius: "var(--radius-sm)",
    color: state.isSelected
      ? "hsl(var(--primary-foreground))"
      : "hsl(var(--foreground))",
    background: state.isSelected
      ? "hsl(var(--primary))"
      : state.isFocused
        ? "hsl(var(--muted))"
        : "transparent",
    cursor: "pointer",
  }),
  multiValue: (base) => ({
    ...base,
    margin: "3px 0",
    borderRadius: "var(--radius-sm)",
    background: "hsl(var(--muted))",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "hsl(var(--foreground))",
    fontSize: 13,
    fontWeight: 500,
  }),
  multiValueRemove: (base) => ({
    ...base,
    borderRadius: "var(--radius-sm)",
    color: "hsl(var(--muted-foreground))",
    ":hover": {
      background: "hsl(var(--primary))",
      color: "hsl(var(--primary-foreground))",
    },
  }),
};

export function ModernSelect({
  label,
  name,
  options,
  value,
  onValueChange,
  isClearable = true,
  placeholder = "Any",
  className,
}: {
  label: string;
  name: string;
  options: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
  isClearable?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const inputId = useId();
  // Controlled whenever the parent owns the value (filters); otherwise the
  // internal value drives the hidden input for plain form submission.
  const controlled = typeof onValueChange === "function";
  const [internalValue, setInternalValue] = useState(value ?? "");
  const currentValue = controlled ? (value ?? "") : internalValue;
  const selected =
    options.find((option) => option.value === currentValue) ?? null;

  return (
    <div className={cn("grid min-w-0 gap-1", className)}>
      <label htmlFor={inputId} className={selectLabel}>
        {label}
      </label>
      <input type="hidden" name={name} value={selected?.value ?? ""} />
      <Select<Option, false>
        instanceId={name}
        inputId={inputId}
        options={options}
        value={selected}
        isClearable={isClearable}
        isSearchable
        placeholder={placeholder}
        noOptionsMessage={() => "No options configured"}
        styles={selectStyles as StylesConfig<Option, false>}
        menuPortalTarget={
          typeof document === "undefined" ? undefined : document.body
        }
        onChange={(next: SingleValue<Option>) => {
          if (!controlled) setInternalValue(next?.value ?? "");
          onValueChange?.(next?.value ?? "");
        }}
      />
    </div>
  );
}

export function ModernMultiSelect({
  label,
  name,
  options,
  selectedValues,
}: {
  label: string;
  name: string;
  options: Option[];
  selectedValues: string[];
}) {
  const inputId = useId();
  const [selected, setSelected] = useState<Option[]>(
    options.filter((option) => selectedValues.includes(option.value)),
  );

  return (
    <div className="grid min-w-0 gap-1">
      <label htmlFor={inputId} className={selectLabel}>
        {label}
      </label>
      {selected.map((option) => (
        <input
          key={option.value}
          type="hidden"
          name={name}
          value={option.value}
        />
      ))}
      <Select<Option, true>
        instanceId={name}
        inputId={inputId}
        options={options}
        value={selected}
        isMulti
        isSearchable
        placeholder="Select…"
        styles={selectStyles as StylesConfig<Option, true>}
        menuPortalTarget={
          typeof document === "undefined" ? undefined : document.body
        }
        onChange={(next: MultiValue<Option>) => setSelected([...next])}
      />
    </div>
  );
}
