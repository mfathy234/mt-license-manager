import { describe, expect, it } from "vitest";

import { can } from "@/lib/permissions";

describe("permissions", () => {
  it("allows admins to manage settings", () => {
    expect(can("admin", "settings:write")).toBe(true);
  });

  it("prevents viewers from revealing credentials", () => {
    expect(can("viewer", "credential:read")).toBe(false);
  });

  it("keeps management capability aligned with stored roles", () => {
    expect(can("admin", "users:write")).toBe(true);
    expect(can("editor", "users:write")).toBe(false);
    expect(can("editor", "license:write")).toBe(true);
    expect(can("viewer", "license:write")).toBe(false);
  });
});
