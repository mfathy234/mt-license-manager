import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { wholeDaysUntil } from "@/lib/reminders";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date?: Date | string | null) {
  if (!date) return "Not set";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(date));
}

const EXPIRY_WARNING_DAYS = 30;

/**
 * Short urgency note shown next to an expiry date. Returns null when the date is
 * missing or comfortably far out, so calm rows stay calm.
 */
export function expiryBadge(
  date?: Date | string | null,
  now = new Date()
): { label: string; tone: "warning" | "danger" } | null {
  if (!date) return null;
  const expiry = new Date(date);
  if (Number.isNaN(expiry.getTime())) return null;

  const days = wholeDaysUntil(expiry, now);
  if (days < 0) return { label: "Expired", tone: "danger" };
  if (days === 0) return { label: "Expires today", tone: "danger" };
  if (days <= EXPIRY_WARNING_DAYS) return { label: `In ${days} day${days === 1 ? "" : "s"}`, tone: "warning" };
  return null;
}

/** Formats a date as the `YYYY-MM-DD` string a date field submits, in local time. */
export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Reads a stored date-only field back as `YYYY-MM-DD` for the picker.
 *
 * Prisma hands back a `Date`, whose string form is `"Mon Aug 10 2026 ..."`, so
 * slicing it yields garbage rather than a date. The calendar day is resolved in
 * local time to match `formatDate` and `expiryBadge`: stored instants are a mix
 * of local midnight (seeded and imported rows) and UTC midnight (rows saved
 * through the API), and local reading lands both on the intended day.
 */
export function toDateOnlyInput(value: unknown) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? "" : toDateInputValue(date);
}

export function formatMoney(value?: unknown, currency = "EGP") {
  if (value === null || value === undefined || value === "") return "-";
  const amount = Number(value);
  if (Number.isNaN(amount)) return "-";
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(amount);
}
