"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button, EmptyState, PageHeader, Panel } from "@/components/ui";

export default function LicenseAreaError({ reset }: { reset: () => void }) {
  return (
    <div className="grid gap-4">
      <PageHeader title="Licenses" />

      <Panel>
        <div role="alert">
          <EmptyState
            icon={<AlertTriangle aria-hidden className="h-4 w-4" />}
            title="We couldn't load this license view"
            description="The license data could not be loaded. Try again to request the latest information."
            action={
              <Button type="button" variant="secondary" size="sm" onClick={reset}>
                <RefreshCw aria-hidden className="h-4 w-4" />
                Try again
              </Button>
            }
          />
        </div>
      </Panel>
    </div>
  );
}
