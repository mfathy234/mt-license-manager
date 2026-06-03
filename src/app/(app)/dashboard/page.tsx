import { AlertTriangle, CalendarClock, KeyRound, Mail } from "lucide-react";

import { Panel } from "@/components/ui";
import { decryptLicense } from "@/lib/license-secure";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const now = new Date();
  const soon = new Date(now);
  soon.setDate(soon.getDate() + 30);
  const [licenseCount, expiringCount, recipientCount, recent] = await Promise.all([
    prisma.license.count(),
    prisma.license.count({ where: { expiryDate: { gte: now, lte: soon } } }),
    prisma.emailRecipient.count({ where: { active: true } }),
    prisma.license.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { encryptedData: true, adminAssignments: { include: { admin: true } } }
    })
  ]);
  const recentLicenses = recent.map(decryptLicense);

  const stats = [
    { label: "Licenses", value: licenseCount, icon: KeyRound },
    { label: "Expiring in 30 days", value: expiringCount, icon: AlertTriangle },
    { label: "Recipients", value: recipientCount, icon: Mail },
    { label: "Reminder window", value: "30 days", icon: CalendarClock }
  ];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Operational view of licenses, subscriptions, and renewals.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Panel key={stat.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
                </div>
                <Icon aria-hidden className="h-5 w-5 text-primary" />
              </div>
            </Panel>
          );
        })}
      </div>
      <Panel>
        <h2 className="font-semibold">Recently updated</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-2">License</th>
                <th>Branch</th>
                <th>Vendor</th>
                <th>Expiry</th>
              </tr>
            </thead>
            <tbody>
              {recentLicenses.map((license) => (
                <tr key={license.id} className="border-t border-border">
                  <td className="py-3 font-medium">{license.details}</td>
                  <td>{license.branch || "-"}</td>
                  <td>{license.vendor || "-"}</td>
                  <td>{formatDate(license.expiryDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
