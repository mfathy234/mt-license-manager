"use client";

import { ChevronLeft, ChevronRight, ListX, Pencil, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ModernSelect } from "@/components/modern-select";
import {
  Button,
  Checkbox,
  EmptyState,
  Field,
  FormMessage,
  SecondaryButton,
  SelectField,
  StatusPill,
  TableEmpty,
  TableScroll,
  THead,
  Td,
  Th,
  Tr
} from "@/components/ui";
import { getErrorMessage, requestJson } from "@/lib/http";

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

const categoryLabels = new Map(categoryOptions.map((option) => [option.value, option.label]));

type Feedback = { tone: "success" | "danger"; message: string } | null;

export function LookupsManager({ initialValues }: { initialValues: LookupRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<LookupRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

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

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  useEffect(() => {
    if (!modalOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [modalOpen]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      category: String(formData.get("category") ?? ""),
      value: String(formData.get("value") ?? "").trim(),
      sortOrder: Number(formData.get("sortOrder") ?? 0),
      active: formData.get("active") === "on"
    };

    setSaving(true);
    setFeedback(null);

    try {
      await requestJson(editing?.id ? `/api/settings/lookups/${editing.id}` : "/api/settings/lookups", {
        method: editing?.id ? "PATCH" : "POST",
        body: payload
      });
      closeModal();
      setFeedback({ tone: "success", message: editing ? "Lookup updated." : "Lookup added." });
      router.refresh();
    } catch (error) {
      setFeedback({ tone: "danger", message: getErrorMessage(error, "Save failed.") });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px_150px_auto]">
        <label className="relative block">
          <span className="sr-only">Search lookups</span>
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            type="search"
            placeholder="Search category or value"
            className="focus-ring h-14 w-full rounded-xl border border-border bg-elevated/80 pl-11 pr-4 text-sm shadow-sm transition duration-150 ease-out-quart hover:border-primary/40"
          />
        </label>
        <ModernSelect
          label="Category"
          name="lookupCategoryFilter"
          value={category}
          options={categoryOptions}
          onValueChange={(next) => {
            setCategory(next);
            setPage(1);
          }}
        />
        <label className="relative block">
          <span className="sr-only">Rows per page</span>
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            className="focus-ring h-14 w-full rounded-xl border border-border bg-elevated/80 px-4 text-sm shadow-sm transition duration-150 ease-out-quart hover:border-primary/40"
          >
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
          </select>
        </label>
        <Button
          type="button"
          size="lg"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus aria-hidden className="h-4 w-4" />
          Add lookup
        </Button>
      </div>

      {feedback ? <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage> : null}

      <TableScroll minWidthClassName="min-w-[640px]">
        <THead>
          <tr>
            <Th>Category</Th>
            <Th>Value</Th>
            <Th align="right">Order</Th>
            <Th>Status</Th>
            <Th align="right">
              <span className="sr-only">Actions</span>
            </Th>
          </tr>
        </THead>
        <tbody>
          {rows.map((value) => (
            <Tr key={value.id}>
              <Td className="font-medium">{categoryLabels.get(value.category) ?? value.category}</Td>
              <Td>{value.value}</Td>
              <Td align="right" className="tabular">
                {value.sortOrder}
              </Td>
              <Td>
                <StatusPill value={value.active ? "active" : "inactive"} />
              </Td>
              <Td align="right">
                <SecondaryButton
                  type="button"
                  size="sm"
                  onClick={() => {
                    setEditing(value);
                    setModalOpen(true);
                  }}
                >
                  <Pencil aria-hidden className="h-4 w-4" />
                  Edit
                </SecondaryButton>
              </Td>
            </Tr>
          ))}
          {rows.length === 0 ? (
            <TableEmpty colSpan={5}>
              <EmptyState
                icon={<ListX aria-hidden className="h-5 w-5" />}
                title={query || category ? "No lookups match this search" : "No lookup values yet"}
                description="Lookup values populate the dropdowns on the license form."
              />
            </TableEmpty>
          ) : null}
        </tbody>
      </TableScroll>

      <div className="flex flex-col justify-between gap-3 border-t border-border pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center">
        <span className="tabular">
          {filtered.length} {filtered.length === 1 ? "value" : "values"}
        </span>
        <div className="flex items-center gap-2">
          <SecondaryButton type="button" size="sm" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
            <ChevronLeft aria-hidden className="h-4 w-4" />
            Previous
          </SecondaryButton>
          <span className="tabular px-1">
            Page {currentPage} of {pageCount}
          </span>
          <SecondaryButton
            type="button"
            size="sm"
            disabled={currentPage >= pageCount}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
          >
            Next
            <ChevronRight aria-hidden className="h-4 w-4" />
          </SecondaryButton>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-backdrop grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lookup-dialog-title"
            className="glass-surface z-modal w-full max-w-xl rounded-2xl border p-5 shadow-glass"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 id="lookup-dialog-title" className="text-lg font-semibold">
                  {editing ? "Edit lookup" : "Add lookup"}
                </h2>
                <p className="text-sm text-muted-foreground">Lookup values appear as dropdown options in license forms.</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-elevated text-muted-foreground transition hover:text-foreground"
                onClick={closeModal}
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={save} className="grid gap-4">
              <SelectField label="Category" name="category" defaultValue={editing?.category ?? "status"}>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
              <Field label="Value" name="value" defaultValue={editing?.value ?? ""} autoFocus required />
              <Field
                label="Sort order"
                name="sortOrder"
                type="number"
                defaultValue={editing?.sortOrder ?? 0}
                hint="Lower numbers appear first in dropdowns."
              />
              <Checkbox name="active" defaultChecked={editing?.active ?? true} label="Active" hint="Inactive values stay on existing licenses but leave the dropdowns." />
              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <SecondaryButton type="button" onClick={closeModal} disabled={saving}>
                  Cancel
                </SecondaryButton>
                <Button loading={saving}>{editing ? "Save changes" : "Add lookup"}</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
