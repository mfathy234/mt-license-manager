import { Mail, X } from "lucide-react";

import {
  RecipientActions,
  RecipientForm,
} from "@/components/admin/recipient-form";
import { DirectoryToolbar } from "@/components/admin/directory-toolbar";
import { ManagementFeedback } from "@/components/admin/management-feedback";
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
import { requirePageSession } from "@/lib/page-auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type RecipientsPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function RecipientsPage({
  searchParams,
}: RecipientsPageProps) {
  const session = await requirePageSession();
  const [{ q: rawQuery }, recipients] = await Promise.all([
    searchParams,
    prisma.emailRecipient.findMany({
      include: { _count: { select: { groups: true, targets: true } } },
      orderBy: { name: "asc" },
    }),
  ]);
  const query = (
    Array.isArray(rawQuery) ? rawQuery[0] : (rawQuery ?? "")
  ).trim();
  const normalizedQuery = query.toLowerCase();
  const canManage = can(session?.user.role, "settings:write");
  const visibleRecipients = normalizedQuery
    ? recipients.filter((recipient) =>
        `${recipient.name} ${recipient.email}`
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : recipients;
  const countLabel = query
    ? `${visibleRecipients.length} of ${recipients.length} recipients`
    : `${recipients.length} ${recipients.length === 1 ? "recipient" : "recipients"}`;
  const emptyState = (
    <EmptyState
      icon={<Mail aria-hidden className="h-5 w-5" />}
      title={query ? "No recipients match this search" : "No recipients yet"}
      description={
        query
          ? "Try a different name or email address."
          : canManage
            ? "Use the form above to add a contact."
            : "Recipients will appear here when an administrator adds them."
      }
      action={
        query ? (
          <LinkButton href="/recipients" variant="secondary" size="sm">
            <X aria-hidden className="h-4 w-4" />
            Clear search
          </LinkButton>
        ) : undefined
      }
    />
  );

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Recipients"
        description="Notification contacts for license alerts and group membership."
      />

      <Panel bodyClassName="p-0">
        {canManage ? <RecipientForm /> : null}
        <ManagementFeedback scope="recipients" />
        <DirectoryToolbar
          action="/recipients"
          ariaLabel="Search recipients"
          defaultValue={query}
          placeholder="Search by name or email"
          countLabel={countLabel}
        />

        <TableScroll
          ariaLabel="Recipient directory"
          className="hidden rounded-none border-0 shadow-none lg:block"
          minWidthClassName="min-w-[760px]"
        >
          <caption className="sr-only">
            Notification recipients with status, relationships, and available
            actions
          </caption>
          <THead>
            <tr>
              <Th>Recipient</Th>
              <Th>Status</Th>
              <Th>Relationships</Th>
              <Th>Added</Th>
              {canManage ? <Th align="right">Actions</Th> : null}
            </tr>
          </THead>
          <tbody>
            {visibleRecipients.map((recipient) => (
              <Tr key={recipient.id}>
                <Td>
                  <p className="font-medium">{recipient.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {recipient.email}
                  </p>
                </Td>
                <Td>
                  <StatusPill
                    value={recipient.active ? "active" : "inactive"}
                  />
                </Td>
                <Td>
                  <p className="tabular">
                    {recipient._count.groups}{" "}
                    {recipient._count.groups === 1 ? "group" : "groups"}
                  </p>
                  <p className="tabular mt-0.5 text-xs text-muted-foreground">
                    {recipient._count.targets}{" "}
                    {recipient._count.targets === 1
                      ? "license assignment"
                      : "license assignments"}
                  </p>
                </Td>
                <Td className="tabular whitespace-nowrap">
                  {formatDate(recipient.createdAt)}
                </Td>
                {canManage ? (
                  <Td align="right">
                    <RecipientActions recipient={recipient} />
                  </Td>
                ) : null}
              </Tr>
            ))}
            {visibleRecipients.length === 0 ? (
              <TableEmpty colSpan={canManage ? 5 : 4}>{emptyState}</TableEmpty>
            ) : null}
          </tbody>
        </TableScroll>

        <section aria-label="Recipient directory" className="lg:hidden">
          {visibleRecipients.length > 0 ? (
            <RecordList
              ariaLabel="Recipients"
              className="rounded-none border-0 shadow-none"
            >
              {visibleRecipients.map((recipient) => (
                <li key={recipient.id}>
                  <article className="grid gap-4">
                    <header className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold">
                          {recipient.name}
                        </h2>
                        <p className="mt-1 break-all text-sm text-muted-foreground">
                          {recipient.email}
                        </p>
                      </div>
                      <StatusPill
                        value={recipient.active ? "active" : "inactive"}
                      />
                    </header>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">
                          Group memberships
                        </dt>
                        <dd className="tabular mt-1 font-medium">
                          {recipient._count.groups}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">
                          License assignments
                        </dt>
                        <dd className="tabular mt-1 font-medium">
                          {recipient._count.targets}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">
                          Added
                        </dt>
                        <dd className="tabular mt-1">
                          {formatDate(recipient.createdAt)}
                        </dd>
                      </div>
                    </dl>
                    {canManage ? (
                      <div className="border-t border-border pt-3">
                        <RecipientActions recipient={recipient} />
                      </div>
                    ) : null}
                  </article>
                </li>
              ))}
            </RecordList>
          ) : (
            <div className="px-4 py-8">{emptyState}</div>
          )}
        </section>
      </Panel>
    </div>
  );
}
