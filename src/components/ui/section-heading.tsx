import type { ReactNode } from "react";

export function SectionHeading({
  title,
  description,
  actions,
  level = "h2",
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  level?: "h2" | "h3";
}) {
  const Heading = level;

  return (
    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
      <div className="min-w-0">
        <Heading className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </Heading>
        {description ? (
          <p className="mt-0.5 max-w-[70ch] text-[13px] text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
