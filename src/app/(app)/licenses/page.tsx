import Link from "next/link";
import { Eye, KeyRound, Plus, SearchX } from "lucide-react";
import { getServerSession } from "next-auth";

import { LicenseDeleteButton } from "@/components/license-delete-button";
import { LicenseSearchToolbar } from "@/components/license-search-toolbar";
import {
  EmptyState,
  LinkButton,
  PageHeader,
  Panel,
  StatusPill,
  TableEmpty,
  TableScroll,
  THead,
  Td,
  Th,
  Tr
} from "@/components/ui";
import { authOptions } from "@/lib/auth";
import { decryptLicense } from "@/lib/license-secure";
import { getLicenseFormOptions } from "@/lib/lookups";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { expiryBadge, formatDate, formatMoney } from "@/lib/utils";

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

const COLUMN_COUNT = 10;

export default async function LicensesPage({ searchParams }: Props) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const canDelete = can(session?.user?.role, "license:delete");
  const query = params.q?.trim().toLowerCase();
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(10, Number(params.pageSize ?? 10) || 10));

  const [licenseRows, formOptions] = await Promise.all([
    prisma.license.findMany({
      orderBy: [{ expiryDate: "asc" }, { createdAt: "asc" }],
      include: { encryptedData: true, adminAssignments: { include: { admin: true } } }
    }),
    getLicenseFormOptions()
  ]);

  // Status, service, branch and renewal frequency live inside the encrypted
  // payload, so every filter has to run after decryption rather than in SQL.
  const licenses = licenseRows.map(decryptLicense);
  const filtered = licenses.filter((license) => {
    const matchesQuery =
      !query ||
      [license.details, license.vendor, license.branch, license.serviceType, license.adminsDisplay]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query));
    const matchesStatus = !params.status || license.status === params.status;
    const matchesService = !params.serviceType || license.serviceType === params.serviceType;
    const matchesBranch = !params.branch || license.branch === params.branch;
    const matchesAdmin = !params.adminId || license.adminIds.includes(params.adminId);
    const matchesRenewal = !params.renewalFrequency || license.renewalFrequency === params.renewalFrequency;
    return matchesQuery && matchesStatus && matchesService && matchesBranch && matchesAdmin && matchesRenewal;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filtered.length);
  const hasFilters = Boolean(
    query || params.status || params.serviceType || params.branch || params.adminId || params.renewalFrequency
  );

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Licenses"
        description="Search and manage subscription ownership, costs, and renewals."
        actions={
          <LinkButton href="/licenses/new">
            <Plus aria-hidden className="h-4 w-4" />
            New license
          </LinkButton>
        }
      />
      <Panel>
        <LicenseSearchToolbar
          lookupOptions={formOptions.lookupOptions}
          adminOptions={formOptions.admins}
          page={currentPage}
          pageCount={pageCount}
          total={filtered.length}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
        />
      </Panel>
      <Panel bodyClassName="p-5 pt-3">
        <TableScroll minWidthClassName="min-w-[1180px]">
          <THead>
            <tr>
              <Th>Details</Th>
              <Th>Status</Th>
              <Th>Service</Th>
              <Th>Branch</Th>
              <Th>Vendor</Th>
              <Th>Admins</Th>
              <Th>Renewal</Th>
              <Th>Expiry</Th>
              <Th align="right">Yearly USD</Th>
              <Th align="right">Actions</Th>
            </tr>
          </THead>
          <tbody>
            {paged.map((license) => {
              const badge = expiryBadge(license.expiryDate);
              return (
                <Tr key={license.id}>
                  <Td className="font-medium">
                    <Link href={`/licenses/${license.id}`} className="focus-ring rounded text-primary hover:underline">
                      {license.details}
                    </Link>
                  </Td>
                  <Td>
                    <StatusPill value={license.status} />
                  </Td>
                  <Td>{license.serviceType || "—"}</Td>
                  <Td>{license.branch || "—"}</Td>
                  <Td>{license.vendor || "—"}</Td>
                  <Td className="max-w-[18ch] truncate" title={license.adminsDisplay || undefined}>
                    {license.adminsDisplay || "—"}
                  </Td>
                  <Td>{license.renewalFrequency || "—"}</Td>
                  <Td>
                    <span className="tabular block">{formatDate(license.expiryDate)}</span>
                    {badge ? (
                      <span className={badge.tone === "danger" ? "text-xs text-danger" : "text-xs text-warning"}>
                        {badge.label}
                      </span>
                    ) : null}
                  </Td>
                  <Td align="right" className="tabular">
                    {formatMoney(license.yearlyCostUsd, "USD")}
                  </Td>
                  <Td align="right">
                    <div className="flex items-center justify-end gap-2">
                      <LinkButton href={`/licenses/${license.id}`} variant="secondary" size="sm">
                        <Eye aria-hidden className="h-4 w-4" />
                        View
                      </LinkButton>
                      {canDelete ? (
                        <LicenseDeleteButton licenseId={license.id} licenseName={license.details} size="sm" iconOnly />
                      ) : null}
                    </div>
                  </Td>
                </Tr>
              );
            })}
            {paged.length === 0 ? (
              <TableEmpty colSpan={COLUMN_COUNT}>
                {hasFilters ? (
                  <EmptyState
                    icon={<SearchX aria-hidden className="h-5 w-5" />}
                    title="No licenses match these filters"
                    description="Try removing a filter chip above, or clear them all to see every license."
                  />
                ) : (
                  <EmptyState
                    icon={<KeyRound aria-hidden className="h-5 w-5" />}
                    title="No licenses yet"
                    description="Add your first license, or import the workbook to bring existing records in."
                    action={
                      <LinkButton href="/licenses/new" size="sm">
                        <Plus aria-hidden className="h-4 w-4" />
                        New license
                      </LinkButton>
                    }
                  />
                )}
              </TableEmpty>
            ) : null}
          </tbody>
        </TableScroll>
      </Panel>
    </div>
  );
}
