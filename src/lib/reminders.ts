import type { ReminderConfig } from "@prisma/client";

const dayMs = 24 * 60 * 60 * 1000;

export function wholeDaysUntil(expiryDate: Date, now = new Date()) {
  const expiryDay = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate()).getTime();
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.ceil((expiryDay - nowDay) / dayMs);
}

export function dueReminderConfig(
  expiryDate: Date | null | undefined,
  configs: Pick<ReminderConfig, "daysBefore" | "sendHour" | "enabled">[],
  now = new Date()
) {
  if (!expiryDate) return null;
  const daysUntil = wholeDaysUntil(expiryDate, now);
  const currentHour = now.getHours();
  return (
    configs.find((config) => config.enabled && config.daysBefore === daysUntil && currentHour >= config.sendHour) ??
    null
  );
}
