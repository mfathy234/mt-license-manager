import { UserInviteForm } from "@/components/admin-forms";
import { Panel, StatusPill } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    orderBy: { email: "asc" }
  });
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">Manage app access for admins, editors, and viewers.</p>
      </div>
      <Panel><UserInviteForm /></Panel>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr><th className="py-2">User</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th></tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-border">
                  <td className="py-3 font-medium">{user.name || "-"}</td>
                  <td>{user.email}</td>
                  <td><StatusPill value={user.role} /></td>
                  <td><StatusPill value={user.status} /></td>
                  <td>{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
