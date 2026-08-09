import { EmailSettingsForm } from "@/components/email-settings-form";
import { PageHeader, Panel } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function EmailSettingsPage() {
  const settings = await prisma.smtpSettings.findUnique({ where: { id: "default" } });

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Email settings"
        description="Configure SMTP for license creation messages and renewal reminders."
      />
      <Panel title="SMTP connection" description="Send a test message after saving to confirm the credentials work.">
        <EmailSettingsForm settings={settings} />
      </Panel>
    </div>
  );
}
