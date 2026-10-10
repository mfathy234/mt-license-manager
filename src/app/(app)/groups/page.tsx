import { Users, X } from "lucide-react";

import { GroupActions, GroupForm } from "@/components/admin/group-form";
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

type GroupsPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function GroupsPage({ searchParams }: GroupsPageProps) {
  const session = await requirePageSession();
  const { q: rawQuery } = await searchParams;
  const canManage = can(session?.user.role, "settings:write");
  const [groups, recipients] = await Promise.all([
    prisma.emailGroup.findMany({
      include: {
        members: { include: { recipient: true } },
        _count: { select: { targets: true } },
      },
      orderBy: { name: "asc" },
    }),
    canManage
      ? prisma.emailRecipient.findMany({
          select: { id: true, name: true, email: true, active: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);
  const query = (
    Array.isArray(rawQuery) ? rawQuery[0] : (rawQuery ?? "")
  ).trim();
  const normalizedQuery = query.toLowerCase();
  const visibleGroups = normalizedQuery
    ? groups.filter((group) => {
        const memberText = group.members
          .map(({ recipient }) => `${recipient.name} ${recipient.email}`)
          .join(" ");
        return `${group.name} ${memberText}`
          .toLowerCase()
          .includes(normalizedQuery);
      })
    : groups;
  const countLabel = query
    ? `${visibleGroups.length} of ${groups.length} groups`
    : `${groups.length} ${groups.length === 1 ? "group" : "groups"}`;
  const recipientOptions = recipients.map((recipient) => ({
    value: recipient.id,
    label: `${recipient.name} · ${recipient.email}${recipient.active ? "" : " · inactive"}`,
  }));
  const emptyState = (
    <EmptyState
      icon={<Users aria-hidden className="h-5 w-5" />}
      title={query ? "No groups match this search" : "No groups yet"}
      description={
        query
          ? "Try a different group, member name, or member email."
          : canManage
            ? "Use the form above to create a group."
            : "Groups will appear here when an administrator creates them."
      }
      action={
        query ? (
          <LinkButton href="/groups" variant="secondary" size="sm">
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
        title="Groups"
        description="Reusable teams for notifying several recipients together."
      />

      <Panel bodyClassName="p-0">
        {canManage ? <GroupForm recipientOptions={recipientOptions} /> : null}
        <ManagementFeedback scope="groups" />
        <DirectoryToolbar
          action="/groups"
          ariaLabel="Search groups"
          defaultValue={query}
          placeholder="Search by group or member"
          countLabel={countLabel}
        />

        <TableScroll
          ariaLabel="Group directory"
          className="hidden rounded-none border-0 shadow-none lg:block"
          minWidthClassName="min-w-[900px]"
        >
          <caption className="sr-only">
            Notification groups with status, memberships, assignments, and
            available actions
          </caption>
          <THead>
            <tr>
              <Th>Group</Th>
              <Th>Status</Th>
              <Th>Members</Th>
              <Th>Assignments</Th>
              <Th>Added</Th>
              {canManage ? <Th align="right">Actions</Th> : null}
            </tr>
          </THead>
          <tbody>
            {visibleGroups.map((group) => {
              const memberEmails = group.members
                .map(({ recipient }) => recipient.email)
                .join(", ");
              const actionGroup = {
                id: group.id,
                name: group.name,
                active: group.active,
                recipientIds: group.members.map(
                  ({ recipientId }) => recipientId,
                ),
              };

              return (
                <Tr key={group.id}>
                  <Td className="font-medium">{group.name}</Td>
                  <Td>
                    <StatusPill value={group.active ? "active" : "inactive"} />
                  </Td>
                  <Td>
                    <p className="tabular font-medium">
                      {group.members.length}{" "}
                      {group.members.length === 1 ? "member" : "members"}
                    </p>
                    <p
                      className="mt-0.5 max-w-[34ch] truncate text-xs text-muted-foreground"
                      title={memberEmails || undefined}
                    >
                      {memberEmails || "No recipients assigned"}
                    </p>
                  </Td>
                  <Td className="tabular">
                    {group._count.targets}{" "}
                    {group._count.targets === 1 ? "license" : "licenses"}
                  </Td>
                  <Td className="tabular whitespace-nowrap">
                    {formatDate(group.createdAt)}
                  </Td>
                  {canManage ? (
                    <Td align="right">
                      <GroupActions group={actionGroup} />
                    </Td>
                  ) : null}
                </Tr>
              );
            })}
            {visibleGroups.length === 0 ? (
              <TableEmpty colSpan={canManage ? 6 : 5}>{emptyState}</TableEmpty>
            ) : null}
          </tbody>
        </TableScroll>

        <section aria-label="Group directory" className="lg:hidden">
          {visibleGroups.length > 0 ? (
            <RecordList
              ariaLabel="Groups"
              className="rounded-none border-0 shadow-none"
            >
              {visibleGroups.map((group) => {
                const actionGroup = {
                  id: group.id,
                  name: group.name,
                  active: group.active,
                  recipientIds: group.members.map(
                    ({ recipientId }) => recipientId,
                  ),
                };

                return (
                  <li key={group.id}>
                    <article className="grid gap-4">
                      <header className="flex items-start justify-between gap-3">
                        <h2 className="font-semibold">{group.name}</h2>
                        <StatusPill
                          value={group.active ? "active" : "inactive"}
                        />
                      </header>
                      <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <dt className="text-xs font-medium text-muted-foreground">
                            Members
                          </dt>
                          <dd className="tabular mt-1 font-medium">
                            {group.members.length}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-muted-foreground">
                            License assignments
                          </dt>
                          <dd className="tabular mt-1 font-medium">
                            {group._count.targets}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-muted-foreground">
                            Added
                          </dt>
                          <dd className="tabular mt-1">
                            {formatDate(group.createdAt)}
                          </dd>
                        </div>
                      </dl>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Recipient emails
                        </p>
                        <p className="mt-1 break-words text-sm">
                          {group.members.length > 0
                            ? group.members
                                .map(({ recipient }) => recipient.email)
                                .join(", ")
                            : "No recipients assigned"}
                        </p>
                      </div>
                      {canManage ? (
                        <div className="border-t border-border pt-3">
                          <GroupActions group={actionGroup} />
                        </div>
                      ) : null}
                    </article>
                  </li>
                );
              })}
            </RecordList>
          ) : (
            <div className="px-4 py-8">{emptyState}</div>
          )}
        </section>
      </Panel>
    </div>
  );
}
