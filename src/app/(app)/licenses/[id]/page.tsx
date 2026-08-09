import { Bell, KeyRound } from "lucide-react";
import { notFound } from "next/navigation";

import { LicenseForm } from "@/components/license-form";
import { EmptyState, PageHeader, Panel, StatCard, StatusPill } from "@/components/ui";
import { decryptLicense } from "@/lib/license-secure";
import { getLicenseFormOptions } from "@/lib/lookups";
import { prisma } from "@/lib/prisma";
import { expiryBadge, formatDate, formatMoney } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export default async function LicenseDetailPage({ params }: Props) {
  const { id } = await params;
  const [license, formOptions] = await Promise.all([
    prisma.license.findUnique({
      where: { id },
      include: {
        encryptedData: true,
        adminAssignments: { include: { admin: true } },
        credentials: { select: { id: true, label: true, updatedAt: true } },
        histories: { orderBy: { createdAt: "desc" }, take: 10 }
      }
    }),
    getLicenseFormOptions()
  ]);
  if (!license) notFound();

  const decrypted = decryptLicense(license);
  const badge = expiryBadge(decrypted.expiryDate);
  const subtitle = [decrypted.branch, decrypted.vendor].filter(Boolean).join(" · ");

  return (
    <div className="grid gap-6">
      <PageHeader
        title={decrypted.details}
        description={subtitle || "No branch or vendor recorded"}
        actions={<StatusPill value={decrypted.status} />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Expiry" value={formatDate(decrypted.expiryDate)} hint={badge?.label} />
        <StatCard label="Renewal" value={decrypted.renewalFrequency || "—"} />
        <StatCard label="Yearly USD" value={formatMoney(decrypted.yearlyCostUsd ?? decrypted.costUsd, "USD")} />
        <StatCard label="Admins" value={decrypted.adminsDisplay || "—"} />
      </div>

      <Panel title="Edit license">
        <LicenseForm
          action="update"
          license={decrypted as unknown as Record<string, unknown>}
          adminOptions={formOptions.admins}
          lookupOptions={formOptions.lookupOptions}
        />
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="Credentials"
          actions={<KeyRound aria-hidden className="h-4 w-4 text-muted-foreground" />}
        >
          {decrypted.credentials.length === 0 ? (
            <div className="py-6">
              <EmptyState title="No credentials stored" description="Stored credentials stay encrypted at rest." />
            </div>
          ) : (
            <ul className="grid gap-2">
              {decrypted.credentials.map((credential) => (
                <li key={credential.id} className="rounded-xl border border-border px-4 py-3 text-sm">
                  <p className="font-medium">{credential.label}</p>
                  <p className="text-xs text-muted-foreground">Updated {formatDate(credential.updatedAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Notification history"
          actions={<Bell aria-hidden className="h-4 w-4 text-muted-foreground" />}
        >
          {decrypted.histories.length === 0 ? (
            <div className="py-6">
              <EmptyState title="No notifications sent" description="Messages for this license will appear here." />
            </div>
          ) : (
            <ul className="grid gap-2">
              {decrypted.histories.map((history) => (
                <li key={history.id} className="rounded-xl border border-border px-4 py-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate font-medium">{history.subject}</p>
                    <StatusPill value={history.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {history.recipient} · {formatDate(history.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
