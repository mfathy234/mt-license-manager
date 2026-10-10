"use client";

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { ModernSelect } from "@/components/modern-select";
import { Button } from "@/components/ui";
import {
  buildLicenseFilterChips,
  type LicenseFilterChip,
  type LicenseFilterValues,
} from "@/lib/presentation";
import { cn } from "@/lib/utils";

type Option = { id: string; value: string };
type AdminOption = { id: string; name: string };
type Filters = Required<LicenseFilterValues>;

function useLicenseNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const applied: Filters = {
    q: searchParams.get("q") ?? "",
    status: searchParams.get("status") ?? "",
    serviceType: searchParams.get("serviceType") ?? "",
    branch: searchParams.get("branch") ?? "",
    adminId: searchParams.get("adminId") ?? "",
    renewalFrequency: searchParams.get("renewalFrequency") ?? "",
    pageSize: searchParams.get("pageSize") ?? "10",
  };

  function navigate(filters: Filters, nextPage = 1) {
    const params = new URLSearchParams();
    if (filters.q.trim()) params.set("q", filters.q.trim());
    if (filters.status) params.set("status", filters.status);
    if (filters.serviceType) params.set("serviceType", filters.serviceType);
    if (filters.branch) params.set("branch", filters.branch);
    if (filters.adminId) params.set("adminId", filters.adminId);
    if (filters.renewalFrequency)
      params.set("renewalFrequency", filters.renewalFrequency);
    params.set("page", String(nextPage));
    params.set("pageSize", filters.pageSize);
    startTransition(() => router.push(`/licenses?${params.toString()}`));
  }

  function reset() {
    startTransition(() => router.push("/licenses"));
  }

  return { applied, navigate, reset, pending };
}

export function LicenseSearchToolbar({
  lookupOptions,
  adminOptions,
}: {
  lookupOptions: Record<string, Option[]>;
  adminOptions: AdminOption[];
}) {
  const { applied, navigate, reset, pending } = useLicenseNavigation();
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Only the free-text box is deferred; dropdowns apply the moment they change.
  const [q, setQ] = useState(applied.q);

  function update(patch: Partial<Filters>) {
    navigate({ ...applied, q, ...patch });
  }

  function removeFilter(key: LicenseFilterChip["key"]) {
    if (key === "q") setQ("");
    navigate({ ...applied, q, [key]: "" });
  }

  function clear() {
    setQ("");
    reset();
  }

  const activeChips = buildLicenseFilterChips(applied, adminOptions);
  const dropdownFilterCount = [
    applied.status,
    applied.serviceType,
    applied.branch,
    applied.adminId,
    applied.renewalFrequency,
  ].filter(Boolean).length;
  const canReset = Boolean(
    q || applied.q || dropdownFilterCount > 0 || applied.pageSize !== "10",
  );

  return (
    <div
      role="search"
      aria-label="License search and filters"
      aria-busy={pending}
      className="flex flex-wrap items-end gap-2 border-b border-border p-3"
    >
      <label className="relative order-1 block min-w-0 flex-1 basis-full sm:basis-auto xl:min-w-48">
        <span className="sr-only">Search licenses</span>
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") update({});
          }}
          type="search"
          placeholder="Search licenses"
          className="focus-ring h-10 w-full rounded-md border border-control-border bg-surface pl-9 pr-3 text-sm transition-colors duration-150 ease-out-quart placeholder:text-muted-foreground hover:border-primary/50 focus:border-primary lg:h-9"
        />
      </label>
      <Button
        type="button"
        className="order-2 h-10 lg:h-9"
        onClick={() => update({})}
        loading={pending}
      >
        {pending ? null : <Search aria-hidden className="h-4 w-4" />}
        Search
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="order-3 h-10 lg:hidden"
        aria-expanded={filtersOpen}
        aria-controls="license-filter-fields"
        onClick={() => setFiltersOpen((open) => !open)}
      >
        <SlidersHorizontal aria-hidden className="h-4 w-4" />
        Filters
        {dropdownFilterCount > 0 ? (
          <span className="tabular rounded bg-primary/10 px-1.5 text-xs font-semibold text-primary">
            {dropdownFilterCount}
          </span>
        ) : null}
      </Button>

      <div
        id="license-filter-fields"
        className={cn(
          "order-4 basis-full grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:items-end xl:basis-auto",
          filtersOpen ? "grid" : "hidden",
        )}
      >
        <ModernSelect
          label="Status"
          name="filterStatus"
          value={applied.status}
          options={toOptions(lookupOptions.status)}
          onValueChange={(status) => update({ status })}
          className="lg:w-28"
        />
        <ModernSelect
          label="Service"
          name="filterService"
          value={applied.serviceType}
          options={toOptions(lookupOptions.serviceType)}
          onValueChange={(serviceType) => update({ serviceType })}
          className="lg:w-28"
        />
        <ModernSelect
          label="Branch"
          name="filterBranch"
          value={applied.branch}
          options={toOptions(lookupOptions.branch)}
          onValueChange={(branch) => update({ branch })}
          className="lg:w-28"
        />
        <ModernSelect
          label="Renewal"
          name="filterRenewal"
          value={applied.renewalFrequency}
          options={toOptions(lookupOptions.renewalFrequency)}
          onValueChange={(renewalFrequency) => update({ renewalFrequency })}
          className="lg:w-28"
        />
        <ModernSelect
          label="Administrator"
          name="filterAdmin"
          value={applied.adminId}
          options={adminOptions.map((admin) => ({
            value: admin.id,
            label: admin.name,
          }))}
          onValueChange={(adminId) => update({ adminId })}
          className="lg:w-32"
        />
        <ModernSelect
          label="Rows"
          name="filterPageSize"
          value={applied.pageSize}
          options={[
            { value: "10", label: "10" },
            { value: "25", label: "25" },
            { value: "50", label: "50" },
          ]}
          isClearable={false}
          onValueChange={(pageSize) => update({ pageSize: pageSize || "10" })}
          className="lg:w-24"
        />
      </div>

      {canReset ? (
        <Button
          type="button"
          variant="ghost"
          className="order-3 h-10 lg:h-9 xl:order-5"
          disabled={pending}
          onClick={clear}
        >
          <RotateCcw aria-hidden className="h-4 w-4" />
          Reset filters
        </Button>
      ) : null}

      {activeChips.length > 0 ? (
        <div className="order-6 flex basis-full flex-wrap items-center gap-1.5">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => removeFilter(chip.key)}
              aria-label={`Remove ${chip.label} filter: ${chip.value}`}
              className="focus-ring inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-muted px-2 text-xs font-medium transition-colors duration-150 ease-out-quart hover:border-danger/40 hover:text-danger"
            >
              <span className="text-muted-foreground">{chip.label}:</span>
              <span className="max-w-[16ch] truncate">{chip.value}</span>
              <X aria-hidden className="h-3 w-3" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function LicenseResultsFooter({
  page,
  pageCount,
  total,
  rangeStart,
  rangeEnd,
}: {
  page: number;
  pageCount: number;
  total: number;
  rangeStart: number;
  rangeEnd: number;
}) {
  const { applied, navigate, pending } = useLicenseNavigation();

  return (
    <div className="flex flex-col justify-between gap-2 border-t border-border px-3 py-2 text-[13px] text-muted-foreground sm:flex-row sm:items-center">
      <span
        role="status"
        aria-live="polite"
        className="tabular inline-flex items-center gap-2"
      >
        {pending ? (
          <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" />
        ) : null}
        {pending
          ? "Updating results"
          : total === 0
            ? "No matching licenses"
            : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
      </span>
      <div className="flex items-center justify-between gap-1 sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={page <= 1 || pending}
          onClick={() => navigate(applied, page - 1)}
        >
          <ChevronLeft aria-hidden className="h-4 w-4" />
          Previous
        </Button>
        <span className="tabular px-1">
          Page {page} of {pageCount}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={page >= pageCount || pending}
          onClick={() => navigate(applied, page + 1)}
        >
          Next
          <ChevronRight aria-hidden className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function toOptions(options: Option[] = []) {
  return options.map((option) => ({
    value: option.value,
    label: option.value,
  }));
}
