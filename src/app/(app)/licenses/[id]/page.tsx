import { Bell, KeyRound } from "lucide-react";
import { notFound } from "next/navigation";

import { LicenseForm } from "@/components/license-form";
import { Panel, StatusPill } from "@/components/ui";
import { decryptLicense } from "@/lib/license-secure";
import { getLicenseFormOptions } from "@/lib/lookups";
import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "@/lib/utils";

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

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold">{decrypted.details}</h1>
          <p className="text-sm text-muted-foreground">
            {decrypted.branch || "No branch"} - {decrypted.vendor || "No vendor"}
          </p>
        </div>
        <StatusPill value={decrypted.status} />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Panel>
          <p className="text-sm text-muted-foreground">Expiry</p>
          <p className="mt-1 font-semibold">{formatDate(decrypted.expiryDate)}</p>
        </Panel>
        <Panel>
          <p className="text-sm text-muted-foreground">Service</p>
          <p className="mt-1 font-semibold">{decrypted.serviceType || "-"}</p>
        </Panel>
        <Panel>
          <p className="text-sm text-muted-foreground">Yearly USD</p>
          <p className="mt-1 font-semibold">{formatMoney(decrypted.yearlyCostUsd ?? decrypted.costUsd, "USD")}</p>
        </Panel>
        <Panel>
          <p className="text-sm text-muted-foreground">Admins</p>
          <p className="mt-1 truncate font-semibold">{decrypted.adminsDisplay || "-"}</p>
        </Panel>
      </div>
      <Panel>
        <h2 className="mb-4 font-semibold">Edit license</h2>
        <LicenseForm
          action="update"
          license={decrypted as unknown as Record<string, unknown>}
          adminOptions={formOptions.admins}
          lookupOptions={formOptions.lookupOptions}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <div className="mb-4 flex items-center gap-2">
            <KeyRound aria-hidden className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Credentials</h2>
          </div>
          <div className="grid gap-2">
            {decrypted.credentials.map((credential) => (
              <div key={credential.id} className="rounded-md border border-border px-3 py-2 text-sm">
                <p className="font-medium">{credential.label}</p>
                <p className="text-xs text-muted-foreground">Updated {formatDate(credential.updatedAt)}</p>
              </div>
            ))}
            {decrypted.credentials.length === 0 ? <p className="text-sm text-muted-foreground">No credentials stored.</p> : null}
          </div>
        </Panel>
        <Panel>
          <div className="mb-4 flex items-center gap-2">
            <Bell aria-hidden className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Notification history</h2>
          </div>
          <div className="grid gap-2">
            {decrypted.histories.map((history) => (
              <div key={history.id} className="rounded-md border border-border px-3 py-2 text-sm">
                <p className="font-medium">{history.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {history.recipient} - {history.status} - {formatDate(history.createdAt)}
                </p>
              </div>
            ))}
            {decrypted.histories.length === 0 ? <p className="text-sm text-muted-foreground">No notifications sent.</p> : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}
