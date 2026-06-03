import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";

const prisma = new PrismaClient();
const workbookPath = "License & Subscribtions - Microtec.xlsx";

function getKey() {
  const raw = process.env.CREDENTIAL_ENCRYPTION_KEY;
  if (!raw) throw new Error("CREDENTIAL_ENCRYPTION_KEY is required.");
  const base64 = Buffer.from(raw, "base64");
  if (base64.length === 32) return base64;
  const hex = Buffer.from(raw, "hex");
  if (hex.length === 32) return hex;
  throw new Error("CREDENTIAL_ENCRYPTION_KEY must be a 32-byte base64 or hex key.");
}

function encrypt(plainText) {
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

function decrypt(value) {
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(value.iv, "base64"));
  decipher.setAuthTag(Buffer.from(value.tag, "base64"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(value.cipher, "base64")), decipher.final()]);
  return decrypted.toString("utf8");
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[_\n\r]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function asString(value) {
  if (value === null || value === undefined || value === "") return null;
  return String(value).trim();
}

function asNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(String(value).replace(/,/g, ""));
  return Number.isNaN(number) ? null : number;
}

function splitAdmins(value) {
  if (!value) return [];
  return String(value)
    .split(/[,;\n|/]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseWorkbook() {
  const workbook = XLSX.readFile(workbookPath, { cellDates: true });
  const licenseRows = XLSX.utils.sheet_to_json(workbook.Sheets.License, { defval: "" });
  const licenseHeaders = Object.keys(licenseRows[0] ?? {});
  const findHeader = (aliases) => licenseHeaders.find((header) => aliases.includes(normalize(header)));
  const h = {
    status: findHeader(["status"]),
    serviceType: findHeader(["service type"]),
    details: findHeader(["details"]),
    branch: findHeader(["branch"]),
    vendor: findHeader(["vendor"]),
    note: findHeader(["note", "notes"]),
    ownerAccount: findHeader(["owner account"]),
    admins: findHeader(["admins"]),
    paymentMethod: findHeader(["payment method"]),
    renewalFrequency: findHeader(["renewal frequency"]),
    monthlyCostEgp: findHeader(["monthly-egp", "monthly egp"]),
    yearlyCostEgp: findHeader(["yearly-egp", "yearly egp"]),
    fiveYearsCostEgp: findHeader(["5 years-egp", "5 years egp"]),
    monthlyCostUsd: findHeader(["monthly-usd", "monthly usd"]),
    yearlyCostUsd: findHeader(["yearly-usd", "yearly usd"]),
    fiveYearsCostUsd: findHeader(["5 years-usd", "5 years usd"])
  };

  const licenses = licenseRows
    .map((row) => ({
      status: asString(row[h.status]),
      serviceType: asString(row[h.serviceType]),
      details: asString(row[h.details]),
      branch: asString(row[h.branch]),
      vendor: asString(row[h.vendor]),
      notes: asString(row[h.note]),
      ownerAccount: asString(row[h.ownerAccount]),
      admins: asString(row[h.admins]),
      paymentMethod: asString(row[h.paymentMethod]),
      renewalFrequency: asString(row[h.renewalFrequency]),
      monthlyCostEgp: asNumber(row[h.monthlyCostEgp]),
      yearlyCostEgp: asNumber(row[h.yearlyCostEgp]),
      fiveYearsCostEgp: asNumber(row[h.fiveYearsCostEgp]),
      monthlyCostUsd: asNumber(row[h.monthlyCostUsd]),
      yearlyCostUsd: asNumber(row[h.yearlyCostUsd]),
      fiveYearsCostUsd: asNumber(row[h.fiveYearsCostUsd])
    }))
    .filter((row) => row.details);

  const lookupsSheet = workbook.Sheets.LookUps;
  const lookups = [];
  if (lookupsSheet) {
    const rows = XLSX.utils.sheet_to_json(lookupsSheet, { header: 1, defval: "" });
    const categoryMap = {
      status: "status",
      branches: "branch",
      "service type": "serviceType",
      "renewal frequency": "renewalFrequency",
      "payment method": "paymentMethod"
    };
    const categories = (rows[0] ?? []).map((header) => categoryMap[normalize(header)]);
    for (const [rowIndex, row] of rows.slice(1).entries()) {
      for (const [columnIndex, cell] of row.entries()) {
        const category = categories[columnIndex];
        const value = asString(cell);
        if (category && value) lookups.push({ category, value, sortOrder: rowIndex });
      }
    }
  }

  return { licenses, lookups };
}

function workbookKey(row) {
  return `${normalize(row.details)}|${normalize(row.vendor)}`;
}

async function main() {
  const { licenses: workbookLicenses, lookups } = parseWorkbook();
  for (const lookup of lookups) {
    await prisma.lookupValue.upsert({
      where: { category_value: { category: lookup.category, value: lookup.value } },
      create: lookup,
      update: { sortOrder: lookup.sortOrder, active: true }
    });
  }

  const byKey = new Map();
  for (const row of workbookLicenses) {
    const key = workbookKey(row);
    const bucket = byKey.get(key) ?? [];
    bucket.push(row);
    byKey.set(key, bucket);
  }

  const dbLicenses = await prisma.license.findMany({ include: { encryptedData: true } });
  let encrypted = 0;
  let adminAssignments = 0;
  let costBackfills = 0;

  for (const license of dbLicenses) {
    const plain = license.encryptedData
      ? JSON.parse(decrypt(license.encryptedData))
      : {
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

    const bucket = byKey.get(workbookKey(plain));
    const workbookRow = bucket?.shift();
    const merged = { ...plain, ...Object.fromEntries(Object.entries(workbookRow ?? {}).filter(([, value]) => value !== null && value !== undefined && value !== "")) };
    const adminNames = splitAdmins(license.admins || workbookRow?.admins);
    const encryptedPayload = encrypt(JSON.stringify({
      status: merged.status,
      serviceType: merged.serviceType,
      details: merged.details,
      branch: merged.branch,
      vendor: merged.vendor,
      ownerAccount: merged.ownerAccount,
      paymentMethod: merged.paymentMethod,
      renewalFrequency: merged.renewalFrequency,
      notes: merged.notes
    }));

    await prisma.$transaction(async (tx) => {
      await tx.licenseEncryptedData.upsert({
        where: { licenseId: license.id },
        create: { licenseId: license.id, ...encryptedPayload },
        update: encryptedPayload
      });
      await tx.licenseAdminAssignment.deleteMany({ where: { licenseId: license.id } });
      for (const name of adminNames) {
        const admin = await tx.licenseAdmin.upsert({
          where: { name },
          create: { name },
          update: { active: true }
        });
        await tx.licenseAdminAssignment.create({
          data: { licenseId: license.id, adminId: admin.id }
        });
        adminAssignments += 1;
      }
      await tx.license.update({
        where: { id: license.id },
        data: {
          status: null,
          serviceType: null,
          details: null,
          branch: null,
          vendor: null,
          ownerAccount: null,
          admins: null,
          paymentMethod: null,
          renewalFrequency: null,
          notes: null,
          monthlyCostEgp: workbookRow?.monthlyCostEgp ?? license.monthlyCostEgp ?? license.costEgp,
          yearlyCostEgp: workbookRow?.yearlyCostEgp ?? license.yearlyCostEgp,
          fiveYearsCostEgp: workbookRow?.fiveYearsCostEgp ?? license.fiveYearsCostEgp,
          monthlyCostUsd: workbookRow?.monthlyCostUsd ?? license.monthlyCostUsd ?? license.costUsd,
          yearlyCostUsd: workbookRow?.yearlyCostUsd ?? license.yearlyCostUsd,
          fiveYearsCostUsd: workbookRow?.fiveYearsCostUsd ?? license.fiveYearsCostUsd
        }
      });
    });

    encrypted += 1;
    if (workbookRow) costBackfills += 1;
  }

  console.log(JSON.stringify({ licensesEncrypted: encrypted, adminAssignments, costBackfills, lookups: lookups.length }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
