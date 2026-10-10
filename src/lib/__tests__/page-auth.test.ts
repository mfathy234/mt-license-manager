import type { Session } from "next-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getProtectedSession = vi.hoisted(() => vi.fn());
const redirect = vi.hoisted(() =>
  vi.fn((path: string): never => {
    throw new Error(`redirect:${path}`);
  }),
);

vi.mock("@/lib/auth", () => ({ getProtectedSession }));
vi.mock("next/navigation", () => ({ redirect }));

import { requirePagePermission, requirePageSession } from "@/lib/page-auth";

const activeViewer: Session = {
  expires: "2099-01-01T00:00:00.000Z",
  user: {
    id: "user-1",
    name: "Current user",
    email: "current@example.com",
    role: "viewer",
    status: "active",
  },
};

function activeSession(role: "admin" | "editor" | "viewer"): Session {
  return {
    ...activeViewer,
    user: { ...activeViewer.user, role },
  };
}

describe("requirePageSession", () => {
  beforeEach(() => {
    getProtectedSession.mockReset();
    redirect.mockClear();
  });

  it("returns the active session with its current stored role", async () => {
    getProtectedSession.mockResolvedValue(activeViewer);

    await expect(requirePageSession()).resolves.toBe(activeViewer);
    expect(redirect).not.toHaveBeenCalled();
  });

  it.each(["disabled", "missing", "null"])(
    "redirects when the protected session is %s",
    async () => {
      getProtectedSession.mockResolvedValue(null);

      await expect(requirePageSession()).rejects.toThrow("redirect:/login");
      expect(redirect).toHaveBeenCalledWith("/login");
    },
  );

  it("redirects when database-backed revalidation fails", async () => {
    getProtectedSession.mockRejectedValue(new Error("database unavailable"));

    await expect(requirePageSession()).rejects.toThrow("redirect:/login");
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});

describe("requirePagePermission", () => {
  beforeEach(() => {
    getProtectedSession.mockReset();
    redirect.mockClear();
  });

  it("returns an active admin authorized to manage settings", async () => {
    const admin = activeSession("admin");
    getProtectedSession.mockResolvedValue(admin);

    await expect(requirePagePermission("settings:write")).resolves.toBe(admin);
    expect(redirect).not.toHaveBeenCalled();
  });

  it.each(["editor", "viewer"] as const)(
    "denies an active %s access to settings pages",
    async (role) => {
      getProtectedSession.mockResolvedValue(activeSession(role));

      await expect(requirePagePermission("settings:write")).rejects.toThrow(
        "redirect:/dashboard",
      );
      expect(redirect).toHaveBeenCalledWith("/dashboard");
    },
  );

  it("fails closed when protected-session revalidation fails", async () => {
    getProtectedSession.mockRejectedValue(new Error("database unavailable"));

    await expect(requirePagePermission("settings:write")).rejects.toThrow(
      "redirect:/login",
    );
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
