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
  Tr,
} from "@/components/ui";
import { decryptLicense } from "@/lib/license-secure";
import { requirePageSession } from "@/lib/page-auth";
import {
  notificationKindLabel,
  notificationTone,
} from "@/lib/presentation";
import { prisma } from "@/lib/prisma";

const notificationTime = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function NotificationsPage() {
  await requirePageSession();
  const histories = await prisma.notificationHistory.findMany({
    include: {
      license: {
        include: {
          encryptedData: true,
          adminAssignments: { include: { admin: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Notifications"
        description="Delivery status for created, manual, and reminder emails."
      />
      <Panel
        title="Delivery history"
        description="Latest 100 attempts, newest first."
        bodyClassName="p-0"
      >
        <TableScroll
          ariaLabel="Notification delivery history"
          minWidthClassName="min-w-[860px]"
          className="rounded-none border-0 shadow-none"
        >
          <THead>
            <tr>
              <Th>Type</Th>
              <Th>License</Th>
              <Th>Recipient</Th>
              <Th>Outcome</Th>
              <Th>Time</Th>
            </tr>
          </THead>
          <tbody>
            {histories.map((history) => {
              const license = decryptLicense(history.license);
              const tone = notificationTone(history.status);
              const timestamp = history.sentAt ?? history.createdAt;

              return (
                <Tr key={history.id}>
                  <Td>
                    <span className="font-medium">
                      {notificationKindLabel(history.kind)}
                    </span>
                  </Td>
                  <Td className="max-w-80">
                    <p className="truncate font-medium">{license.details}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {history.subject}
                    </p>
                  </Td>
                  <Td className="max-w-64">
                    <span className="block truncate" title={history.recipient}>
                      {history.recipient}
                    </span>
                  </Td>
                  <Td>
                    <StatusPill value={history.status} tone={tone} />
                  </Td>
                  <Td className="tabular whitespace-nowrap">
                    <time dateTime={timestamp.toISOString()}>
                      {notificationTime.format(timestamp)}
                    </time>
                  </Td>
                </Tr>
              );
            })}
            {histories.length === 0 ? (
              <TableEmpty colSpan={5}>
                <EmptyState
                  icon={<BellOff aria-hidden className="h-4 w-4" />}
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
