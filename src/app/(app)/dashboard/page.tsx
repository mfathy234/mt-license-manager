import { ChevronRight, FileUp, KeyRound, Plus, Settings } from "lucide-react";
import Link from "next/link";

import {
  EmptyState,
  LinkButton,
  PageHeader,
  Panel,
  StatStrip,
  StatusPill,
  TableScroll,
  THead,
  Td,
  Th,
  Tr,
} from "@/components/ui";
import { decryptLicense } from "@/lib/license-secure";
import { requirePageSession } from "@/lib/page-auth";
import { can } from "@/lib/permissions";
import {
  countActiveLicenses,
  dashboardRenewalBoundaries,
  getRenewalState,
} from "@/lib/presentation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

const REMINDER_WINDOW_DAYS = 30;

export default async function DashboardPage() {
  const session = await requirePageSession();
  const now = new Date();
  const { startOfToday, dueSoonEndExclusive } = dashboardRenewalBoundaries(now);

  const [licensesForStatus, expiringCount, expiredCount, risk, recent] =
    await Promise.all([
      prisma.license.findMany({ include: { encryptedData: true } }),
      prisma.license.count({
        where: {
          expiryDate: { gte: startOfToday, lt: dueSoonEndExclusive },
        },
      }),
      prisma.license.count({
        where: { expiryDate: { lt: startOfToday } },
      }),
      prisma.license.findMany({
        where: {
          expiryDate: { not: null, lt: dueSoonEndExclusive },
        },
        orderBy: { expiryDate: "asc" },
        take: 6,
        include: {
          encryptedData: true,
          adminAssignments: { include: { admin: true } },
        },
      }),
      prisma.license.findMany({
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: {
          encryptedData: true,
          adminAssignments: { include: { admin: true } },
        },
      }),
    ]);
  const licenseCount = licensesForStatus.length;
  const activeLicenseCount = countActiveLicenses(
    licensesForStatus.map(decryptLicense),
  );
  const riskLicenses = risk.map(decryptLicense);
  const recentLicenses = recent.map(decryptLicense);
  const summary = {
    expired: expiredCount,
    dueSoon: expiringCount,
    healthy: Math.max(licenseCount - expiredCount - expiringCount, 0),
  };
  const canCreate = can(session?.user?.role, "license:write");
  const canImport = can(session?.user?.role, "import:write");
  const canManageSettings = can(session?.user?.role, "settings:write");

  return (
    <div className="grid gap-4">
      <PageHeader title="Dashboard" />

      <StatStrip
        items={[
          { label: "All licenses", value: licenseCount },
          {
            label: "Renewing soon",
            value: summary.dueSoon,
            tone: "warning",
            hint: `Within ${REMINDER_WINDOW_DAYS} days`,
          },
          {
            label: "Expired",
            value: summary.expired,
            tone: "danger",
            hint: summary.expired > 0 ? "Needs attention" : "Nothing overdue",
          },
          { label: "Active licenses", value: activeLicenseCount, tone: "info" },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel
          title="Renewal risk"
          actions={
            <LinkButton href="/licenses" variant="ghost" size="sm">
              Review licenses
            </LinkButton>
          }
          bodyClassName="p-0"
        >
          <ul className="divide-y divide-border">
            {riskLicenses.map((license) => {
              const renewal = getRenewalState(license.expiryDate, now);
              const context =
                license.ownerAccount ||
                license.adminsDisplay ||
                "No owner assigned";

              return (
                <li key={license.id}>
                  <Link
                    href={`/licenses/${license.id}`}
                    className="focus-ring flex items-center gap-3 px-4 py-2 transition-colors duration-150 hover:bg-muted/50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {license.details}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {[license.vendor, context].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <span className="tabular hidden shrink-0 text-sm text-muted-foreground sm:block">
                      {formatDate(license.expiryDate)}
                    </span>
                    <StatusPill value={renewal.label} tone={renewal.tone} />
                    <ChevronRight
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                    />
                  </Link>
                </li>
              );
            })}
            {riskLicenses.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                No licenses are expired or due within 30 days.
              </li>
            ) : null}
          </ul>
        </Panel>

        <Panel title="Quick actions" bodyClassName="grid gap-1 p-2">
          {canCreate ? (
            <LinkButton
              href="/licenses/new"
              variant="ghost"
              className="w-full justify-start"
            >
              <Plus aria-hidden className="h-4 w-4 text-primary" />
              New license
            </LinkButton>
          ) : null}
          {canImport ? (
            <LinkButton
              href="/licenses/import"
              variant="ghost"
              className="w-full justify-start"
            >
              <FileUp aria-hidden className="h-4 w-4 text-primary" />
              Import workbook
            </LinkButton>
          ) : null}
          {canManageSettings ? (
            <LinkButton
              href="/settings/email"
              variant="ghost"
              className="w-full justify-start"
            >
              <Settings aria-hidden className="h-4 w-4 text-primary" />
              Email settings
            </LinkButton>
          ) : null}
          {!canCreate && !canImport && !canManageSettings ? (
            <p className="px-2 py-1 text-sm text-muted-foreground">
              Your role has no dashboard shortcuts.
            </p>
          ) : null}
        </Panel>
      </div>

      <Panel
        title="Recent licenses"
        actions={
          <LinkButton href="/licenses" variant="ghost" size="sm">
            View all
          </LinkButton>
        }
        bodyClassName="p-0"
      >
        {recentLicenses.length === 0 ? (
          <div className="py-8">
            <EmptyState
              icon={<KeyRound aria-hidden className="h-4 w-4" />}
              title="No licenses yet"
              description="Create a license or import a workbook to get started."
            />
          </div>
        ) : (
          <TableScroll
            minWidthClassName="min-w-[720px]"
            className="rounded-none border-0 shadow-none"
          >
            <THead>
              <tr>
                <Th>License</Th>
                <Th>Owner</Th>
                <Th>Vendor</Th>
                <Th>Renewal</Th>
                <Th>Expiry</Th>
              </tr>
            </THead>
            <tbody>
              {recentLicenses.map((license) => {
                const renewal = getRenewalState(license.expiryDate, now);
                return (
                  <Tr key={license.id}>
                    <Td className="font-medium">
                      <Link
                        href={`/licenses/${license.id}`}
                        className="focus-ring rounded text-primary hover:underline"
                      >
                        {license.details}
                      </Link>
                    </Td>
                    <Td>
                      {license.ownerAccount || license.adminsDisplay || "—"}
                    </Td>
                    <Td>{license.vendor || "—"}</Td>
                    <Td>
                      <StatusPill value={renewal.label} tone={renewal.tone} />
                    </Td>
                    <Td className="tabular">
                      {formatDate(license.expiryDate)}
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </TableScroll>
        )}
      </Panel>
    </div>
  );
}
