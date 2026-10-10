import { formatMoney } from "@/lib/utils";

export type PresentationTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type LicenseFilterValues = {
  q?: string;
  status?: string;
  serviceType?: string;
  branch?: string;
  adminId?: string;
  renewalFrequency?: string;
  pageSize?: string;
};

export type LicenseFilterChip = {
  key: Exclude<keyof LicenseFilterValues, "pageSize">;
  label: string;
  value: string;
};

export function buildLicenseFilterChips(
  filters: Readonly<LicenseFilterValues>,
  admins: ReadonlyArray<Readonly<{ id: string; name: string }>>,
): LicenseFilterChip[] {
  const administrator = admins.find((admin) => admin.id === filters.adminId);
  const candidates: LicenseFilterChip[] = [
    { key: "q", label: "Search", value: filters.q ?? "" },
    { key: "status", label: "Status", value: filters.status ?? "" },
    {
      key: "serviceType",
      label: "Service",
      value: filters.serviceType ?? "",
    },
    { key: "branch", label: "Branch", value: filters.branch ?? "" },
    {
      key: "renewalFrequency",
      label: "Renewal",
      value: filters.renewalFrequency ?? "",
    },
    {
      key: "adminId",
      label: "Administrator",
      value: filters.adminId
        ? (administrator?.name ?? "Unknown administrator")
        : "",
    },
  ];

  return candidates.filter((chip) => chip.value.length > 0);
}

const toneClassNames: Record<PresentationTone, string> = {
  neutral: "border-border bg-muted text-foreground",
  success: "border-success/25 bg-success-surface text-success",
  warning: "border-warning/25 bg-warning-surface text-warning",
  danger: "border-danger/25 bg-danger-surface text-danger",
  info: "border-info/25 bg-info-surface text-info",
};

export function toneClassName(tone: PresentationTone): string {
  return toneClassNames[tone];
}

export type NavigationItem = {
  label: string;
  href: string;
  roles?: Array<"admin" | "editor" | "viewer">;
};

export type NavigationGroup = { label: string; items: NavigationItem[] };

export const navigationGroups: NavigationGroup[] = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Licenses", href: "/licenses" },
      { label: "Notifications", href: "/notifications" },
    ],
  },
  {
    label: "Directory",
    items: [
      { label: "Recipients", href: "/recipients" },
      { label: "Groups", href: "/groups" },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Users", href: "/users", roles: ["admin"] },
      { label: "Email settings", href: "/settings/email", roles: ["admin"] },
      { label: "Lookups", href: "/settings/lookups", roles: ["admin"] },
    ],
  },
];

export function navigationForRole(role: "admin" | "editor" | "viewer") {
  return navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.roles || item.roles.includes(role),
      ),
    }))
    .filter((group) => group.items.length > 0);
}

export function getRenewalState(
  expiryDate?: Date | string | null,
  now = new Date(),
) {
  const expiry = parseCalendarDate(expiryDate);
  if (!expiry) return { label: "No renewal date", tone: "neutral" as const };

  const days = calendarDayIndex(expiry) - calendarDayIndex(now);
  if (days < 0) return { label: "Expired", tone: "danger" as const };
  if (days === 0) return { label: "Due today", tone: "danger" as const };
  if (days <= 30)
    return {
      label: `Due in ${days} day${days === 1 ? "" : "s"}`,
      tone: "warning" as const,
    };
  return { label: `Due in ${days} days`, tone: "success" as const };
}

export type LicenseSummaryInput = Readonly<{
  status?: string | null;
  expiryDate?: Date | string | null;
  adminsDisplay?: string | null;
  annualCost?: number | string | null;
}>;

export type LicenseSummaryItem = {
  label: string;
  value: string;
  tone?: PresentationTone;
};

export function licenseSummaryItems(
  license: LicenseSummaryInput,
  now = new Date(),
): LicenseSummaryItem[] {
  const renewal = getRenewalState(license.expiryDate, now);

  return [
    { label: "Status", value: license.status || "—" },
    { label: "Renewal", value: renewal.label, tone: renewal.tone },
    {
      label: "Administrators",
      value: license.adminsDisplay || "—",
    },
    { label: "Annual cost", value: formatMoney(license.annualCost, "USD") },
  ];
}

export type LicenseFormFieldName =
  | "details"
  | "status"
  | "serviceType"
  | "branch"
  | "vendor"
  | "ownerAccount"
  | "adminIds"
  | "usersCount"
  | "startDate"
  | "expiryDate"
  | "paymentMethod"
  | "renewalFrequency"
  | "monthlyCostEgp"
  | "yearlyCostEgp"
  | "fiveYearsCostEgp"
  | "monthlyCostUsd"
  | "yearlyCostUsd"
  | "fiveYearsCostUsd"
  | "notes";

export type LicenseFormFieldErrors = Partial<
  Record<LicenseFormFieldName, string>
>;

export function licenseFormFieldErrors(input: {
  details?: unknown;
}): LicenseFormFieldErrors {
  return typeof input.details !== "string" || !input.details.trim()
    ? { details: "Details are required." }
    : {};
}

export type RenewalSummary = {
  expired: number;
  dueSoon: number;
  healthy: number;
};

export function dashboardRenewalBoundaries(now = new Date()) {
  return {
    startOfToday: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    dueSoonEndExclusive: new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 31,
    ),
  };
}

export function countActiveLicenses(
  licenses: ReadonlyArray<Readonly<{ status?: string | null }>>,
) {
  return licenses.filter(
    (license) => license.status?.trim().toLowerCase() === "active",
  ).length;
}

export function summarizeRenewals(
  records: ReadonlyArray<{ expiryDate?: Date | string | null }>,
  now = new Date(),
): RenewalSummary {
  return records.reduce<RenewalSummary>(
    (summary, record) => {
      const renewal = getRenewalState(record.expiryDate, now);

      if (renewal.tone === "danger") {
        return { ...summary, expired: summary.expired + 1 };
      }
      if (renewal.tone === "warning") {
        return { ...summary, dueSoon: summary.dueSoon + 1 };
      }
      return { ...summary, healthy: summary.healthy + 1 };
    },
    { expired: 0, dueSoon: 0, healthy: 0 },
  );
}

export function notificationKindLabel(kind: string) {
  const value = kind.replace(/_/g, " ").trim();
  return value ? value[0].toUpperCase() + value.slice(1) : "Notification";
}

export function notificationTone(status?: string): PresentationTone {
  switch (status?.trim().toLowerCase()) {
    case "sent":
    case "success":
      return "success";
    case "failed":
    case "error":
      return "danger";
    case "pending":
    case "queued":
      return "warning";
    default:
      return "neutral";
  }
}

function parseCalendarDate(value?: Date | string | null) {
  if (!value) return null;
  if (typeof value === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (match)
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function calendarDayIndex(date: Date) {
  return (
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) /
    (24 * 60 * 60 * 1000)
  );
}
