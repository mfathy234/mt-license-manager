"use client";

import {
  ArrowDown,
  ArrowUp,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Button,
  Checkbox,
  Dialog,
  Field,
  FormMessage,
  IconButton,
  SecondaryButton,
  SelectField,
  StatusPill,
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
  { value: "renewalFrequency", label: "Renewal frequency" },
];

const categoryLabels = new Map(
  categoryOptions.map((option) => [option.value, option.label]),
);

const rowIconClass = "lg:h-7 lg:w-7";

type Feedback = {
  category: string;
  tone: "success" | "danger";
  message: string;
} | null;

type DialogFeedback = {
  tone: "danger";
  message: string;
} | null;

export function LookupsManager({
  initialValues,
}: {
  initialValues: LookupRow[];
}) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<LookupRow | null>(null);
  const [addingCategory, setAddingCategory] = useState("status");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [dialogFeedback, setDialogFeedback] = useState<DialogFeedback>(null);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const categoryKeys = categoryOptions.map((option) => option.value);

    for (const item of values) {
      if (!categoryKeys.includes(item.category)) {
        categoryKeys.push(item.category);
      }
    }

    return categoryKeys
      .map((category) => {
        const label = categoryLabels.get(category) ?? category;
        const matchesCategory = `${category} ${label}`
          .toLowerCase()
          .includes(q);

        return {
          category,
          label,
          values: values.filter(
            (item) =>
              item.category === category &&
              (!q || matchesCategory || item.value.toLowerCase().includes(q)),
          ),
        };
      })
      .filter(
        (group) =>
          !q ||
          group.values.length > 0 ||
          feedback?.category === group.category,
      );
  }, [feedback?.category, query, values]);

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setDialogFeedback(null);
  }

  function openAdd(category: string) {
    setEditing(null);
    setAddingCategory(category);
    setDialogFeedback(null);
    setModalOpen(true);
  }

  function openEdit(value: LookupRow) {
    setEditing(value);
    setAddingCategory(value.category);
    setDialogFeedback(null);
    setModalOpen(true);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      category: String(formData.get("category") ?? ""),
      value: String(formData.get("value") ?? "").trim(),
      sortOrder: Number(formData.get("sortOrder") ?? 0),
      active: formData.get("active") === "on",
    };

    setSaving(true);
    setDialogFeedback(null);

    try {
      await requestJson(
        editing?.id
          ? `/api/settings/lookups/${editing.id}`
          : "/api/settings/lookups",
        {
          method: editing?.id ? "PATCH" : "POST",
          body: payload,
        },
      );
      closeModal();
      setFeedback({
        category: payload.category,
        tone: "success",
        message: editing ? "Lookup updated." : "Lookup added.",
      });
      router.refresh();
    } catch (error) {
      setDialogFeedback({
        tone: "danger",
        message: getErrorMessage(error, "Save failed."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function move(value: LookupRow, direction: -1 | 1) {
    const siblings = values.filter((item) => item.category === value.category);
    const currentIndex = siblings.findIndex((item) => item.id === value.id);
    const targetIndex = currentIndex + direction;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= siblings.length) {
      return;
    }

    const reordered = [...siblings];
    [reordered[currentIndex], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[currentIndex],
    ];
    const orderedValues = reordered.map((item, index) => ({
      ...item,
      sortOrder: index,
    }));

    setReorderingId(value.id);
    setFeedback(null);

    try {
      await requestJson("/api/settings/lookups", {
        method: "PUT",
        body: { values: orderedValues },
      });
      const orderById = new Map(
        orderedValues.map((item) => [item.id, item.sortOrder]),
      );
      setValues((current) =>
        current
          .map((item) => ({
            ...item,
            sortOrder: orderById.get(item.id) ?? item.sortOrder,
          }))
          .sort(
            (left, right) =>
              left.category.localeCompare(right.category) ||
              left.sortOrder - right.sortOrder,
          ),
      );
      setFeedback({
        category: value.category,
        tone: "success",
        message: "Lookup order updated.",
      });
      router.refresh();
    } catch (error) {
      setFeedback({
        category: value.category,
        tone: "danger",
        message: getErrorMessage(error, "Reorder failed."),
      });
    } finally {
      setReorderingId(null);
    }
  }

  return (
    <div className="grid gap-4">
      <label className="relative block max-w-sm">
        <span className="sr-only">Search lookup values</span>
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          type="search"
          placeholder="Search lookup values"
          className="focus-ring h-10 w-full rounded-md border border-control-border bg-surface pl-9 pr-3 text-sm transition-colors duration-150 ease-out-quart hover:border-primary/40 focus:border-primary lg:h-9"
        />
      </label>

      {groups.length === 0 ? (
        <p className="rounded-lg border border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No lookups match this search. Try a different value or clear the search.
        </p>
      ) : (
        <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => {
            const allCategoryValues = values.filter(
              (item) => item.category === group.category,
            );

            return (
              <section
                key={group.category}
                className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface"
              >
                <header className="flex items-center justify-between gap-2 border-b border-border bg-surface-subtle py-1.5 pl-4 pr-2">
                  <div className="flex min-w-0 items-baseline gap-2">
                    <h3 className="truncate text-sm font-semibold">
                      {group.label}
                    </h3>
                    <span className="tabular text-xs text-muted-foreground">
                      {allCategoryValues.length}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Add value to ${group.label}`}
                    onClick={() => openAdd(group.category)}
                  >
                    <Plus aria-hidden className="h-4 w-4" />
                    Add value
                  </Button>
                </header>

                {feedback?.category === group.category ? (
                  <div className="border-b border-border px-3 py-2">
                    <FormMessage tone={feedback.tone}>
                      {feedback.message}
                    </FormMessage>
                  </div>
                ) : null}

                {group.values.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">
                    {query
                      ? "No values match the search."
                      : "No values yet."}
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {group.values.map((value) => {
                      const position = allCategoryValues.findIndex(
                        (item) => item.id === value.id,
                      );
                      const reorderBusy = reorderingId !== null;

                      return (
                        <li
                          key={value.id}
                          className="flex min-h-9 items-center gap-2 py-1 pl-4 pr-2 transition-colors duration-150 hover:bg-muted/50"
                        >
                          <span className="min-w-0 flex-1 truncate text-sm">
                            {value.value}
                          </span>
                          <StatusPill
                            value={value.active ? "active" : "inactive"}
                          />
                          <div className="flex items-center gap-0.5">
                            <IconButton
                              variant="ghost"
                              className={rowIconClass}
                              label={`Move ${value.value} up`}
                              disabled={reorderBusy || position <= 0}
                              aria-busy={reorderingId === value.id || undefined}
                              onClick={() => move(value, -1)}
                            >
                              <ArrowUp aria-hidden className="h-4 w-4" />
                            </IconButton>
                            <IconButton
                              variant="ghost"
                              className={rowIconClass}
                              label={`Move ${value.value} down`}
                              disabled={
                                reorderBusy ||
                                position >= allCategoryValues.length - 1
                              }
                              aria-busy={reorderingId === value.id || undefined}
                              onClick={() => move(value, 1)}
                            >
                              <ArrowDown aria-hidden className="h-4 w-4" />
                            </IconButton>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="px-2 lg:h-7"
                              aria-label={`Edit lookup value ${value.value}`}
                              onClick={() => openEdit(value)}
                            >
                              <Pencil aria-hidden className="h-4 w-4" />
                              Edit
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      <Dialog
        open={modalOpen}
        onClose={closeModal}
        busy={saving}
        ariaLabelledBy="lookup-dialog-title"
        backdropClassName="bg-black/40 backdrop-blur-sm"
        panelClassName="max-w-xl p-4 shadow-panel"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="lookup-dialog-title" className="text-lg font-semibold">
              {editing ? "Edit lookup" : "Add lookup"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Lookup values appear as dropdown options in license forms.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-border bg-surface text-muted-foreground transition hover:bg-surface-subtle hover:text-foreground"
            onClick={closeModal}
            disabled={saving}
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={save} className="grid gap-4">
          <SelectField
            label="Category"
            name="category"
            defaultValue={editing?.category ?? addingCategory}
          >
            {!categoryLabels.has(editing?.category ?? addingCategory) ? (
              <option value={editing?.category ?? addingCategory}>
                {editing?.category ?? addingCategory}
              </option>
            ) : null}
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <Field
            label="Value"
            name="value"
            defaultValue={editing?.value ?? ""}
            data-dialog-initial-focus
            required
          />
          <Field
            label="Sort order"
            name="sortOrder"
            type="number"
            defaultValue={editing?.sortOrder ?? 0}
            hint="Lower numbers appear first in dropdowns."
          />
          <Checkbox
            name="active"
            defaultChecked={editing?.active ?? true}
            label="Active"
            hint="Inactive values stay on existing licenses but leave the dropdowns."
          />
          {dialogFeedback ? (
            <FormMessage tone={dialogFeedback.tone}>
              {dialogFeedback.message}
            </FormMessage>
          ) : null}
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <SecondaryButton
              type="button"
              onClick={closeModal}
              disabled={saving}
            >
              Cancel
            </SecondaryButton>
            <Button loading={saving}>
              {editing ? "Save changes" : "Add lookup"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
