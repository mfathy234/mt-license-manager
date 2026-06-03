import { describe, expect, it } from "vitest";

import { normalizeExcelDate } from "@/lib/excel";

describe("normalizeExcelDate", () => {
  it("normalizes Excel serial dates", () => {
    expect(normalizeExcelDate(45309)?.toISOString().slice(0, 10)).toBe("2024-01-18");
  });

  it("returns null for empty values", () => {
    expect(normalizeExcelDate("")).toBeNull();
  });
});
