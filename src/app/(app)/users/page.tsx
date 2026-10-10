import { LockKeyhole, Users as UsersIcon, X } from "lucide-react";

import { DirectoryToolbar } from "@/components/admin/directory-toolbar";
import {
  UserAccessActions,
  UserInviteForm,
} from "@/components/admin/user-invite-form";
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

type UsersPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const session = await requirePageSession();
  const { q: rawQuery } = await searchParams;
  const canManage = can(session?.user.role, "users:write");

  if (!canManage) {
    return (
      <div className="grid gap-4">
        <PageHeader
          title="Users"
          description="Manage application access for admins, editors, and viewers."
        />
        <Panel>
          <div className="py-8">
            <EmptyState
              icon={<LockKeyhole aria-hidden className="h-5 w-5" />}
              title="Admin access required"
              description="Only administrators can view or change user access."
            />
          </div>
        </Panel>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { email: "asc" },
  });
  const query = (
    Array.isArray(rawQuery) ? rawQuery[0] : (rawQuery ?? "")
  ).trim();
  const normalizedQuery = query.toLowerCase();
  const visibleUsers = normalizedQuery
    ? users.filter((user) =>
        `${user.name ?? ""} ${user.email} ${user.role} ${user.status}`
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : users;
  const countLabel = query
    ? `${visibleUsers.length} of ${users.length} users`
    : `${users.length} ${users.length === 1 ? "user" : "users"}`;
  const emptyState = (
    <EmptyState
      icon={<UsersIcon aria-hidden className="h-5 w-5" />}
      title={query ? "No users match this search" : "No users yet"}
      description={
        query
          ? "Try a different name, email, role, or status."
          : "Use the form above to create the first account."
      }
      action={
        query ? (
          <LinkButton href="/users" variant="secondary" size="sm">
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
        title="Users"
        description="Application access for admins, editors, and viewers."
      />

      <Panel bodyClassName="p-0">
        {<UserInviteForm />}

        <DirectoryToolbar
          action="/users"
          ariaLabel="Search users"
          defaultValue={query}
          placeholder="Search by user, role, or status"
          countLabel={countLabel}
        />

        <TableScroll
          ariaLabel="User directory"
          className="hidden rounded-none border-0 shadow-none lg:block"
          minWidthClassName="min-w-[780px]"
        >
          <caption className="sr-only">
            Users with role, status, creation date, and access-management
            actions
          </caption>
          <THead>
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Created</Th>
              <Th align="right">Actions</Th>
            </tr>
          </THead>
          <tbody>
            {visibleUsers.map((user) => (
              <Tr key={user.id}>
                <Td>
                  <p className="font-medium">{user.name || "Unnamed user"}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </Td>
                <Td>
                  <StatusPill value={user.role} />
                </Td>
                <Td>
                  <StatusPill value={user.status} />
                </Td>
                <Td className="tabular whitespace-nowrap">
                  {formatDate(user.createdAt)}
                </Td>
                <Td align="right">
                  <UserAccessActions user={user} />
                </Td>
              </Tr>
            ))}
            {visibleUsers.length === 0 ? (
              <TableEmpty colSpan={5}>{emptyState}</TableEmpty>
            ) : null}
          </tbody>
        </TableScroll>

        <section aria-label="User directory" className="lg:hidden">
          {visibleUsers.length > 0 ? (
            <RecordList
              ariaLabel="Users"
              className="rounded-none border-0 shadow-none"
            >
              {visibleUsers.map((user) => (
                <li key={user.id}>
                  <article className="grid gap-4">
                    <header className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold">
                          {user.name || "Unnamed user"}
                        </h2>
                        <p className="mt-1 break-all text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <StatusPill value={user.status} />
                    </header>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">
                          Role
                        </dt>
                        <dd className="mt-1">
                          <StatusPill value={user.role} />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">
                          Created
                        </dt>
                        <dd className="tabular mt-1">
                          {formatDate(user.createdAt)}
                        </dd>
                      </div>
                    </dl>
                    <div className="border-t border-border pt-3">
                      <UserAccessActions user={user} />
                    </div>
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
