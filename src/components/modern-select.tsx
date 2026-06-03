"use client";

import Select, { type MultiValue, type SingleValue, type StylesConfig } from "react-select";
import { useState } from "react";

type Option = {
  value: string;
  label: string;
};

const selectStyles: StylesConfig<Option, boolean> = {
  control: (base, state) => ({
    ...base,
    minHeight: 56,
    borderRadius: 12,
    borderColor: state.isFocused ? "hsl(var(--primary))" : "hsl(var(--border))",
    background: "color-mix(in srgb, hsl(var(--elevated)) 82%, transparent)",
    boxShadow: state.isFocused ? "0 0 0 2px color-mix(in srgb, hsl(var(--primary)) 18%, transparent)" : "0 1px 2px rgba(15, 23, 42, 0.05)",
    padding: "13px 8px 3px",
    ":hover": { borderColor: "color-mix(in srgb, hsl(var(--primary)) 55%, hsl(var(--border)))" }
  }),
  valueContainer: (base) => ({ ...base, padding: "0 6px" }),
  input: (base) => ({ ...base, color: "hsl(var(--foreground))", margin: 0, padding: 0 }),
  singleValue: (base) => ({ ...base, color: "hsl(var(--foreground))" }),
  placeholder: (base) => ({ ...base, color: "transparent" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, color: "hsl(var(--muted-foreground))" }),
  clearIndicator: (base) => ({ ...base, color: "hsl(var(--muted-foreground))" }),
  menuPortal: (base) => ({ ...base, zIndex: 80 }),
  menu: (base) => ({
    ...base,
    zIndex: 80,
    overflow: "hidden",
    borderRadius: 14,
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--surface))",
    boxShadow: "0 22px 70px rgba(15, 23, 42, 0.18)"
  }),
  menuList: (base) => ({ ...base, padding: 6, maxHeight: 260 }),
  option: (base, state) => ({
    ...base,
    borderRadius: 10,
    color: state.isSelected ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
    background: state.isSelected ? "hsl(var(--primary))" : state.isFocused ? "hsl(var(--muted))" : "transparent",
    cursor: "pointer"
  }),
  multiValue: (base) => ({
    ...base,
    borderRadius: 999,
    background: "color-mix(in srgb, hsl(var(--primary)) 14%, hsl(var(--muted)))"
  }),
  multiValueLabel: (base) => ({ ...base, color: "hsl(var(--foreground))", fontWeight: 600 }),
  multiValueRemove: (base) => ({
    ...base,
    borderRadius: 999,
    color: "hsl(var(--muted-foreground))",
    ":hover": { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }
  })
};

export function ModernSelect({
  label,
  name,
  options,
  value,
  onValueChange
}: {
  label: string;
  name: string;
  options: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const [selected, setSelected] = useState<Option | null>(options.find((option) => option.value === value) ?? null);

  return (
    <label className="relative block">
      <input type="hidden" name={name} value={selected?.value ?? ""} />
      <Select<Option, false>
        instanceId={name}
        options={options}
        value={selected}
        isClearable
        isSearchable
        placeholder=" "
        styles={selectStyles as StylesConfig<Option, false>}
        menuPortalTarget={typeof document === "undefined" ? undefined : document.body}
        onChange={(next: SingleValue<Option>) => {
          setSelected(next);
          onValueChange?.(next?.value ?? "");
        }}
      />
      <span className="pointer-events-none absolute left-4 top-2 z-10 text-xs font-medium text-muted-foreground">
        {label}
      </span>
    </label>
  );
}

export function ModernMultiSelect({
  label,
  name,
  options,
  selectedValues
}: {
  label: string;
  name: string;
  options: Option[];
  selectedValues: string[];
}) {
  const [selected, setSelected] = useState<Option[]>(options.filter((option) => selectedValues.includes(option.value)));

  return (
    <div className="relative">
      {selected.map((option) => (
        <input key={option.value} type="hidden" name={name} value={option.value} />
      ))}
      <Select<Option, true>
        instanceId={name}
        options={options}
        value={selected}
        isMulti
        isSearchable
        placeholder=" "
        styles={selectStyles as StylesConfig<Option, true>}
        menuPortalTarget={typeof document === "undefined" ? undefined : document.body}
        onChange={(next: MultiValue<Option>) => setSelected([...next])}
      />
      <span className="pointer-events-none absolute left-4 top-2 z-10 text-xs font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
