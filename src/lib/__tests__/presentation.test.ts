import { describe, expect, it } from "vitest";

import {
  buildLicenseFilterChips,
  countActiveLicenses,
  dashboardRenewalBoundaries,
  getRenewalState,
  licenseFormFieldErrors,
  licenseSummaryItems,
  navigationForRole,
  navigationGroups,
  notificationKindLabel,
  notificationTone,
  summarizeRenewals,
  toneClassName,
} from "@/lib/presentation";

describe("presentation contracts", () => {
  it("builds local day boundaries that include day 30 but exclude day 31", () => {
    const now = new Date(2026, 7, 21, 18, 45);
    const { startOfToday, dueSoonEndExclusive } =
      dashboardRenewalBoundaries(now);
    const day30 = new Date(2026, 8, 20, 23, 59, 59, 999);
    const day31 = new Date(2026, 8, 21);

    expect(startOfToday).toEqual(new Date(2026, 7, 21));
    expect(dueSoonEndExclusive).toEqual(day31);
    expect(day30 >= startOfToday && day30 < dueSoonEndExclusive).toBe(true);
    expect(day31 < dueSoonEndExclusive).toBe(false);
  });

  it("keeps dashboard renewal boundaries at local midnight across DST", () => {
    const originalTimeZone = process.env.TZ;
    process.env.TZ = "America/New_York";

    try {
      const { startOfToday, dueSoonEndExclusive } = dashboardRenewalBoundaries(
        new Date(2026, 2, 7, 12),
      );

      expect(startOfToday).toEqual(new Date(2026, 2, 7));
      expect(dueSoonEndExclusive).toEqual(new Date(2026, 3, 7));
      expect(dueSoonEndExclusive.getHours()).toBe(0);
      expect(dueSoonEndExclusive.getTime() - startOfToday.getTime()).toBe(
        31 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000,
      );
    } finally {
      if (originalTimeZone === undefined) delete process.env.TZ;
      else process.env.TZ = originalTimeZone;
    }
  });

  it("counts active decrypted license statuses case-insensitively", () => {
    expect(
      countActiveLicenses([
        { status: "Active" },
        { status: "active" },
        { status: " ACTIVE " },
        { status: "Inactive" },
        { status: null },
      ]),
    ).toBe(3);
  });

  it("labels active license filters and ignores empty values", () => {
    expect(
      buildLicenseFilterChips({ q: "Acme", status: "Active", adminId: "u1" }, [
        { id: "u1", name: "Mona" },
      ]),
    ).toEqual([
      { key: "q", label: "Search", value: "Acme" },
      { key: "status", label: "Status", value: "Active" },
      { key: "adminId", label: "Administrator", value: "Mona" },
    ]);
  });

  it("keeps unresolved administrator filters removable", () => {
    expect(buildLicenseFilterChips({ adminId: "inactive-u1" }, [])).toEqual([
      {
        key: "adminId",
        label: "Administrator",
        value: "Unknown administrator",
      },
    ]);
  });

  it("maps every presentation tone to a visible semantic treatment", () => {
    expect(
      (["neutral", "success", "warning", "danger", "info"] as const).map(
        toneClassName,
      ),
    ).toEqual([
      "border-border bg-muted text-foreground",
      "border-success/25 bg-success-surface text-success",
      "border-warning/25 bg-warning-surface text-warning",
      "border-danger/25 bg-danger-surface text-danger",
      "border-info/25 bg-info-surface text-info",
    ]);
  });

  it("groups authenticated destinations by workflow", () => {
    expect(navigationGroups.map((group) => group.label)).toEqual([
      "Workspace",
      "Directory",
      "Administration",
    ]);
    expect(
      navigationGroups.flatMap((group) => group.items.map((item) => item.href)),
    ).toContain("/licenses");
  });

  it("hides administration links from viewers", () => {
    const hrefs = navigationForRole("viewer").flatMap((group) =>
      group.items.map((item) => item.href),
    );

    expect(hrefs).not.toContain("/users");
    expect(hrefs).toContain("/licenses");
  });

  it("shows administration links to admins", () => {
    const hrefs = navigationForRole("admin").flatMap((group) =>
      group.items.map((item) => item.href),
    );

    expect(hrefs).toContain("/users");
  });

  it("marks renewal dates by urgency", () => {
    const now = new Date("2026-08-21T12:00:00.000Z");
    expect(getRenewalState("2026-08-20", now).tone).toBe("danger");
    expect(getRenewalState("2026-08-28", now).label).toBe("Due in 7 days");
    expect(getRenewalState("2026-10-01", now).tone).toBe("success");
  });

  it("summarizes urgent renewal records without mutating input", () => {
    const input = [
      { expiryDate: "2026-08-20" },
      { expiryDate: "2026-08-28" },
      { expiryDate: "2026-10-01" },
    ];
    const snapshot = structuredClone(input);

    expect(summarizeRenewals(input, new Date("2026-08-21T12:00:00Z"))).toEqual({
      expired: 1,
      dueSoon: 1,
      healthy: 1,
    });
    expect(input).toEqual(snapshot);
  });

  it("turns stored notification kinds into readable labels", () => {
    expect(notificationKindLabel("renewal_reminder")).toBe("Renewal reminder");
  });

  it("maps notification outcomes to semantic tones", () => {
    expect(notificationTone("sent")).toBe("success");
    expect(notificationTone("failed")).toBe("danger");
    expect(notificationTone("pending")).toBe("warning");
  });

  it("handles renewal edge states by calendar day", () => {
    const now = new Date("2026-08-21T12:00:00.000Z");
    expect(getRenewalState("2026-08-21", now)).toEqual({
      label: "Due today",
      tone: "danger",
    });
    expect(getRenewalState("2026-08-22", now)).toEqual({
      label: "Due in 1 day",
      tone: "warning",
    });
    expect(getRenewalState(null, now)).toEqual({
      label: "No renewal date",
      tone: "neutral",
    });
  });

  it("builds a stable summary without exposing credential values", () => {
    const items = licenseSummaryItems(
      {
        status: "Active",
        expiryDate: "2026-08-28",
        adminsDisplay: "Mona",
        annualCost: 1200,
      },
      new Date("2026-08-21T12:00:00Z"),
    );

    expect(items.map((item) => item.label)).toEqual([
      "Status",
      "Renewal",
      "Administrators",
      "Annual cost",
    ]);
    expect(JSON.stringify(items)).not.toMatch(/password|secret/i);
  });

  it("maps missing required license details to its field", () => {
    expect(licenseFormFieldErrors({ details: "  " })).toEqual({
      details: "Details are required.",
    });
    expect(licenseFormFieldErrors({ details: "Design suite" })).toEqual({});
  });

  it("treats tomorrow after a DST fall-back as one calendar day", () => {
    const originalTimeZone = process.env.TZ;
    process.env.TZ = "America/New_York";

    try {
      const now = new Date(2026, 10, 1, 12);
      expect(now.getTimezoneOffset()).toBe(300);
      expect(getRenewalState("2026-11-02", now)).toEqual({
        label: "Due in 1 day",
        tone: "warning",
      });
    } finally {
      if (originalTimeZone === undefined) delete process.env.TZ;
      else process.env.TZ = originalTimeZone;
    }
  });
});
