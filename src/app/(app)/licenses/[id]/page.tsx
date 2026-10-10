import { Bell, LockKeyhole } from "lucide-react";
import { notFound } from "next/navigation";

import { LicenseDeleteButton } from "@/components/license-delete-button";
import { LicenseForm } from "@/components/license-form";
import { EmptyState, PageHeader, Panel, StatusPill } from "@/components/ui";
import { decryptLicense, toLicenseFormValues } from "@/lib/license-secure";
import { getLicenseFormOptions } from "@/lib/lookups";
import { requirePageSession } from "@/lib/page-auth";
import { can } from "@/lib/permissions";
import { licenseSummaryItems, notificationKindLabel } from "@/lib/presentation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export default async function LicenseDetailPage({ params }: Props) {
  const session = await requirePageSession();
  const { id } = await params;
  const [license, formOptions] = await Promise.all([
    prisma.license.findUnique({
      where: { id },
      include: {
        encryptedData: true,
        adminAssignments: { include: { admin: true } },
        credentials: { select: { id: true, label: true, updatedAt: true } },
        histories: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    }),
    getLicenseFormOptions(),
  ]);
  if (!license) notFound();

  const decrypted = decryptLicense(license);
  const subtitle = [decrypted.serviceType, decrypted.branch, decrypted.vendor]
    .filter(Boolean)
    .join(" · ");
  const summaryItems = licenseSummaryItems({
    status: decrypted.status,
    expiryDate: decrypted.expiryDate,
    adminsDisplay: decrypted.adminsDisplay,
    annualCost: (decrypted.yearlyCostUsd ?? decrypted.costUsd)?.toString(),
  });

  return (
    <div className="grid gap-4">
      <PageHeader
        title={decrypted.details}
        description={subtitle || "No service, branch, or vendor recorded"}
        actions={
          can(session?.user?.role, "license:delete") ? (
            <LicenseDeleteButton
              licenseId={decrypted.id}
              licenseName={decrypted.details}
              redirectTo="/licenses"
            />
          ) : null
        }
      />

      <Panel bodyClassName="p-0">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 lg:grid-cols-4">
          {summaryItems.map((item) => (
            <div key={item.label} className="min-w-0">
              <dt className="text-xs font-medium text-foreground-muted">
                {item.label}
              </dt>
              <dd className="mt-1 min-w-0 text-sm font-medium">
                {item.label === "Status" || item.label === "Renewal" ? (
                  <StatusPill value={item.value} tone={item.tone} />
                ) : (
                  <span className="tabular block truncate" title={item.value}>
                    {item.value}
                  </span>
                )}
              </dd>
            </div>
          ))}
          <SummaryDetail label="Owner account" value={decrypted.ownerAccount} />
          <SummaryDetail
            label="Start date"
            value={formatDate(decrypted.startDate)}
            tabular
          />
          <SummaryDetail
            label="Expiry date"
            value={formatDate(decrypted.expiryDate)}
            tabular
          />
          <SummaryDetail
            label="Licensed users"
            value={decrypted.usersCount?.toString()}
            tabular
          />
        </dl>
      </Panel>

      <Panel title="Edit license" bodyClassName="p-0">
        <LicenseForm
          action="update"
          license={toLicenseFormValues(
            decrypted as unknown as Record<string, unknown>,
          )}
          adminOptions={formOptions.admins}
          lookupOptions={formOptions.lookupOptions}
        />
      </Panel>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Panel
          title="Credentials"
          description="Values stay masked; only metadata is shown."
          bodyClassName="p-0"
        >
          {decrypted.credentials.length === 0 ? (
            <div className="px-4 py-6">
              <EmptyState
                icon={<LockKeyhole aria-hidden className="h-4 w-4" />}
                title="No credentials stored"
                description="Stored credentials stay encrypted at rest."
              />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {decrypted.credentials.map((credential) => (
                <li
                  key={credential.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <LockKeyhole
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-medium"
                      title={credential.label}
                    >
                      {credential.label}
                    </p>
                    <p className="font-mono text-sm tracking-[0.18em] text-muted-foreground">
                      <span aria-hidden>••••••••••</span>
                      <span className="sr-only">Credential value masked</span>
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    Updated {formatDate(credential.updatedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Notification history"
          description="Most recent first."
          bodyClassName="p-0"
        >
          {decrypted.histories.length === 0 ? (
            <div className="px-4 py-6">
              <EmptyState
                icon={<Bell aria-hidden className="h-4 w-4" />}
                title="No notifications sent"
                description="Messages for this license will appear here."
              />
            </div>
          ) : (
            <ol className="divide-y divide-border">
              {decrypted.histories.map((history) => {
                const timestamp = history.sentAt ?? history.createdAt;

                return (
                  <li key={history.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 text-sm font-medium">
                        {history.subject}
                      </p>
                      <StatusPill value={history.status} />
                    </div>
                    <dl className="mt-2 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                      <HistoryDetail
                        label="Kind"
                        value={notificationKindLabel(history.kind)}
                      />
                      <HistoryDetail
                        label="Recipient"
                        value={history.recipient}
                      />
                      <div className="min-w-0">
                        <dt className="text-xs font-medium text-muted-foreground">
                          Timestamp
                        </dt>
                        <dd className="tabular mt-0.5 text-sm">
                          <time dateTime={timestamp.toISOString()}>
                            {new Intl.DateTimeFormat("en", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(timestamp)}
                          </time>
                        </dd>
                      </div>
                    </dl>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>
      </div>
    </div>
  );
}

function SummaryDetail({
  label,
  value,
  tabular = false,
}: {
  label: string;
  value?: string | null;
  tabular?: boolean;
}) {
  const display = value || "Not set";

  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-foreground-muted">{label}</dt>
      <dd
        className={`mt-1 truncate text-sm font-medium ${tabular ? "tabular" : ""}`}
        title={display}
      >
        {display}
      </dd>
    </div>
  );
}

function HistoryDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-foreground-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm">{value}</dd>
    </div>
  );
}
