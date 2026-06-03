"use client";

import { X, Pencil, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ModernSelect } from "@/components/modern-select";
import { Button, SecondaryButton, StatusPill } from "@/components/ui";

type LookupRow = {
  id: string;
  category: string;
  value: string;
  sortOrder: number;
  active: boolean;
};

const categoryOptions = [
  { value: "status", label: "Status" },
  { value: "branch", label: "Branch" },
  { value: "serviceType", label: "Service type" },
  { value: "paymentMethod", label: "Payment method" },
  { value: "renewalFrequency", label: "Renewal frequency" }
];

export function LookupsManager({ initialValues }: { initialValues: LookupRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<LookupRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialValues.filter((item) => {
      const matchesCategory = !category || item.category === category;
      const matchesQuery = !q || `${item.category} ${item.value}`.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, initialValues, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      category: String(formData.get("category") ?? ""),
      value: String(formData.get("value") ?? ""),
      sortOrder: Number(formData.get("sortOrder") ?? 0),
      active: formData.get("active") === "on"
    };
    const url = editing?.id ? `/api/settings/lookups/${editing.id}` : "/api/settings/lookups";
    const response = await fetch(url, {
      method: editing?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setMessage(response.ok ? "Saved." : "Save failed.");
    if (response.ok) {
      setEditing(null);
      setModalOpen(false);
      router.refresh();
    }
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 lg:grid-cols-[1fr_260px_140px_auto]">
        <label className="relative block">
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search category or value"
            className="focus-ring h-12 w-full rounded-xl border border-border bg-elevated/80 pl-10 pr-4 text-sm shadow-sm"
          />
        </label>
        <ModernSelect
          label="Category"
          name="lookupCategoryFilter"
          value={category}
          options={categoryOptions}
          onValueChange={(value) => {
            setCategory(value);
            setPage(1);
          }}
        />
        <select
          value={pageSize}
          onChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(1);
          }}
          className="focus-ring h-12 rounded-xl border border-border bg-elevated px-3 text-sm"
        >
          <option value={10}>10 rows</option>
          <option value={25}>25 rows</option>
          <option value={50}>50 rows</option>
        </select>
        <Button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus aria-hidden className="h-4 w-4" />
          Add lookup
        </Button>
      </div>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-muted-foreground">
            <tr><th className="py-2">Category</th><th>Value</th><th>Order</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((value) => (
              <tr key={value.id} className="border-t border-border">
                <td className="py-3 font-medium">{value.category}</td>
                <td>{value.value}</td>
                <td>{value.sortOrder}</td>
                <td><StatusPill value={value.active ? "active" : "inactive"} /></td>
                <td className="text-right">
                  <SecondaryButton type="button" onClick={() => setEditing(value)}>
                    <Pencil aria-hidden className="h-4 w-4" />
                    Edit
                  </SecondaryButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filtered.length} values</span>
        <div className="flex items-center gap-2">
          <SecondaryButton type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
            Previous
          </SecondaryButton>
          <span>Page {currentPage} of {pageCount}</span>
          <SecondaryButton type="button" disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
            Next
          </SecondaryButton>
        </div>
      </div>

      {modalOpen || editing ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="glass-surface w-full max-w-xl rounded-2xl border p-5 shadow-glass">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{editing ? "Edit lookup" : "Add lookup"}</h2>
                <p className="text-sm text-muted-foreground">Lookup values appear as dropdown options in license forms.</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                className="focus-ring grid h-9 w-9 place-items-center rounded-xl border border-border bg-elevated text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setEditing(null);
                  setModalOpen(false);
                }}
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={save} className="grid gap-4">
              <label className="grid gap-1.5 text-sm font-medium">
                Category
                <select
                  name="category"
                  defaultValue={editing?.category ?? "status"}
                  className="focus-ring h-11 rounded-xl border border-border bg-elevated px-3 text-sm"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Value
                <input
                  name="value"
                  defaultValue={editing?.value ?? ""}
                  placeholder="Lookup value"
                  className="focus-ring h-11 rounded-xl border border-border bg-elevated px-3 text-sm"
                  required
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Sort order
                <input
                  name="sortOrder"
                  defaultValue={editing?.sortOrder ?? 0}
                  type="number"
                  className="focus-ring h-11 rounded-xl border border-border bg-elevated px-3 text-sm"
                />
              </label>
              <label className="flex h-11 items-center gap-2 text-sm font-medium">
                <input name="active" type="checkbox" defaultChecked={editing?.active ?? true} />
                Active
              </label>
              <div className="flex justify-end gap-2">
                <SecondaryButton
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setModalOpen(false);
                  }}
                >
                  Cancel
                </SecondaryButton>
                <Button>{editing ? "Save changes" : "Add lookup"}</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
