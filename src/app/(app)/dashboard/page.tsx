import { AlertTriangle, CalendarClock, KeyRound, Mail } from "lucide-react";
import Link from "next/link";

import {
  EmptyState,
  LinkButton,
  PageHeader,
  Panel,
  StatCard,
  TableEmpty,
  TableScroll,
  THead,
  Td,
  Th,
  Tr
} from "@/components/ui";
import { decryptLicense } from "@/lib/license-secure";
import { prisma } from "@/lib/prisma";
import { expiryBadge, formatDate } from "@/lib/utils";

const REMINDER_WINDOW_DAYS = 30;

export default async function DashboardPage() {
  const now = new Date();
  const soon = new Date(now);
  soon.setDate(soon.getDate() + REMINDER_WINDOW_DAYS);

  const [licenseCount, expiringCount, expiredCount, recipientCount, recent] = await Promise.all([
    prisma.license.count(),
    prisma.license.count({ where: { expiryDate: { gte: now, lte: soon } } }),
    prisma.license.count({ where: { expiryDate: { lt: now } } }),
    prisma.emailRecipient.count({ where: { active: true } }),
    prisma.license.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { encryptedData: true, adminAssignments: { include: { admin: true } } }
    })
  ]);
  const recentLicenses = recent.map(decryptLicense);

  return (
    <div className="grid gap-6">
      <PageHeader title="Dashboard" description="Operational view of licenses, subscriptions, and renewals." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Licenses" value={licenseCount} icon={<KeyRound aria-hidden className="h-5 w-5" />} />
        <StatCard
          label={`Expiring in ${REMINDER_WINDOW_DAYS} days`}
          value={expiringCount}
          icon={<CalendarClock aria-hidden className="h-5 w-5" />}
          hint="Renewal reminders are queued for these."
        />
        <StatCard
          label="Already expired"
          value={expiredCount}
          icon={<AlertTriangle aria-hidden className="h-5 w-5" />}
          hint={expiredCount > 0 ? "Needs attention." : "Nothing overdue."}
        />
        <StatCard label="Active recipients" value={recipientCount} icon={<Mail aria-hidden className="h-5 w-5" />} />
      </div>

      <Panel
        title="Recently updated"
        actions={
          <LinkButton href="/licenses" variant="secondary" size="sm">
            View all licenses
          </LinkButton>
        }
        bodyClassName="p-5 pt-3"
      >
        <TableScroll minWidthClassName="min-w-[640px]">
          <THead>
            <tr>
              <Th>License</Th>
              <Th>Branch</Th>
              <Th>Vendor</Th>
              <Th>Expiry</Th>
            </tr>
          </THead>
          <tbody>
            {recentLicenses.map((license) => {
              const badge = expiryBadge(license.expiryDate, now);
              return (
                <Tr key={license.id}>
                  <Td className="font-medium">
                    <Link href={`/licenses/${license.id}`} className="focus-ring rounded text-primary hover:underline">
                      {license.details}
                    </Link>
                  </Td>
                  <Td>{license.branch || "—"}</Td>
                  <Td>{license.vendor || "—"}</Td>
                  <Td>
                    <span className="tabular block">{formatDate(license.expiryDate)}</span>
                    {badge ? (
                      <span className={badge.tone === "danger" ? "text-xs text-danger" : "text-xs text-warning"}>
                        {badge.label}
                      </span>
                    ) : null}
                  </Td>
                </Tr>
              );
            })}
            {recentLicenses.length === 0 ? (
              <TableEmpty colSpan={4}>
                <EmptyState
                  icon={<KeyRound aria-hidden className="h-5 w-5" />}
                  title="No licenses yet"
                  description="Create a license or import the workbook to get started."
                  action={<LinkButton href="/licenses/new" size="sm">New license</LinkButton>}
                />
              </TableEmpty>
            ) : null}
          </tbody>
        </TableScroll>
      </Panel>
    </div>
  );
}
