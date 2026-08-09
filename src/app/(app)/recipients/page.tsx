import { Mail } from "lucide-react";

import { RecipientForm } from "@/components/admin/recipient-form";
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
import { prisma } from "@/lib/prisma";

export default async function RecipientsPage() {
  const recipients = await prisma.emailRecipient.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="grid gap-6">
      <PageHeader title="Recipients" description="People who can receive license notifications." />
      <Panel title="Add a recipient">
        <RecipientForm />
      </Panel>
      <Panel title={`${recipients.length} ${recipients.length === 1 ? "recipient" : "recipients"}`} bodyClassName="p-5 pt-3">
        <TableScroll minWidthClassName="min-w-[520px]">
          <THead>
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Status</Th>
            </tr>
          </THead>
          <tbody>
            {recipients.map((recipient) => (
              <Tr key={recipient.id}>
                <Td className="font-medium">{recipient.name}</Td>
                <Td>{recipient.email}</Td>
                <Td>
                  <StatusPill value={recipient.active ? "active" : "inactive"} />
                </Td>
              </Tr>
            ))}
            {recipients.length === 0 ? (
              <TableEmpty colSpan={3}>
                <EmptyState
                  icon={<Mail aria-hidden className="h-5 w-5" />}
                  title="No recipients yet"
                  description="Add someone above so renewal reminders have somewhere to go."
                />
              </TableEmpty>
            ) : null}
          </tbody>
        </TableScroll>
      </Panel>
    </div>
  );
}
