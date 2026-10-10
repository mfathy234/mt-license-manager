import { describe, expect, it } from "vitest";

import { categorizeImportResults, normalizeExcelDate } from "@/lib/excel";

describe("normalizeExcelDate", () => {
  it("normalizes Excel serial dates", () => {
    expect(normalizeExcelDate(45309)?.toISOString().slice(0, 10)).toBe(
      "2024-01-18",
    );
  });

  it("returns null for empty values", () => {
    expect(normalizeExcelDate("")).toBeNull();
  });

  it("categorizes the atomic import response as imported rows", () => {
    expect(
      categorizeImportResults({
        batch: { rowCount: 3 },
      }),
    ).toEqual({ imported: 3, skipped: 0, failed: 0 });
  });
});
