import { EmailSettingsForm } from "@/components/email-settings-form";
import { Panel } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function EmailSettingsPage() {
  const settings = await prisma.smtpSettings.findUnique({ where: { id: "default" } });
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Email settings</h1>
        <p className="text-sm text-muted-foreground">Configure SMTP for license creation messages and renewal reminders.</p>
      </div>
      <Panel>
        <EmailSettingsForm settings={settings} />
      </Panel>
    </div>
  );
}
