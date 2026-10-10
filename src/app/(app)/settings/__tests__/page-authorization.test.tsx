import type { Session } from "next-auth";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const requirePagePermission = vi.hoisted(() => vi.fn());
const requirePageSession = vi.hoisted(() => vi.fn());
const smtpFindUnique = vi.hoisted(() => vi.fn());
const lookupFindMany = vi.hoisted(() => vi.fn());

vi.mock("@/lib/page-auth", () => ({
  requirePagePermission,
  requirePageSession,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    smtpSettings: { findUnique: smtpFindUnique },
    lookupValue: { findMany: lookupFindMany },
  },
}));

import EmailSettingsPage from "@/app/(app)/settings/email/page";
import LookupsPage from "@/app/(app)/settings/lookups/page";

const admin: Session = {
  expires: "2099-01-01T00:00:00.000Z",
  user: {
    id: "admin-1",
    name: "Administrator",
    email: "admin@example.com",
    role: "admin",
    status: "active",
  },
};

beforeAll(() => vi.stubGlobal("React", React));
afterAll(() => vi.unstubAllGlobals());

describe("settings page authorization boundaries", () => {
  beforeEach(() => {
    requirePagePermission.mockReset();
    requirePageSession.mockReset();
    smtpFindUnique.mockReset();
    lookupFindMany.mockReset();
  });

  it("authorizes email settings before loading SMTP metadata", async () => {
    let authorized = false;
    requirePagePermission.mockImplementation(async () => {
      authorized = true;
      return admin;
    });
    smtpFindUnique.mockImplementation(async () => {
      expect(authorized).toBe(true);
      return null;
    });

    await EmailSettingsPage();

    expect(requirePagePermission).toHaveBeenCalledWith("settings:write");
    expect(smtpFindUnique).toHaveBeenCalledWith({ where: { id: "default" } });
  });

  it("does not load SMTP metadata when settings authorization is denied", async () => {
    requirePagePermission.mockRejectedValue(new Error("access denied"));

    await expect(EmailSettingsPage()).rejects.toThrow("access denied");
    expect(smtpFindUnique).not.toHaveBeenCalled();
  });

  it("renders initial SMTP password guidance without serializing encrypted metadata", async () => {
    requirePagePermission.mockResolvedValue(admin);
    smtpFindUnique.mockResolvedValue({
      id: "default",
      host: "smtp.example.test",
      port: 587,
      secure: false,
      username: "mailer",
      passwordCipher: null,
      passwordIv: null,
      passwordTag: null,
      fromName: "License Desk",
      fromEmail: "licenses@example.test",
    });

    const markup = renderToStaticMarkup(await EmailSettingsPage());

    expect(markup).toContain(
      "Enter the SMTP password to complete initial setup.",
    );
    expect(markup).not.toContain("passwordCipher");
    expect(markup).not.toContain("passwordIv");
    expect(markup).not.toContain("passwordTag");
  });

  it("passes only saved-password availability when encrypted metadata exists", async () => {
    requirePagePermission.mockResolvedValue(admin);
    smtpFindUnique.mockResolvedValue({
      id: "default",
      host: "smtp.example.test",
      port: 465,
      secure: true,
      username: "mailer",
      passwordCipher: "never-render-ciphertext",
      passwordIv: "never-render-iv",
      passwordTag: "never-render-tag",
      fromName: "License Desk",
      fromEmail: "licenses@example.test",
    });

    const markup = renderToStaticMarkup(await EmailSettingsPage());

    expect(markup).toContain("Leave blank to keep the existing password.");
    expect(markup).not.toContain("never-render-ciphertext");
    expect(markup).not.toContain("never-render-iv");
    expect(markup).not.toContain("never-render-tag");
  });

  it("authorizes lookup settings before loading lookup values", async () => {
    let authorized = false;
    requirePagePermission.mockImplementation(async () => {
      authorized = true;
      return admin;
    });
    lookupFindMany.mockImplementation(async () => {
      expect(authorized).toBe(true);
      return [];
    });

    await LookupsPage();

    expect(requirePagePermission).toHaveBeenCalledWith("settings:write");
    expect(lookupFindMany).toHaveBeenCalledWith({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });
  });

  it("does not load lookup values when settings authorization is denied", async () => {
    requirePagePermission.mockRejectedValue(new Error("access denied"));

    await expect(LookupsPage()).rejects.toThrow("access denied");
    expect(lookupFindMany).not.toHaveBeenCalled();
  });
});
