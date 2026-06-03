"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { ModernSelect } from "@/components/modern-select";
import { Button, SecondaryButton } from "@/components/ui";

type Option = { id: string; value: string };

export function LicenseSearchToolbar({
  lookupOptions,
  adminOptions,
  page,
  pageCount,
  total
}: {
  lookupOptions: Record<string, Option[]>;
  adminOptions: Array<{ id: string; name: string }>;
  page: number;
  pageCount: number;
  total: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [serviceType, setServiceType] = useState(searchParams.get("serviceType") ?? "");
  const [branch, setBranch] = useState(searchParams.get("branch") ?? "");
  const [adminId, setAdminId] = useState(searchParams.get("adminId") ?? "");
  const [pageSize, setPageSize] = useState(searchParams.get("pageSize") ?? "10");

  function navigate(nextPage = 1) {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    if (serviceType) params.set("serviceType", serviceType);
    if (branch) params.set("branch", branch);
    if (adminId) params.set("adminId", adminId);
    params.set("page", String(nextPage));
    params.set("pageSize", pageSize);
    router.push(`/licenses?${params.toString()}`);
  }

  function clear() {
    setQ("");
    setStatus("");
    setServiceType("");
    setBranch("");
    setAdminId("");
    setPageSize("10");
    router.push("/licenses");
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_140px_auto]">
        <label className="relative block">
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") navigate(1);
            }}
            placeholder="Search details, vendor, branch, service, admins"
            className="focus-ring h-14 w-full rounded-xl border border-border bg-elevated/80 pl-10 pr-4 text-sm shadow-sm"
          />
        </label>
        <ModernSelect label="Status" name="filterStatus" value={status} options={toOptions(lookupOptions.status)} onValueChange={setStatus} />
        <ModernSelect label="Service" name="filterService" value={serviceType} options={toOptions(lookupOptions.serviceType)} onValueChange={setServiceType} />
        <ModernSelect label="Branch" name="filterBranch" value={branch} options={toOptions(lookupOptions.branch)} onValueChange={setBranch} />
        <ModernSelect
          label="Admin"
          name="filterAdmin"
          value={adminId}
          options={adminOptions.map((admin) => ({ value: admin.id, label: admin.name }))}
          onValueChange={setAdminId}
        />
        <select
          value={pageSize}
          onChange={(event) => setPageSize(event.target.value)}
          className="focus-ring h-14 rounded-xl border border-border bg-elevated px-3 text-sm shadow-sm"
        >
          <option value="10">10 rows</option>
          <option value="25">25 rows</option>
          <option value="50">50 rows</option>
        </select>
        <div className="flex gap-2">
          <Button type="button" onClick={() => navigate(1)}>Search</Button>
          <SecondaryButton type="button" onClick={clear}>Clear</SecondaryButton>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center">
        <span>{total} matching licenses</span>
        <div className="flex items-center gap-2">
          <SecondaryButton type="button" disabled={page <= 1} onClick={() => navigate(page - 1)}>Previous</SecondaryButton>
          <span>Page {page} of {pageCount}</span>
          <SecondaryButton type="button" disabled={page >= pageCount} onClick={() => navigate(page + 1)}>Next</SecondaryButton>
        </div>
      </div>
    </div>
  );
}

function toOptions(options: Option[] = []) {
  return options.map((option) => ({ value: option.value, label: option.value }));
}
