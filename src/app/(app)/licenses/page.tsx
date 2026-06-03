import Link from "next/link";
import { Plus } from "lucide-react";

import { LinkButton, Panel, StatusPill } from "@/components/ui";
import { decryptLicense } from "@/lib/license-secure";
import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "@/lib/utils";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function LicensesPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q?.trim();
  const licenseRows = await prisma.license.findMany({
    orderBy: [{ expiryDate: "asc" }, { createdAt: "asc" }],
    include: { encryptedData: true, adminAssignments: { include: { admin: true } } }
  });
  const licenses = licenseRows.map(decryptLicense);
  const filtered = query
    ? licenses.filter((license) =>
        [license.details, license.vendor, license.branch, license.serviceType, license.adminsDisplay]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(query.toLowerCase()))
      )
    : licenses;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold">Licenses</h1>
          <p className="text-sm text-muted-foreground">Search and manage subscription ownership, costs, and renewals.</p>
        </div>
        <LinkButton href="/licenses/new">
          <Plus aria-hidden className="h-4 w-4" />
          New license
        </LinkButton>
      </div>
      <Panel>
        <form className="mb-4">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search licenses"
            className="focus-ring h-10 w-full max-w-md rounded-md border border-border bg-elevated px-3 text-sm placeholder:text-muted-foreground"
          />
        </form>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-2">Details</th>
                <th>Status</th>
                <th>Service</th>
                <th>Branch</th>
                <th>Vendor</th>
                <th>Admins</th>
                <th>Expiry</th>
                <th>Monthly USD</th>
                <th>Yearly USD</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((license) => (
                <tr key={license.id} className="border-t border-border">
                  <td className="py-3 font-medium">
                    <Link href={`/licenses/${license.id}`} className="text-primary hover:underline">
                      {license.details}
                    </Link>
                  </td>
                  <td><StatusPill value={license.status} /></td>
                  <td>{license.serviceType || "-"}</td>
                  <td>{license.branch || "-"}</td>
                  <td>{license.vendor || "-"}</td>
                  <td>{license.adminsDisplay || "-"}</td>
                  <td>{formatDate(license.expiryDate)}</td>
                  <td>{formatMoney(license.monthlyCostUsd ?? license.costUsd, "USD")}</td>
                  <td>{formatMoney(license.yearlyCostUsd, "USD")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
