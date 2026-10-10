import { LicenseForm } from "@/components/license-form";
import { PageHeader, Panel } from "@/components/ui";
import { getLicenseFormOptions } from "@/lib/lookups";
import { requirePageSession } from "@/lib/page-auth";

export default async function NewLicensePage() {
  await requirePageSession();
  const { admins, lookupOptions } = await getLicenseFormOptions();

  return (
    <div className="grid max-w-[1400px] gap-4">
      <PageHeader
        title="New license"
        description="Identity, ownership, and renewal details."
      />
      <Panel bodyClassName="p-0">
        <LicenseForm
          action="create"
          adminOptions={admins}
          lookupOptions={lookupOptions}
        />
      </Panel>
    </div>
  );
}
