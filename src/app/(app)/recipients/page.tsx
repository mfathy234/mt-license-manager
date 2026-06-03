import { RecipientForm } from "@/components/admin-forms";
import { Panel, StatusPill } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function RecipientsPage() {
  const recipients = await prisma.emailRecipient.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Recipients</h1>
        <p className="text-sm text-muted-foreground">People who can receive license notifications.</p>
      </div>
      <Panel><RecipientForm /></Panel>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr><th className="py-2">Name</th><th>Email</th><th>Status</th></tr>
            </thead>
            <tbody>
              {recipients.map((recipient) => (
                <tr key={recipient.id} className="border-t border-border">
                  <td className="py-3 font-medium">{recipient.name}</td>
                  <td>{recipient.email}</td>
                  <td><StatusPill value={recipient.active ? "active" : "inactive"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
