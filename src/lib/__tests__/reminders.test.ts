import { describe, expect, it } from "vitest";

import { dueReminderConfig, wholeDaysUntil } from "@/lib/reminders";

describe("reminders", () => {
  it("calculates whole days until an expiry date", () => {
    const now = new Date("2026-06-03T08:00:00");
    const expiry = new Date("2026-06-10T23:59:00");
    expect(wholeDaysUntil(expiry, now)).toBe(7);
  });

  it("selects an enabled due reminder after the configured hour", () => {
    const now = new Date("2026-06-03T10:00:00");
    const expiry = new Date("2026-06-10T00:00:00");
    const config = dueReminderConfig(expiry, [{ daysBefore: 7, sendHour: 9, enabled: true }], now);
    expect(config?.daysBefore).toBe(7);
  });
});
