import crypto from "crypto";

type EncryptedValue = {
  cipher: string;
  iv: string;
  tag: string;
};

function getKey() {
  const raw = process.env.CREDENTIAL_ENCRYPTION_KEY;
  if (raw) {
    const base64 = Buffer.from(raw, "base64");
    if (base64.length === 32) return base64;
    const hex = Buffer.from(raw, "hex");
    if (hex.length === 32) return hex;
  }

  if (process.env.NODE_ENV !== "production" && process.env.NEXTAUTH_SECRET) {
    return crypto.createHash("sha256").update(process.env.NEXTAUTH_SECRET).digest();
  }

  throw new Error("CREDENTIAL_ENCRYPTION_KEY must be a 32-byte base64 or hex key.");
}

export function encryptSecret(plainText: string): EncryptedValue {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    cipher: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64")
  };
}

export function decryptSecret(value: EncryptedValue): string {
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(value.iv, "base64"));
  decipher.setAuthTag(Buffer.from(value.tag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(value.cipher, "base64")),
    decipher.final()
  ]);
  return decrypted.toString("utf8");
}
