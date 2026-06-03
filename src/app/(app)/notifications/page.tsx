import { Panel, StatusPill } from "@/components/ui";
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
      <div>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground">Delivery status for created, manual, and reminder emails.</p>
      </div>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="text-muted-foreground">
              <tr><th className="py-2">License</th><th>Recipient</th><th>Kind</th><th>Status</th><th>Sent</th></tr>
            </thead>
            <tbody>
              {histories.map((history) => {
                const license = decryptLicense(history.license);
                return (
                  <tr key={history.id} className="border-t border-border">
                    <td className="py-3 font-medium">{license.details}</td>
                    <td>{history.recipient}</td>
                    <td>{history.kind}</td>
                    <td><StatusPill value={history.status} /></td>
                    <td>{formatDate(history.sentAt ?? history.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
