import { BellOff } from "lucide-react";

import {
  EmptyState,
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
import { decryptLicense } from "@/lib/license-secure";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function NotificationsPage() {
  const histories = await prisma.notificationHistory.findMany({
    include: { license: { include: { encryptedData: true, adminAssignments: { include: { admin: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Notifications"
        description="Delivery status for created, manual, and reminder emails."
      />
      <Panel title="Latest 100 messages" bodyClassName="p-5 pt-3">
        <TableScroll minWidthClassName="min-w-[800px]">
          <THead>
            <tr>
              <Th>License</Th>
              <Th>Recipient</Th>
              <Th>Kind</Th>
              <Th>Status</Th>
              <Th>Sent</Th>
            </tr>
          </THead>
          <tbody>
            {histories.map((history) => {
              const license = decryptLicense(history.license);
              return (
                <Tr key={history.id}>
                  <Td className="font-medium">{license.details}</Td>
                  <Td>{history.recipient}</Td>
                  <Td className="capitalize">{history.kind.replace(/_/g, " ")}</Td>
                  <Td>
                    <StatusPill value={history.status} />
                  </Td>
                  <Td className="tabular">{formatDate(history.sentAt ?? history.createdAt)}</Td>
                </Tr>
              );
            })}
            {histories.length === 0 ? (
              <TableEmpty colSpan={5}>
                <EmptyState
                  icon={<BellOff aria-hidden className="h-5 w-5" />}
                  title="No notifications sent yet"
                  description="Messages appear here once a license is created or a renewal reminder fires."
                />
              </TableEmpty>
            ) : null}
          </tbody>
        </TableScroll>
      </Panel>
    </div>
  );
}
