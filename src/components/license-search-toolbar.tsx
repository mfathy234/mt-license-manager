"use client";

import { ChevronLeft, ChevronRight, Loader2, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { ModernSelect } from "@/components/modern-select";
import { Button, SecondaryButton } from "@/components/ui";

type Option = { id: string; value: string };
type AdminOption = { id: string; name: string };

type Filters = {
  q: string;
  status: string;
  serviceType: string;
  branch: string;
  adminId: string;
  renewalFrequency: string;
  pageSize: string;
};

export function LicenseSearchToolbar({
  lookupOptions,
  adminOptions,
  page,
  pageCount,
  total,
  rangeStart,
  rangeEnd
}: {
  lookupOptions: Record<string, Option[]>;
  adminOptions: AdminOption[];
  page: number;
  pageCount: number;
  total: number;
  rangeStart: number;
  rangeEnd: number;
}) {
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
    pageSize: searchParams.get("pageSize") ?? "10"
  };

  // Only the free-text box is deferred; dropdowns apply the moment they change.
  const [q, setQ] = useState(applied.q);

  function navigate(filters: Filters, nextPage = 1) {
    const params = new URLSearchParams();
    if (filters.q.trim()) params.set("q", filters.q.trim());
    if (filters.status) params.set("status", filters.status);
    if (filters.serviceType) params.set("serviceType", filters.serviceType);
    if (filters.branch) params.set("branch", filters.branch);
    if (filters.adminId) params.set("adminId", filters.adminId);
    if (filters.renewalFrequency) params.set("renewalFrequency", filters.renewalFrequency);
    params.set("page", String(nextPage));
    params.set("pageSize", filters.pageSize);
    startTransition(() => router.push(`/licenses?${params.toString()}`));
  }

  function update(patch: Partial<Filters>) {
    navigate({ ...applied, q, ...patch });
  }

  function removeFilter(key: keyof Filters) {
    if (key === "q") setQ("");
    navigate({ ...applied, q, [key]: "" });
  }

  function clear() {
    setQ("");
    startTransition(() => router.push("/licenses"));
  }

  const activeChips = buildChips(applied, adminOptions);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))_auto]">
        <label className="relative block">
          <span className="sr-only">Search licenses</span>
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") update({});
            }}
            type="search"
            placeholder="Search details, vendor, branch, service, admins"
            className="focus-ring h-14 w-full rounded-xl border border-border bg-elevated/80 pl-11 pr-4 text-sm shadow-sm transition duration-150 ease-out-quart hover:border-primary/40"
          />
        </label>
        <ModernSelect
          label="Status"
          name="filterStatus"
          value={applied.status}
          options={toOptions(lookupOptions.status)}
          onValueChange={(status) => update({ status })}
        />
        <ModernSelect
          label="Service"
          name="filterService"
          value={applied.serviceType}
          options={toOptions(lookupOptions.serviceType)}
          onValueChange={(serviceType) => update({ serviceType })}
        />
        <ModernSelect
          label="Branch"
          name="filterBranch"
          value={applied.branch}
          options={toOptions(lookupOptions.branch)}
          onValueChange={(branch) => update({ branch })}
        />
        <ModernSelect
          label="Renewal"
          name="filterRenewal"
          value={applied.renewalFrequency}
          options={toOptions(lookupOptions.renewalFrequency)}
          onValueChange={(renewalFrequency) => update({ renewalFrequency })}
        />
        <Button type="button" size="lg" onClick={() => update({})} loading={pending}>
          {pending ? null : <Search aria-hidden className="h-4 w-4" />}
          Search
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <ModernSelect
          label="Admin"
          name="filterAdmin"
          value={applied.adminId}
          options={adminOptions.map((admin) => ({ value: admin.id, label: admin.name }))}
          onValueChange={(adminId) => update({ adminId })}
        />
        <label className="relative block">
          <span className="sr-only">Rows per page</span>
          <select
            value={applied.pageSize}
            onChange={(event) => update({ pageSize: event.target.value })}
            className="focus-ring h-14 w-full rounded-xl border border-border bg-elevated/80 px-4 text-sm shadow-sm transition duration-150 ease-out-quart hover:border-primary/40 sm:w-40"
          >
            <option value="10">10 rows</option>
            <option value="25">25 rows</option>
            <option value="50">50 rows</option>
          </select>
        </label>
      </div>

      {activeChips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => removeFilter(chip.key)}
              className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-muted px-3 text-xs font-medium transition duration-150 ease-out-quart hover:border-danger/40 hover:text-danger"
            >
              <span className="text-muted-foreground">{chip.label}:</span>
              <span className="max-w-[16ch] truncate">{chip.value}</span>
              <X aria-hidden className="h-3 w-3" />
              <span className="sr-only">Remove filter</span>
            </button>
          ))}
          <SecondaryButton type="button" size="sm" onClick={clear}>
            Clear all
          </SecondaryButton>
        </div>
      ) : null}

      <div className="flex flex-col justify-between gap-3 border-t border-border pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center">
        <span className="tabular inline-flex items-center gap-2">
          {pending ? <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" /> : null}
          {total === 0 ? "No matching licenses" : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
        </span>
        <div className="flex items-center gap-2">
          <SecondaryButton
            type="button"
            size="sm"
            disabled={page <= 1}
            onClick={() => navigate({ ...applied, q }, page - 1)}
          >
            <ChevronLeft aria-hidden className="h-4 w-4" />
            Previous
          </SecondaryButton>
          <span className="tabular px-1">
            Page {page} of {pageCount}
          </span>
          <SecondaryButton
            type="button"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => navigate({ ...applied, q }, page + 1)}
          >
            Next
            <ChevronRight aria-hidden className="h-4 w-4" />
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}

type Chip = { key: keyof Filters; label: string; value: string };

function buildChips(filters: Filters, adminOptions: AdminOption[]): Chip[] {
  const admin = adminOptions.find((option) => option.id === filters.adminId);
  const candidates: Chip[] = [
    { key: "q", label: "Search", value: filters.q },
    { key: "status", label: "Status", value: filters.status },
    { key: "serviceType", label: "Service", value: filters.serviceType },
    { key: "branch", label: "Branch", value: filters.branch },
    { key: "renewalFrequency", label: "Renewal", value: filters.renewalFrequency },
    { key: "adminId", label: "Admin", value: admin?.name ?? "" }
  ];
  return candidates.filter((chip) => chip.value);
}

function toOptions(options: Option[] = []) {
  return options.map((option) => ({ value: option.value, label: option.value }));
}
