import { describe, expect, it } from "vitest";

import { decryptSecret, encryptSecret } from "@/lib/crypto";

describe("credential encryption", () => {
  it("round-trips encrypted text", () => {
    const encrypted = encryptSecret("secret-password");
    expect(encrypted.cipher).not.toContain("secret-password");
    expect(decryptSecret(encrypted)).toBe("secret-password");
  });
});
