import { ManagementSearch } from "@/components/ui/record-list";

export function DirectoryToolbar({
  action,
  ariaLabel,
  defaultValue,
  placeholder,
  countLabel,
}: {
  action: string;
  ariaLabel: string;
  defaultValue: string;
  placeholder: string;
  countLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 sm:w-full sm:max-w-lg">
        <ManagementSearch
          action={action}
          ariaLabel={ariaLabel}
          defaultValue={defaultValue}
          placeholder={placeholder}
        />
      </div>
      <p className="tabular shrink-0 text-sm text-foreground-muted">
        {countLabel}
      </p>
    </div>
  );
}
