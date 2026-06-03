import { LicenseForm } from "@/components/license-form";
import { Panel } from "@/components/ui";
import { getLicenseFormOptions } from "@/lib/lookups";

export default async function NewLicensePage() {
  const { admins, lookupOptions } = await getLicenseFormOptions();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">New license</h1>
        <p className="text-sm text-muted-foreground">Create a license record and assign notification targets later.</p>
      </div>
      <Panel>
        <LicenseForm action="create" adminOptions={admins} lookupOptions={lookupOptions} />
      </Panel>
    </div>
  );
}
