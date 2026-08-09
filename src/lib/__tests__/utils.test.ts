import { describe, expect, it } from "vitest";

import { expiryBadge } from "@/lib/utils";

describe("expiryBadge", () => {
  const now = new Date("2026-06-03T10:00:00");

  it("returns null when there is no expiry date", () => {
    expect(expiryBadge(null, now)).toBeNull();
    expect(expiryBadge(undefined, now)).toBeNull();
  });

  it("returns null for an unparseable date", () => {
    expect(expiryBadge("not-a-date", now)).toBeNull();
  });

  it("stays quiet for dates well beyond the warning window", () => {
    expect(expiryBadge(new Date("2026-09-01T00:00:00"), now)).toBeNull();
  });

  it("warns inside the 30 day window", () => {
    expect(expiryBadge(new Date("2026-06-10T00:00:00"), now)).toEqual({ label: "In 7 days", tone: "warning" });
  });

  it("uses the singular form one day out", () => {
    expect(expiryBadge(new Date("2026-06-04T00:00:00"), now)).toEqual({ label: "In 1 day", tone: "warning" });
  });

  it("flags today and past dates as danger", () => {
    expect(expiryBadge(new Date("2026-06-03T23:00:00"), now)).toEqual({ label: "Expires today", tone: "danger" });
    expect(expiryBadge(new Date("2026-06-01T00:00:00"), now)).toEqual({ label: "Expired", tone: "danger" });
  });
});
