import type { Session } from "next-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getProtectedSession = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ getProtectedSession }));

import { requireSession } from "@/lib/api";

function session(role: "admin" | "editor" | "viewer"): Session {
  return {
    expires: "2099-01-01T00:00:00.000Z",
    user: {
      id: "user-1",
      name: "Current user",
      email: "current@example.com",
      role,
      status: "active",
    },
  };
}

describe("requireSession", () => {
  beforeEach(() => getProtectedSession.mockReset());

  it("forbids an action after revalidation downgrades admin to viewer", async () => {
    getProtectedSession.mockResolvedValue(session("viewer"));

    const result = await requireSession("users:write");

    expect(result.error?.status).toBe(403);
  });

  it("rejects protected access when revalidation denies the identity", async () => {
    getProtectedSession.mockResolvedValue(null);

    const result = await requireSession("license:read");

    expect(result.error?.status).toBe(401);
  });

  it("allows an active matching admin to perform protected actions", async () => {
    const activeAdmin = session("admin");
    getProtectedSession.mockResolvedValue(activeAdmin);

    const result = await requireSession("users:write");

    expect(result).toEqual({ session: activeAdmin });
  });
});
