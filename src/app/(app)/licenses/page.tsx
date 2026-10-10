import { Eye, KeyRound, Pencil, Plus, SearchX } from "lucide-react";
import Link from "next/link";

import { LicenseDeleteButton } from "@/components/license-delete-button";
import {
  LicenseResultsFooter,
  LicenseSearchToolbar,
} from "@/components/license-search-toolbar";
import {
  EmptyState,
  LinkButton,
  PageHeader,
  Panel,
  RecordList,
  StatusPill,
  TableEmpty,
  TableScroll,
  THead,
  Td,
  Th,
  Tr,
} from "@/components/ui";
import { decryptLicense } from "@/lib/license-secure";
import { getLicenseFormOptions } from "@/lib/lookups";
import { requirePageSession } from "@/lib/page-auth";
import { can } from "@/lib/permissions";
import { getRenewalState } from "@/lib/presentation";
import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "@/lib/utils";

type SearchParams = {
  q?: string;
  status?: string;
  serviceType?: string;
  branch?: string;
  adminId?: string;
  renewalFrequency?: string;
  page?: string;
  pageSize?: string;
};

type Props = { searchParams: Promise<SearchParams> };

const COLUMN_COUNT = 9;

export default async function LicensesPage({ searchParams }: Props) {
  const session = await requirePageSession();
  const params = await searchParams;
  const canWrite = can(session?.user?.role, "license:write");
  const canDelete = can(session?.user?.role, "license:delete");
  const query = params.q?.trim().toLowerCase();
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const pageSize = Math.min(
    50,
    Math.max(10, Number(params.pageSize ?? 10) || 10),
  );

  const [licenseRows, formOptions] = await Promise.all([
    prisma.license.findMany({
      orderBy: [{ expiryDate: "asc" }, { createdAt: "asc" }],
      include: {
        encryptedData: true,
        adminAssignments: { include: { admin: true } },
      },
    }),
    getLicenseFormOptions(),
  ]);

  // Status, service, branch and renewal frequency live inside the encrypted
  // payload, so every filter has to run after decryption rather than in SQL.
  const licenses = licenseRows.map(decryptLicense);
  const filtered = licenses.filter((license) => {
    const matchesQuery =
      !query ||
      [
        license.details,
        license.vendor,
        license.branch,
        license.serviceType,
        license.adminsDisplay,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query));
    const matchesStatus = !params.status || license.status === params.status;
    const matchesService =
      !params.serviceType || license.serviceType === params.serviceType;
    const matchesBranch = !params.branch || license.branch === params.branch;
    const matchesAdmin =
      !params.adminId || license.adminIds.includes(params.adminId);
    const matchesRenewal =
      !params.renewalFrequency ||
      license.renewalFrequency === params.renewalFrequency;
    return (
      matchesQuery &&
      matchesStatus &&
      matchesService &&
      matchesBranch &&
      matchesAdmin &&
      matchesRenewal
    );
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const rangeStart =
    filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filtered.length);
  const hasFilters = Boolean(
    query ||
    params.status ||
    params.serviceType ||
    params.branch ||
    params.adminId ||
    params.renewalFrequency,
  );
  const now = new Date();
  const displayed = paged.map((license) => ({
    license,
    renewal: getRenewalState(license.expiryDate, now),
    owner: license.ownerAccount || license.adminsDisplay || "No owner assigned",
  }));

  const emptyState = hasFilters ? (
    <EmptyState
      icon={<SearchX aria-hidden className="h-4 w-4" />}
      title="No licenses match these filters"
      description="Remove a filter or reset to see every license."
      action={
        <LinkButton href="/licenses" variant="secondary" size="sm">
          Reset filters
        </LinkButton>
      }
    />
  ) : (
    <EmptyState
      icon={<KeyRound aria-hidden className="h-4 w-4" />}
      title="No licenses yet"
      description={
        canWrite
          ? "Add one with New license, or bring existing records in from a workbook."
          : "License records will appear here when your team adds them."
      }
      action={
        canWrite ? (
          <LinkButton href="/licenses/import" variant="secondary" size="sm">
            Import a workbook
          </LinkButton>
        ) : undefined
      }
    />
  );

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Licenses"
        description="Subscriptions, ownership, costs, and renewals."
        actions={
          canWrite ? (
            <LinkButton href="/licenses/new">
              <Plus aria-hidden className="h-4 w-4" />
              New license
            </LinkButton>
          ) : undefined
        }
      />

      <Panel bodyClassName="p-0">
        <LicenseSearchToolbar
          lookupOptions={formOptions.lookupOptions}
          adminOptions={formOptions.admins}
        />

        <TableScroll
          ariaLabel="License results"
          className="hidden max-h-[min(70vh,48rem)] rounded-none border-0 shadow-none lg:block"
          minWidthClassName="min-w-[1040px]"
        >
          <caption className="sr-only">
            Licenses with status, ownership, renewal, cost, and available
            actions
          </caption>
          <THead>
            <tr>
              <Th className="w-[24%]">License</Th>
              <Th>Status</Th>
              <Th>Service</Th>
              <Th>Branch</Th>
              <Th>Owner</Th>
              <Th>Billing</Th>
              <Th>Renewal</Th>
              <Th align="right">Yearly USD</Th>
              <Th align="right">
                <span className="sr-only">Actions</span>
              </Th>
            </tr>
          </THead>
          <tbody>
            {displayed.map(({ license, renewal, owner }) => (
              <Tr key={license.id}>
                <Td>
                  <Link
                    href={`/licenses/${license.id}`}
                    className="focus-ring rounded font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {license.details}
                  </Link>
                  {license.vendor ? (
                    <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                      {license.vendor}
                    </p>
                  ) : null}
                </Td>
                <Td>
                  <StatusPill value={license.status} />
                </Td>
                <Td>{license.serviceType || "—"}</Td>
                <Td>{license.branch || "—"}</Td>
                <Td
                  className="max-w-[18ch] truncate"
                  title={owner === "No owner assigned" ? undefined : owner}
                >
                  {owner}
                </Td>
                <Td>{license.renewalFrequency || "—"}</Td>
                <Td>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="tabular whitespace-nowrap">
                      {formatDate(license.expiryDate)}
                    </span>
                    <StatusPill value={renewal.label} tone={renewal.tone} />
                  </div>
                </Td>
                <Td align="right" className="tabular whitespace-nowrap">
                  {formatMoney(license.yearlyCostUsd, "USD")}
                </Td>
                <Td align="right">
                  <div className="flex items-center justify-end gap-1">
                    <LinkButton
                      href={`/licenses/${license.id}`}
                      variant="ghost"
                      size="sm"
                    >
                      {canWrite ? (
                        <Pencil aria-hidden className="h-3.5 w-3.5" />
                      ) : (
                        <Eye aria-hidden className="h-3.5 w-3.5" />
                      )}
                      {canWrite ? "Edit" : "View"}
                    </LinkButton>
                    {canDelete ? (
                      <LicenseDeleteButton
                        licenseId={license.id}
                        licenseName={license.details}
                        size="sm"
                        iconOnly
                      />
                    ) : null}
                  </div>
                </Td>
              </Tr>
            ))}
            {displayed.length === 0 ? (
              <TableEmpty colSpan={COLUMN_COUNT}>{emptyState}</TableEmpty>
            ) : null}
          </tbody>
        </TableScroll>

        <section aria-label="License results" className="lg:hidden">
          {displayed.length > 0 ? (
            <RecordList className="rounded-none border-0 shadow-none">
              {displayed.map(({ license, renewal, owner }) => (
                <li key={license.id}>
                  <article
                    aria-labelledby={`license-${license.id}-title`}
                    className="grid gap-3"
                  >
                    <header className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          id={`license-${license.id}-title`}
                          href={`/licenses/${license.id}`}
                          className="focus-ring rounded font-medium hover:text-primary hover:underline"
                        >
                          {license.details}
                        </Link>
                        <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                          {[license.vendor, license.serviceType]
                            .filter(Boolean)
                            .join(" · ") || "No vendor or service recorded"}
                        </p>
                      </div>
                      <StatusPill value={license.status} />
                    </header>

                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">
                          Renewal
                        </dt>
                        <dd className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="tabular">
                            {formatDate(license.expiryDate)}
                          </span>
                          <StatusPill
                            value={renewal.label}
                            tone={renewal.tone}
                          />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">
                          Owner
                        </dt>
                        <dd className="mt-0.5 break-words">{owner}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">
                          Billing
                        </dt>
                        <dd className="mt-0.5">
                          {license.renewalFrequency || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">
                          Yearly cost
                        </dt>
                        <dd className="tabular mt-0.5">
                          {formatMoney(license.yearlyCostUsd, "USD")}
                        </dd>
                      </div>
                    </dl>

                    <div className="flex items-center gap-2">
                      <LinkButton
                        href={`/licenses/${license.id}`}
                        variant="secondary"
                        className="flex-1"
                      >
                        {canWrite ? (
                          <Pencil aria-hidden className="h-4 w-4" />
                        ) : (
                          <Eye aria-hidden className="h-4 w-4" />
                        )}
                        {canWrite ? "Edit license" : "View license"}
                      </LinkButton>
                      {canDelete ? (
                        <LicenseDeleteButton
                          licenseId={license.id}
                          licenseName={license.details}
                          iconOnly
                        />
                      ) : null}
                    </div>
                  </article>
                </li>
              ))}
            </RecordList>
          ) : (
            <div className="px-4 py-6">{emptyState}</div>
          )}
        </section>

        <LicenseResultsFooter
          page={currentPage}
          pageCount={pageCount}
          total={filtered.length}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
        />
      </Panel>
    </div>
  );
}
