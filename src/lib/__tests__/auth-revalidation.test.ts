import type { JWT } from "next-auth/jwt";
import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique } },
}));

import { revalidateTokenAuthorization } from "@/lib/auth";

const cachedAdminToken = {
  sub: "user-1",
  role: "admin",
  status: "active",
} as JWT;

describe("token authorization revalidation", () => {
  beforeEach(() => findUnique.mockReset());

  it("replaces a cached admin role with the current viewer role", async () => {
    findUnique.mockResolvedValue({
      id: "user-1",
      role: "viewer",
      status: "active",
    });

    const effectiveToken = await revalidateTokenAuthorization(cachedAdminToken);

    expect(effectiveToken).toMatchObject({
      sub: "user-1",
      role: "viewer",
      status: "active",
    });
    expect(cachedAdminToken.role).toBe("admin");
  });

  it("rejects cached admin claims for disabled or missing users", async () => {
    findUnique.mockResolvedValueOnce({
      id: "user-1",
      role: "admin",
      status: "disabled",
    });
    findUnique.mockResolvedValueOnce(null);

    await expect(
      revalidateTokenAuthorization(cachedAdminToken),
    ).resolves.toBeNull();
    await expect(
      revalidateTokenAuthorization(cachedAdminToken),
    ).resolves.toBeNull();
  });

  it("allows an active user whose stored role matches the token", async () => {
    findUnique.mockResolvedValue({
      id: "user-1",
      role: "admin",
      status: "active",
    });

    await expect(
      revalidateTokenAuthorization(cachedAdminToken),
    ).resolves.toMatchObject({
      sub: "user-1",
      role: "admin",
      status: "active",
    });
  });
});
