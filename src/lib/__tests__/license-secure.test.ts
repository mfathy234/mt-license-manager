import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { toLicenseFormValues } from "@/lib/license-secure";

describe("license form client boundary", () => {
  it("serializes every form value while excluding encrypted and relation data", () => {
    const startDate = new Date(2026, 0, 15);
    const expiryDate = new Date(2027, 0, 15);
    const values = toLicenseFormValues({
      id: "license-1",
      details: "Design suite",
      status: "Active",
      serviceType: "Subscription",
      branch: "Cairo",
      vendor: "Vendor Co",
      usersCount: 25,
      ownerAccount: "Finance",
      adminIds: ["admin-1", "admin-2"],
      startDate,
      expiryDate,
      paymentMethod: "Card",
      renewalFrequency: "Yearly",
      monthlyCostEgp: new Prisma.Decimal("100.50"),
      yearlyCostEgp: new Prisma.Decimal("1200.00"),
      fiveYearsCostEgp: new Prisma.Decimal("6000.00"),
      monthlyCostUsd: new Prisma.Decimal("10.25"),
      yearlyCostUsd: new Prisma.Decimal("120.00"),
      fiveYearsCostUsd: new Prisma.Decimal("600.00"),
      notes: "Renew in January",
      encryptedData: {
        cipher: "encrypted-license-payload",
        iv: "private-iv",
        tag: "private-tag",
      },
      cipher: "top-level-cipher",
      iv: "top-level-iv",
      tag: "top-level-tag",
      credentials: [{ id: "credential-1", label: "Production" }],
      histories: [{ id: "history-1" }],
      adminAssignments: [{ id: "assignment-1" }],
    });

    expect(values).toEqual({
      id: "license-1",
      details: "Design suite",
      status: "Active",
      serviceType: "Subscription",
      branch: "Cairo",
      vendor: "Vendor Co",
      usersCount: 25,
      ownerAccount: "Finance",
      adminIds: ["admin-1", "admin-2"],
      startDate: "2026-01-15",
      expiryDate: "2027-01-15",
      paymentMethod: "Card",
      renewalFrequency: "Yearly",
      monthlyCostEgp: "100.5",
      yearlyCostEgp: "1200",
      fiveYearsCostEgp: "6000",
      monthlyCostUsd: "10.25",
      yearlyCostUsd: "120",
      fiveYearsCostUsd: "600",
      notes: "Renew in January",
    });
    expect(values).not.toHaveProperty("encryptedData");
    expect(values).not.toHaveProperty("cipher");
    expect(values).not.toHaveProperty("iv");
    expect(values).not.toHaveProperty("tag");
    expect(values).not.toHaveProperty("credentials");
    expect(values).not.toHaveProperty("histories");
    expect(values).not.toHaveProperty("adminAssignments");
  });

  it("normalizes legacy monthly costs without exposing legacy keys", () => {
    const values = toLicenseFormValues({
      id: "license-legacy",
      details: "Legacy license",
      costEgp: new Prisma.Decimal("55.50"),
      costUsd: new Prisma.Decimal("7.25"),
    });

    expect(values.monthlyCostEgp).toBe("55.5");
    expect(values.monthlyCostUsd).toBe("7.25");
    expect(values).not.toHaveProperty("costEgp");
    expect(values).not.toHaveProperty("costUsd");
  });
});
