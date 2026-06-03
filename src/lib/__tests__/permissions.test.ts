import { describe, expect, it } from "vitest";

import { can } from "@/lib/permissions";

describe("permissions", () => {
  it("allows admins to manage settings", () => {
    expect(can("admin", "settings:write")).toBe(true);
  });

  it("prevents viewers from revealing credentials", () => {
    expect(can("viewer", "credential:read")).toBe(false);
  });
});
