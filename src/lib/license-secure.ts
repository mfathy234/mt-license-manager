import { Prisma } from "@prisma/client";
import type {
  License,
  LicenseAdmin,
  LicenseAdminAssignment,
  LicenseEncryptedData,
} from "@prisma/client";

import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { toDateOnlyInput } from "@/lib/utils";

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

export type DecryptedLicense<
  T extends LicenseWithSecureData = LicenseWithSecureData,
> = T &
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
    tag: encrypted.tag,
  };
}

export function decryptLicenseFields(
  license: LicenseWithSecureData,
): LicensePlainFields {
  if (license.encryptedData) {
    return JSON.parse(
      decryptSecret({
        cipher: license.encryptedData.cipher,
        iv: license.encryptedData.iv,
        tag: license.encryptedData.tag,
      }),
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
    notes: license.notes,
  };
}

export function decryptLicense<T extends LicenseWithSecureData>(
  license: T,
): DecryptedLicense<T> {
  const plain = decryptLicenseFields(license);
  const adminNames =
    license.adminAssignments?.map((assignment) => assignment.admin.name) ?? [];
  const adminIds =
    license.adminAssignments?.map((assignment) => assignment.adminId) ?? [];

  return {
    ...license,
    ...plain,
    adminIds,
    adminNames,
    adminsDisplay: adminNames.join(", "),
  };
}

/**
 * Builds the complete and exclusive client boundary for the license form.
 * Server-only relations and encrypted payloads cannot cross this whitelist.
 */
export function toLicenseFormValues(license: Record<string, unknown>) {
  return {
    id: textValue(license.id),
    details: textValue(license.details),
    status: optionalTextValue(license.status),
    serviceType: optionalTextValue(license.serviceType),
    branch: optionalTextValue(license.branch),
    vendor: optionalTextValue(license.vendor),
    usersCount: numberValue(license.usersCount),
    ownerAccount: optionalTextValue(license.ownerAccount),
    adminIds: Array.isArray(license.adminIds)
      ? license.adminIds.filter(
          (value): value is string => typeof value === "string",
        )
      : [],
    startDate: toDateOnlyInput(license.startDate),
    expiryDate: toDateOnlyInput(license.expiryDate),
    paymentMethod: optionalTextValue(license.paymentMethod),
    renewalFrequency: optionalTextValue(license.renewalFrequency),
    monthlyCostEgp: moneyValue(license.monthlyCostEgp ?? license.costEgp),
    yearlyCostEgp: moneyValue(license.yearlyCostEgp),
    fiveYearsCostEgp: moneyValue(license.fiveYearsCostEgp),
    monthlyCostUsd: moneyValue(license.monthlyCostUsd ?? license.costUsd),
    yearlyCostUsd: moneyValue(license.yearlyCostUsd),
    fiveYearsCostUsd: moneyValue(license.fiveYearsCostUsd),
    notes: optionalTextValue(license.notes),
  };
}

function textValue(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function optionalTextValue(value: unknown) {
  return value === null || value === undefined ? null : String(value);
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function moneyValue(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  return Prisma.Decimal.isDecimal(value) ? value.toString() : String(value);
}

export function legacyAdminNames(value?: string | null) {
  if (!value) return [];
  return value
    .split(/[,;\n|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}
