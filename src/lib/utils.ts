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

export function formatMoney(value?: unknown, currency = "EGP") {
  if (value === null || value === undefined || value === "") return "-";
  const amount = Number(value);
  if (Number.isNaN(amount)) return "-";
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(amount);
}
