import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date?: Date | string | null) {
  if (!date) return "Not set";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(date));
}

export function formatMoney(value?: unknown, currency = "EGP") {
  if (value === null || value === undefined || value === "") return "-";
  const amount = Number(value);
  if (Number.isNaN(amount)) return "-";
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(amount);
}
