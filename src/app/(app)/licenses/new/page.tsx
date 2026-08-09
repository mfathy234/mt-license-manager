import { LicenseForm } from "@/components/license-form";
import { PageHeader, Panel } from "@/components/ui";
import { getLicenseFormOptions } from "@/lib/lookups";

export default async function NewLicensePage() {
  const { admins, lookupOptions } = await getLicenseFormOptions();

  return (
    <div className="grid gap-6">
      <PageHeader
        title="New license"
        description="Create a license record. Notification targets can be assigned afterwards."
      />
      <Panel>
        <LicenseForm action="create" adminOptions={admins} lookupOptions={lookupOptions} />
      </Panel>
    </div>
  );
}
