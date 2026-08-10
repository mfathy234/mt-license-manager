import { Prisma } from "@prisma/client";
import type { License, LicenseAdmin, LicenseAdminAssignment, LicenseEncryptedData } from "@prisma/client";

import { decryptSecret, encryptSecret } from "@/lib/crypto";

export type LicensePlainFields = {
  status?: string | null;
  serviceType?: string | null;
  details: string;
  branch?: string | null;
  vendor?: string | null;
  ownerAccount?: string | null;
  paymentMethod?: string | null;
  renewalFrequency?: string | null;
  notes?: string | null;
};

type LicenseWithSecureData = License & {
  encryptedData?: LicenseEncryptedData | null;
  adminAssignments?: Array<LicenseAdminAssignment & { admin: LicenseAdmin }>;
};

export type DecryptedLicense<T extends LicenseWithSecureData = LicenseWithSecureData> = T &
  LicensePlainFields & {
    adminIds: string[];
    adminNames: string[];
    adminsDisplay: string;
  };

export function encryptLicenseFields(fields: LicensePlainFields) {
  const encrypted = encryptSecret(JSON.stringify(fields));
  return {
    cipher: encrypted.cipher,
    iv: encrypted.iv,
    tag: encrypted.tag
  };
}

export function decryptLicenseFields(license: LicenseWithSecureData): LicensePlainFields {
  if (license.encryptedData) {
    return JSON.parse(
      decryptSecret({
        cipher: license.encryptedData.cipher,
        iv: license.encryptedData.iv,
        tag: license.encryptedData.tag
      })
    ) as LicensePlainFields;
  }

  return {
    status: license.status,
    serviceType: license.serviceType,
    details: license.details ?? "Encrypted license",
    branch: license.branch,
    vendor: license.vendor,
    ownerAccount: license.ownerAccount,
    paymentMethod: license.paymentMethod,
    renewalFrequency: license.renewalFrequency,
    notes: license.notes
  };
}

export function decryptLicense<T extends LicenseWithSecureData>(license: T): DecryptedLicense<T> {
  const plain = decryptLicenseFields(license);
  const adminNames = license.adminAssignments?.map((assignment) => assignment.admin.name) ?? [];
  const adminIds = license.adminAssignments?.map((assignment) => assignment.adminId) ?? [];

  return {
    ...license,
    ...plain,
    adminIds,
    adminNames,
    adminsDisplay: adminNames.join(", ")
  };
}

/**
 * Flattens a decrypted license into plain values for the client-side form.
 *
 * Prisma returns money columns as `Decimal` class instances, which cannot cross
 * the server/client boundary — Next.js logs "Only plain objects can be passed to
 * Client Components" for every cost field on every render. Stringifying them
 * keeps the values intact and the boundary clean.
 */
export function toLicenseFormValues(license: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(license).map(([key, value]) => [
      key,
      Prisma.Decimal.isDecimal(value) ? value.toString() : value
    ])
  );
}

export function legacyAdminNames(value?: string | null) {
  if (!value) return [];
  return value
    .split(/[,;\n|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}
