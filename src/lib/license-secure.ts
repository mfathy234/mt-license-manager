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

export function legacyAdminNames(value?: string | null) {
  if (!value) return [];
  return value
    .split(/[,;\n|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}
