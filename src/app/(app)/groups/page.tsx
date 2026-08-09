import { Users } from "lucide-react";

import { GroupForm } from "@/components/admin/group-form";
import { EmptyState, PageHeader, Panel, StatusPill } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function GroupsPage() {
  const groups = await prisma.emailGroup.findMany({
    include: { members: { include: { recipient: true } } },
    orderBy: { name: "asc" }
  });

  return (
    <div className="grid gap-6">
      <PageHeader title="Groups" description="Reusable notification groups for license changes and reminders." />
      <Panel title="Add a group">
        <GroupForm />
      </Panel>
      <Panel title={`${groups.length} ${groups.length === 1 ? "group" : "groups"}`}>
        {groups.length === 0 ? (
          <div className="py-8">
            <EmptyState
              icon={<Users aria-hidden className="h-5 w-5" />}
              title="No groups yet"
              description="Groups let you notify a whole team without picking recipients one by one."
            />
          </div>
        ) : (
          <ul className="grid gap-3">
            {groups.map((group) => (
              <li
                key={group.id}
                className="rounded-xl border border-border p-4 transition-colors duration-150 ease-out-quart hover:border-primary/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-medium">{group.name}</p>
                  <StatusPill value={group.active ? "active" : "inactive"} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {group.members.length === 0
                    ? "No members yet"
                    : group.members.map((member) => member.recipient.email).join(", ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
