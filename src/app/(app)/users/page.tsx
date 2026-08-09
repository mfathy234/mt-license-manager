import { Users as UsersIcon } from "lucide-react";

import { UserInviteForm } from "@/components/admin/user-invite-form";
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
import { formatDate } from "@/lib/utils";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    orderBy: { email: "asc" }
  });

  return (
    <div className="grid gap-6">
      <PageHeader title="Users" description="Manage app access for admins, editors, and viewers." />
      <Panel title="Add a user" description="Creates an active account with a temporary password.">
        <UserInviteForm />
      </Panel>
      <Panel title={`${users.length} ${users.length === 1 ? "user" : "users"}`} bodyClassName="p-5 pt-3">
        <TableScroll minWidthClassName="min-w-[640px]">
          <THead>
            <tr>
              <Th>User</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Created</Th>
            </tr>
          </THead>
          <tbody>
            {users.map((user) => (
              <Tr key={user.id}>
                <Td className="font-medium">{user.name || "—"}</Td>
                <Td>{user.email}</Td>
                <Td>
                  <StatusPill value={user.role} />
                </Td>
                <Td>
                  <StatusPill value={user.status} />
                </Td>
                <Td className="tabular">{formatDate(user.createdAt)}</Td>
              </Tr>
            ))}
            {users.length === 0 ? (
              <TableEmpty colSpan={5}>
                <EmptyState
                  icon={<UsersIcon aria-hidden className="h-5 w-5" />}
                  title="No users yet"
                  description="Add the first teammate using the form above."
                />
              </TableEmpty>
            ) : null}
          </tbody>
        </TableScroll>
      </Panel>
    </div>
  );
}
