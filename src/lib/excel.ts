import * as XLSX from "xlsx";

export type ParsedLicenseRow = {
  status?: string | null;
  serviceType?: string | null;
  details: string;
  branch?: string | null;
  vendor?: string | null;
  usersCount?: number | null;
  ownerAccount?: string | null;
  admins?: string | null;
  startDate?: Date | null;
  expiryDate?: Date | null;
  paymentMethod?: string | null;
  renewalFrequency?: string | null;
  costEgp?: number | null;
  costUsd?: number | null;
  monthlyCostEgp?: number | null;
  yearlyCostEgp?: number | null;
  fiveYearsCostEgp?: number | null;
  monthlyCostUsd?: number | null;
  yearlyCostUsd?: number | null;
  fiveYearsCostUsd?: number | null;
  notes?: string | null;
  rowNumber: number;
};

export type ParsedLookupValue = {
  category: string;
  value: string;
  sortOrder: number;
};

const aliases: Record<keyof Omit<ParsedLicenseRow, "rowNumber">, string[]> = {
  status: ["status"],
  serviceType: ["service type", "service"],
  details: ["details", "license", "subscription", "name"],
  branch: ["branch"],
  vendor: ["vendor", "supplier"],
  usersCount: ["users count", "users", "number of users"],
  ownerAccount: ["owner account", "owner", "account"],
  admins: ["admins", "admin", "administrator"],
  startDate: ["start date", "from", "issue date"],
  expiryDate: ["expiry date", "expiration date", "expire date", "to"],
  paymentMethod: ["payment method", "payment"],
  renewalFrequency: ["renewal frequency", "frequency"],
  costEgp: ["egp", "cost egp", "price egp"],
  costUsd: ["usd", "cost usd", "price usd"],
  monthlyCostEgp: ["monthly egp", "monthly-egp", "monthly cost egp"],
  yearlyCostEgp: ["yearly egp", "yearly-egp", "yearly cost egp"],
  fiveYearsCostEgp: ["5 years egp", "5 years-egp", "5 years cost egp", "five years egp"],
  monthlyCostUsd: ["monthly usd", "monthly-usd", "monthly cost usd"],
  yearlyCostUsd: ["yearly usd", "yearly-usd", "yearly cost usd"],
  fiveYearsCostUsd: ["5 years usd", "5 years-usd", "5 years cost usd", "five years usd"],
  notes: ["notes", "note", "remarks"]
};

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[_\n\r]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getValue(row: Record<string, unknown>, key: keyof Omit<ParsedLicenseRow, "rowNumber">) {
  const options = aliases[key];
  const entry = Object.entries(row).find(([header]) => options.includes(normalizeHeader(header)));
  return entry?.[1];
}

export function normalizeExcelDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d, parsed.H, parsed.M, Math.floor(parsed.S)));
  }
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function asString(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  return String(value).trim();
}

function asNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(String(value).replace(/,/g, ""));
  return Number.isNaN(number) ? null : number;
}

export function parseLicenseWorkbook(buffer: Buffer): ParsedLicenseRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames.find((name) => name.toLowerCase() === "license") ?? workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  return rows
    .map((row, index): ParsedLicenseRow | null => {
      const details = asString(getValue(row, "details"));
      if (!details) return null;

      return {
        status: asString(getValue(row, "status")),
        serviceType: asString(getValue(row, "serviceType")),
        details,
        branch: asString(getValue(row, "branch")),
        vendor: asString(getValue(row, "vendor")),
        usersCount: asNumber(getValue(row, "usersCount")),
        ownerAccount: asString(getValue(row, "ownerAccount")),
        admins: asString(getValue(row, "admins")),
        startDate: normalizeExcelDate(getValue(row, "startDate")),
        expiryDate: normalizeExcelDate(getValue(row, "expiryDate")),
        paymentMethod: asString(getValue(row, "paymentMethod")),
        renewalFrequency: asString(getValue(row, "renewalFrequency")),
        costEgp: asNumber(getValue(row, "costEgp")),
        costUsd: asNumber(getValue(row, "costUsd")),
        monthlyCostEgp: asNumber(getValue(row, "monthlyCostEgp")),
        yearlyCostEgp: asNumber(getValue(row, "yearlyCostEgp")),
        fiveYearsCostEgp: asNumber(getValue(row, "fiveYearsCostEgp")),
        monthlyCostUsd: asNumber(getValue(row, "monthlyCostUsd")),
        yearlyCostUsd: asNumber(getValue(row, "yearlyCostUsd")),
        fiveYearsCostUsd: asNumber(getValue(row, "fiveYearsCostUsd")),
        notes: asString(getValue(row, "notes")),
        rowNumber: index + 2
      };
    })
    .filter((row): row is ParsedLicenseRow => row !== null);
}

const lookupCategories: Record<string, string> = {
  status: "status",
  branches: "branch",
  branch: "branch",
  "service type": "serviceType",
  service: "serviceType",
  "renewal frequency": "renewalFrequency",
  frequency: "renewalFrequency",
  "payment method": "paymentMethod",
  payment: "paymentMethod"
};

export function parseLookupWorkbook(buffer: Buffer): ParsedLookupValue[] {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames.find((name) => name.toLowerCase() === "lookups");
  if (!sheetName) return [];

  const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], { header: 1, defval: "" });
  const headers = (rows[0] ?? []).map((header) => lookupCategories[normalizeHeader(header)] ?? null);
  const values: ParsedLookupValue[] = [];

  for (const [rowIndex, row] of rows.slice(1).entries()) {
    for (const [colIndex, cell] of row.entries()) {
      const category = headers[colIndex];
      const value = asString(cell);
      if (!category || !value) continue;
      values.push({ category, value, sortOrder: rowIndex });
    }
  }

  return values;
}
