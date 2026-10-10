import {
  PageHeader,
  Panel,
  RecordList,
  TableScroll,
  THead,
  Td,
  Th,
  Tr,
} from "@/components/ui";

const SKELETON_ROWS = ["one", "two", "three", "four", "five"] as const;
const SKELETON_COLUMNS = [
  "license",
  "status",
  "service",
  "owner",
  "renewal",
  "cost",
] as const;

const pulse = "motion-safe:animate-pulse bg-muted";

export default function LicenseAreaLoading() {
  return (
    <div aria-busy="true" className="grid gap-4">
      <span role="status" aria-live="polite" className="sr-only">
        Loading the license workspace
      </span>

      <PageHeader
        title="Licenses"
        description="Subscriptions, ownership, costs, and renewals."
      />

      <div aria-hidden="true">
        <Panel bodyClassName="p-0">
          <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
            <div className={`h-10 min-w-0 flex-1 rounded-md lg:h-9 ${pulse}`} />
            <div className={`h-10 w-24 rounded-md lg:h-9 ${pulse}`} />
            <div className={`hidden h-9 w-24 rounded-md lg:block ${pulse}`} />
            <div className={`hidden h-9 w-24 rounded-md xl:block ${pulse}`} />
            <div className={`hidden h-9 w-24 rounded-md xl:block ${pulse}`} />
          </div>

          <TableScroll
            className="hidden rounded-none border-0 shadow-none lg:block"
            minWidthClassName="min-w-[960px]"
          >
            <THead>
              <tr>
                {SKELETON_COLUMNS.map((column) => (
                  <Th key={column}>
                    <span className={`block h-3 w-16 rounded ${pulse}`} />
                  </Th>
                ))}
              </tr>
            </THead>
            <tbody>
              {SKELETON_ROWS.map((row) => (
                <Tr key={row}>
                  {SKELETON_COLUMNS.map((column) => (
                    <Td key={column}>
                      <span className={`block h-4 max-w-28 rounded ${pulse}`} />
                    </Td>
                  ))}
                </Tr>
              ))}
            </tbody>
          </TableScroll>

          <RecordList className="rounded-none border-0 shadow-none lg:hidden">
            {SKELETON_ROWS.slice(0, 3).map((row) => (
              <li key={row} className="grid gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid flex-1 gap-2">
                    <div className={`h-4 w-3/5 rounded ${pulse}`} />
                    <div className={`h-3 w-2/5 rounded ${pulse}`} />
                  </div>
                  <div className={`h-5 w-14 rounded-md ${pulse}`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`h-9 rounded ${pulse}`} />
                  <div className={`h-9 rounded ${pulse}`} />
                </div>
              </li>
            ))}
          </RecordList>

          <div className="flex items-center justify-between border-t border-border px-3 py-2">
            <div className={`h-4 w-32 rounded ${pulse}`} />
            <div className={`h-7 w-40 rounded-md ${pulse}`} />
          </div>
        </Panel>
      </div>
    </div>
  );
}
