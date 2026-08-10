import { describe, expect, it } from "vitest";

import { expiryBadge, toDateInputValue, toDateOnlyInput } from "@/lib/utils";

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

describe("toDateOnlyInput", () => {
  it("returns an empty string for missing values", () => {
    expect(toDateOnlyInput(null)).toBe("");
    expect(toDateOnlyInput(undefined)).toBe("");
    expect(toDateOnlyInput("")).toBe("");
  });

  it("returns an empty string for an unparseable value", () => {
    expect(toDateOnlyInput("not-a-date")).toBe("");
  });

  it("reads a Date rather than slicing its string form", () => {
    // `String(date)` is "Fri Dec 25 2030 ..."; slicing that produced garbage and
    // left the picker blank on every edit.
    expect(toDateOnlyInput(new Date("2030-12-25T00:00:00"))).toBe("2030-12-25");
  });

  it("keeps future dates intact", () => {
    expect(toDateOnlyInput(new Date("2032-03-09T00:00:00"))).toBe("2032-03-09");
  });

  it("resolves a stored local midnight to the day it displays as", () => {
    // Seeded and imported rows land on local midnight, e.g. 2028-04-19T22:00Z
    // for Apr 20 in UTC+2. Reading in UTC would report the previous day.
    expect(toDateOnlyInput(new Date(2028, 3, 20))).toBe("2028-04-20");
  });

  it("passes through a date-only string untouched", () => {
    expect(toDateOnlyInput("2029-08-18")).toBe("2029-08-18");
  });
});

describe("toDateInputValue", () => {
  it("pads month and day to two digits", () => {
    expect(toDateInputValue(new Date(2030, 0, 5))).toBe("2030-01-05");
  });
});
