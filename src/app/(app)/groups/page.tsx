import { GroupForm } from "@/components/admin-forms";
import { Panel, StatusPill } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function GroupsPage() {
  const groups = await prisma.emailGroup.findMany({
    include: { members: { include: { recipient: true } } },
    orderBy: { name: "asc" }
  });
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Groups</h1>
        <p className="text-sm text-muted-foreground">Reusable notification groups for license changes and reminders.</p>
      </div>
      <Panel><GroupForm /></Panel>
      <Panel>
        <div className="grid gap-3">
          {groups.map((group) => (
            <div key={group.id} className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{group.name}</p>
                <StatusPill value={group.active ? "active" : "inactive"} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {group.members.map((member) => member.recipient.email).join(", ") || "No members"}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
