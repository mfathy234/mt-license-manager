import { EmailSettingsForm } from "@/components/email-settings-form";
import { PageHeader } from "@/components/ui";
import { requirePagePermission } from "@/lib/page-auth";
import { prisma } from "@/lib/prisma";

export default async function EmailSettingsPage() {
  await requirePagePermission("settings:write");
  const settings = await prisma.smtpSettings.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="grid max-w-[1400px] gap-4">
      <PageHeader
        title="Email settings"
        description="Configure SMTP for license creation messages and renewal reminders."
      />
      <EmailSettingsForm
        hasPassword={Boolean(settings?.passwordCipher)}
        settings={
          settings
            ? {
                host: settings.host,
                port: settings.port,
                secure: settings.secure,
                username: settings.username,
                fromName: settings.fromName,
                fromEmail: settings.fromEmail,
              }
            : null
        }
      />
    </div>
  );
}
