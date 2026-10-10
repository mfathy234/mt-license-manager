# Professional UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a cohesive, professional redesign of the login and every authenticated screen while keeping landing, setup, backend behavior, authentication, authorization, encryption, and data contracts unchanged.

**Architecture:** Refine the existing Tailwind token layer and shared UI primitives first, then apply them through the shell and feature screens in dependency order. Pure display decisions such as renewal urgency, navigation grouping, and notification presentation will live in small typed helpers that can be unit-tested without a browser; page components continue to own their existing server data queries and permission checks.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.7, Tailwind CSS 3.4, Prisma 5/PostgreSQL, NextAuth 4, Lucide React, Vitest 2.

**Spec:** `docs/superpowers/specs/2026-08-21-professional-ui-redesign-design.md`

## Global Constraints

- Public landing page and initial setup page remain unchanged.
- Backend contracts, business rules, authentication, authorization, encryption, database schema, API payloads, and route paths remain unchanged.
- Work within the existing Next.js, React, Tailwind, and shared-component structure; do not add a second component library.
- Avoid new dependencies unless a current dependency cannot satisfy an approved requirement.
- Dark mode, WCAG AA contrast, visible focus, keyboard access, reduced motion, and responsive behavior are required.
- All work remains local. Do not commit or push.
- Preserve unrelated user changes if the worktree becomes dirty.

## File Structure

### New files

- `src/lib/presentation.ts` — typed, pure presentation helpers for navigation grouping and semantic record states.
- `src/lib/__tests__/presentation.test.ts` — unit coverage for presentation helpers.
- `src/components/ui/section-heading.tsx` — compact section heading used inside detail and settings surfaces.
- `src/components/ui/record-list.tsx` — responsive record-list shell used by management screens.

### Shared files to modify

- `src/app/layout.tsx` — load Geist through `next/font` without changing root providers or metadata behavior.
- `src/app/globals.css` — professional light/dark tokens, focus styles, surface rules, reduced-motion handling, and base typography.
- `tailwind.config.ts` — token aliases and restrained shadow/radius utilities only.
- `src/components/ui/button.tsx` — consistent action hierarchy, loading state, icon sizing, and focus treatment.
- `src/components/ui/field.tsx` — consistent label/control/error rhythm and accessible compact controls.
- `src/components/ui/panel.tsx` — opaque professional panels, page headers, and semantic stat-card variants.
- `src/components/ui/table.tsx` — bounded scrolling, sticky headers, dense rows, and responsive hooks.
- `src/components/ui/feedback.tsx` — semantic pills, alerts, empty states, and unread indicators.
- `src/components/ui/confirm-dialog.tsx` — opaque dialog styling and complete focus/keyboard behavior.
- `src/components/ui/index.ts` — export the added primitives.
- `src/components/modern-select.tsx` — align React Select with the refined tokens and focus states.

### Feature files to modify

- `src/components/app-shell-client.tsx`, `src/components/app-shell.tsx` — grouped deep-navy navigation, collapsed desktop state, accessible mobile drawer, contextual frame.
- `src/app/login/page.tsx`, `src/components/login-form.tsx` — responsive split-panel login and password visibility.
- `src/app/(app)/dashboard/page.tsx` — KPI hierarchy, renewal risk, quick actions, recent licenses.
- `src/app/(app)/licenses/page.tsx`, `src/components/license-search-toolbar.tsx` — professional license workspace, filter chips, compact table/card behavior.
- `src/app/(app)/licenses/[id]/page.tsx`, `src/components/license-form.tsx`, `src/components/license-delete-button.tsx` — detail hierarchy, structured forms, credentials/history, reliable actions.
- `src/app/(app)/licenses/new/page.tsx` — consistent create surface.
- `src/app/(app)/licenses/import/page.tsx`, `src/components/import-workbook.tsx` — guided import state and result presentation.
- `src/app/(app)/recipients/page.tsx`, `src/app/(app)/groups/page.tsx`, `src/app/(app)/users/page.tsx` — unified management layouts.
- `src/components/admin/recipient-form.tsx`, `src/components/admin/group-form.tsx`, `src/components/admin/user-invite-form.tsx`, `src/components/admin/use-form-submit.ts` — consistent forms and immediate feedback.
- `src/app/(app)/notifications/page.tsx` — scannable semantic notification history.
- `src/app/(app)/settings/email/page.tsx`, `src/components/email-settings-form.tsx` — stable settings sections and feedback.
- `src/app/(app)/settings/lookups/page.tsx`, `src/components/lookups-manager.tsx` — compact lookup management.

---

### Task 1: Presentation Contracts and Regression Guardrails

**Files:**
- Create: `src/lib/presentation.ts`
- Create: `src/lib/__tests__/presentation.test.ts`
- Modify: `src/lib/utils.ts`
- Test: `src/lib/__tests__/presentation.test.ts`
- Test: `src/lib/__tests__/utils.test.ts`

**Interfaces:**
- Consumes: existing `expiryBadge(date)` return shape from `src/lib/utils.ts`.
- Produces: `NavigationGroup`, `navigationGroups`, `getRenewalState(expiryDate, now?)`, and `notificationKindLabel(kind)` for later tasks.

- [ ] **Step 1: Write failing presentation tests**

```ts
import { describe, expect, it } from "vitest";
import { getRenewalState, navigationGroups, notificationKindLabel } from "@/lib/presentation";

describe("presentation contracts", () => {
  it("groups authenticated destinations by workflow", () => {
    expect(navigationGroups.map((group) => group.label)).toEqual(["Workspace", "Directory", "Administration"]);
    expect(navigationGroups.flatMap((group) => group.items.map((item) => item.href))).toContain("/licenses");
  });

  it("marks renewal dates by urgency", () => {
    const now = new Date("2026-08-21T12:00:00.000Z");
    expect(getRenewalState("2026-08-20", now).tone).toBe("danger");
    expect(getRenewalState("2026-08-28", now).label).toBe("Due in 7 days");
    expect(getRenewalState("2026-10-01", now).tone).toBe("success");
  });

  it("turns stored notification kinds into readable labels", () => {
    expect(notificationKindLabel("renewal_reminder")).toBe("Renewal reminder");
  });
});
```

- [ ] **Step 2: Run the focused tests and verify the missing module failure**

Run: `npm test -- src/lib/__tests__/presentation.test.ts`

Expected: FAIL because `@/lib/presentation` does not exist.

- [ ] **Step 3: Implement the typed presentation helpers**

```ts
export type PresentationTone = "neutral" | "success" | "warning" | "danger" | "info";

export type NavigationItem = {
  label: string;
  href: string;
  roles?: Array<"admin" | "editor" | "viewer">;
};

export type NavigationGroup = { label: string; items: NavigationItem[] };

export const navigationGroups: NavigationGroup[] = [
  { label: "Workspace", items: [{ label: "Dashboard", href: "/dashboard" }, { label: "Licenses", href: "/licenses" }, { label: "Notifications", href: "/notifications" }] },
  { label: "Directory", items: [{ label: "Recipients", href: "/recipients" }, { label: "Groups", href: "/groups" }] },
  { label: "Administration", items: [{ label: "Users", href: "/users", roles: ["admin"] }, { label: "Email settings", href: "/settings/email", roles: ["admin"] }, { label: "Lookups", href: "/settings/lookups", roles: ["admin"] }] }
];

export function notificationKindLabel(kind: string) {
  const value = kind.replace(/_/g, " ").trim();
  return value ? value[0].toUpperCase() + value.slice(1) : "Notification";
}
```

Implement `getRenewalState` by calculating calendar-day distance, returning `{ tone, label }`, and covering expired, today, 1–30 days, and later/no-date states without changing `expiryBadge` consumers until their feature task.

- [ ] **Step 4: Run focused and existing utility tests**

Run: `npm test -- src/lib/__tests__/presentation.test.ts src/lib/__tests__/utils.test.ts`

Expected: PASS.

- [ ] **Step 5: Confirm only planned local files changed**

Run: `git status --short`

Expected: the design/plan documents and Task 1 files are listed; nothing is committed or pushed.

### Task 2: Design Tokens and Shared UI Primitives

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/field.tsx`
- Modify: `src/components/ui/panel.tsx`
- Modify: `src/components/ui/table.tsx`
- Modify: `src/components/ui/feedback.tsx`
- Modify: `src/components/ui/confirm-dialog.tsx`
- Create: `src/components/ui/section-heading.tsx`
- Create: `src/components/ui/record-list.tsx`
- Modify: `src/components/ui/index.ts`
- Modify: `src/components/modern-select.tsx`
- Test: `src/lib/__tests__/presentation.test.ts`

**Interfaces:**
- Consumes: `PresentationTone` from Task 1.
- Produces: `Panel`, `PageHeader`, `StatCard`, `StatusPill`, `SectionHeading`, and `RecordList` visual contracts used by all later tasks.

- [ ] **Step 1: Add a failing semantic-tone contract test**

Extend `src/lib/__tests__/presentation.test.ts`:

```ts
import { toneClassName } from "@/lib/presentation";

it("maps every presentation tone to a visible semantic treatment", () => {
  expect(["neutral", "success", "warning", "danger", "info"].map(toneClassName)).toEqual([
    "border-border bg-muted text-foreground",
    "border-success/25 bg-success-surface text-success",
    "border-warning/25 bg-warning-surface text-warning",
    "border-danger/25 bg-danger-surface text-danger",
    "border-info/25 bg-info-surface text-info"
  ]);
});
```

- [ ] **Step 2: Verify the tone contract fails**

Run: `npm test -- src/lib/__tests__/presentation.test.ts`

Expected: FAIL because `toneClassName` is not exported.

- [ ] **Step 3: Implement semantic tokens and shared presentation contracts**

Add `toneClassName(tone: PresentationTone): string` to `src/lib/presentation.ts`. Replace translucent/glass-first variables in `globals.css` with opaque cool-neutral surfaces, deep navy dark values, cobalt primary values, `.focus-ring`, tabular number support, `prefers-reduced-motion`, and a navy sidebar surface variable. Load Geist in `src/app/layout.tsx`:

```tsx
import { Geist } from "next/font/google";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

<body className={geist.variable}>{children}</body>
```

Keep existing component prop signatures compatible. Add optional `tone?: PresentationTone` to `StatCard`, implement `SectionHeading({ title, description, actions })`, and implement `RecordList({ children, className })` as a semantic `<ul>` with consistent divided rows. Update `ui/index.ts` to export both new primitives.

- [ ] **Step 4: Verify type safety and the semantic contract**

Run: `npm test -- src/lib/__tests__/presentation.test.ts`

Run: `npm run typecheck`

Expected: both PASS.

- [ ] **Step 5: Check formatting and local scope**

Run: `npx prettier --check src/app/layout.tsx src/app/globals.css tailwind.config.ts src/components/ui src/components/modern-select.tsx src/lib/presentation.ts src/lib/__tests__/presentation.test.ts`

Expected: PASS after formatting those files with `npx prettier --write ...` if needed; no commit or push.

### Task 3: Professional Application Shell and Login

**Files:**
- Modify: `src/components/app-shell-client.tsx`
- Modify: `src/components/app-shell.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/components/login-form.tsx`
- Test: `src/lib/__tests__/presentation.test.ts`

**Interfaces:**
- Consumes: `navigationGroups`, shared buttons/fields/panels, existing `AppShellClientProps.user`, and current NextAuth sign-in flow.
- Produces: grouped permission-aware navigation, desktop collapse behavior, accessible mobile drawer, theme control, and split-panel login.

- [ ] **Step 1: Add failing role-filter tests**

```ts
import { navigationForRole } from "@/lib/presentation";

it("hides administration links from viewers", () => {
  const hrefs = navigationForRole("viewer").flatMap((group) => group.items.map((item) => item.href));
  expect(hrefs).not.toContain("/users");
  expect(hrefs).toContain("/licenses");
});

it("shows administration links to admins", () => {
  expect(navigationForRole("admin").flatMap((group) => group.items.map((item) => item.href))).toContain("/users");
});
```

- [ ] **Step 2: Verify role filtering fails**

Run: `npm test -- src/lib/__tests__/presentation.test.ts`

Expected: FAIL because `navigationForRole` is not exported.

- [ ] **Step 3: Implement the smallest role filter and wire the shell**

Implement:

```ts
export function navigationForRole(role: "admin" | "editor" | "viewer") {
  return navigationGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.roles || item.roles.includes(role)) }))
    .filter((group) => group.items.length > 0);
}
```

Render the returned groups in the deep-navy sidebar, retain active-path logic, and keep current permissions intact. Add `aria-expanded`, `aria-controls`, labeled collapse/theme/sign-out controls, focus restoration, Escape handling, body-scroll containment, and tooltips/accessible labels for collapsed items. Make the content header contextual and avoid duplicating the user block on desktop.

Recompose login into a two-column `min-h-screen` layout, with the form as the first meaningful mobile content. Add local `showPassword` state to `LoginForm` and render a labeled toggle inside the existing `Field` adornment while keeping `signIn("credentials", ...)` unchanged.

- [ ] **Step 4: Run focused tests and type checking**

Run: `npm test -- src/lib/__tests__/presentation.test.ts`

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Verify excluded pages remain untouched**

Run: `git diff --name-only -- src/app/page.tsx src/app/setup/page.tsx src/components/setup-form.tsx`

Expected: no output.

### Task 4: Operational Dashboard

**Files:**
- Modify: `src/app/(app)/dashboard/page.tsx`
- Modify: `src/components/ui/panel.tsx`
- Test: `src/lib/__tests__/presentation.test.ts`

**Interfaces:**
- Consumes: `getRenewalState`, semantic `StatCard.tone`, existing dashboard Prisma queries, and current user permissions.
- Produces: prioritized KPI row, renewal-risk queue, permission-aware quick actions, and recent-license table.

- [ ] **Step 1: Add failing renewal-summary tests**

```ts
import { summarizeRenewals } from "@/lib/presentation";

it("summarizes urgent renewal records without mutating input", () => {
  const input = [{ expiryDate: "2026-08-20" }, { expiryDate: "2026-08-28" }, { expiryDate: "2026-10-01" }];
  const snapshot = structuredClone(input);
  expect(summarizeRenewals(input, new Date("2026-08-21T12:00:00Z"))).toEqual({ expired: 1, dueSoon: 1, healthy: 1 });
  expect(input).toEqual(snapshot);
});
```

- [ ] **Step 2: Verify summary helper fails**

Run: `npm test -- src/lib/__tests__/presentation.test.ts`

Expected: FAIL because `summarizeRenewals` is not exported.

- [ ] **Step 3: Implement summary and dashboard composition**

Implement `summarizeRenewals(records, now?)` by reducing into a new `{ expired, dueSoon, healthy }` object using `getRenewalState`. Keep the current server query boundary, calculate counts from existing data, and render:

```tsx
<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  <StatCard label="All licenses" value={licenseCount} />
  <StatCard label="Renewing soon" value={summary.dueSoon} tone="warning" />
  <StatCard label="Expired" value={summary.expired} tone="danger" />
  <StatCard label="Active recipients" value={recipientCount} tone="info" />
</div>
```

Below it, use a wide renewal-risk panel and narrower quick-actions panel, followed by recent licenses. Each risk row includes product/license identity, owner/customer context, exact date, semantic label, and detail link. Show create/import/settings shortcuts only when the current role already permits them.

- [ ] **Step 4: Run tests and server type checking**

Run: `npm test -- src/lib/__tests__/presentation.test.ts`

Run: `npm run typecheck`

Expected: PASS with no Prisma query or permission changes.

- [ ] **Step 5: Review dashboard diff for data-boundary changes**

Run: `git diff -- src/app/'(app)'/dashboard/page.tsx`

Expected: presentation composition and derived calculations only; no schema, API, or authorization changes.

### Task 5: License Workspace

**Files:**
- Modify: `src/app/(app)/licenses/page.tsx`
- Modify: `src/components/license-search-toolbar.tsx`
- Modify: `src/components/ui/table.tsx`
- Test: `src/lib/__tests__/presentation.test.ts`

**Interfaces:**
- Consumes: existing URL `SearchParams`, `getRenewalState`, existing lookup/admin options, `TableScroll`, and permission checks.
- Produces: stable filter state, readable active-filter chips, professional desktop table, and compact mobile record cards.

- [ ] **Step 1: Move filter-chip calculation behind an exported pure helper and test it**

Add to the presentation tests:

```ts
import { buildLicenseFilterChips } from "@/lib/presentation";

it("labels active license filters and ignores empty values", () => {
  expect(buildLicenseFilterChips({ q: "Acme", status: "Active", adminId: "u1" }, [{ id: "u1", name: "Mona" }])).toEqual([
    { key: "q", label: "Search", value: "Acme" },
    { key: "status", label: "Status", value: "Active" },
    { key: "adminId", label: "Administrator", value: "Mona" }
  ]);
});
```

- [ ] **Step 2: Verify chip helper fails**

Run: `npm test -- src/lib/__tests__/presentation.test.ts`

Expected: FAIL because `buildLicenseFilterChips` is not exported.

- [ ] **Step 3: Implement the typed chip helper and workspace layout**

Define `LicenseFilterValues` using the current toolbar keys and implement `buildLicenseFilterChips(filters, admins)` without mutating inputs. Replace the private `buildChips` in `license-search-toolbar.tsx` and keep URL serialization unchanged.

Place search and filters in one bounded toolbar with an explicit reset action. Render desktop columns with sticky headings and tabular dates/costs. Render a `lg:hidden` record-card list with identity, status, renewal state, owner, and accessible view/edit actions; hide the wide table below `lg`. Preserve existing pagination/filter/query behavior exactly.

- [ ] **Step 4: Run focused tests and type checking**

Run: `npm test -- src/lib/__tests__/presentation.test.ts src/lib/__tests__/utils.test.ts`

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Verify route/API boundaries**

Run: `git diff --name-only -- src/app/api src/lib/validators.ts prisma/schema.prisma`

Expected: no output.

### Task 6: License Detail, Create, Edit, Credentials, and History

**Files:**
- Modify: `src/app/(app)/licenses/[id]/page.tsx`
- Modify: `src/app/(app)/licenses/new/page.tsx`
- Modify: `src/components/license-form.tsx`
- Modify: `src/components/license-delete-button.tsx`
- Modify: `src/components/ui/section-heading.tsx`
- Test: `src/lib/__tests__/presentation.test.ts`

**Interfaces:**
- Consumes: current server actions/API calls, role checks, encrypted credential summaries, `SectionHeading`, `getRenewalState`, and shared fields/buttons/dialog.
- Produces: structured license summary, consistent form sections, stable long-form action area, masked credential cards, and chronological notification history.

- [ ] **Step 1: Add failing detail-metadata tests**

```ts
import { licenseSummaryItems } from "@/lib/presentation";

it("builds a stable summary without exposing credential values", () => {
  const items = licenseSummaryItems({ status: "Active", expiryDate: "2026-08-28", adminsDisplay: "Mona", annualCost: 1200 }, new Date("2026-08-21T12:00:00Z"));
  expect(items.map((item) => item.label)).toEqual(["Status", "Renewal", "Administrators", "Annual cost"]);
  expect(JSON.stringify(items)).not.toMatch(/password|secret/i);
});
```

- [ ] **Step 2: Verify summary helper fails**

Run: `npm test -- src/lib/__tests__/presentation.test.ts`

Expected: FAIL because `licenseSummaryItems` is not exported.

- [ ] **Step 3: Implement summary helper and reorganize the detail/form UI**

Implement `licenseSummaryItems` as a pure formatter that calls `getRenewalState` and `formatMoney`; do not accept credential payloads in its input type. Use it for the detail summary.

Organize `LicenseForm` into `License identity`, `Ownership and contacts`, `Contract and renewal`, and `Notes` sections while preserving every current field name, initial value, lookup option, date conversion, and submit action. Use a sticky footer inside the form at desktop widths, with `Cancel` then primary `Save license` order and a normal-flow mobile footer.

Keep credentials masked and reveal behavior unchanged. Style metadata, credentials, and notification history as distinct sections; history rows show subject, kind, recipients, outcome, and timestamp when those values already exist. Keep delete permissions and confirmation semantics unchanged.

- [ ] **Step 4: Run presentation, crypto, permission, and type checks**

Run: `npm test -- src/lib/__tests__/presentation.test.ts src/lib/__tests__/crypto.test.ts src/lib/__tests__/permissions.test.ts`

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Verify sensitive boundaries were not edited**

Run: `git diff --name-only -- src/lib/crypto.ts src/lib/license-secure.ts src/app/api/licenses prisma/schema.prisma`

Expected: no output.

### Task 7: Guided Import Experience

**Files:**
- Modify: `src/app/(app)/licenses/import/page.tsx`
- Modify: `src/components/import-workbook.tsx`
- Test: `src/lib/__tests__/excel.test.ts`

**Interfaces:**
- Consumes: existing `/api/import/preview` and `/api/import/confirm` response shapes, shared file field/buttons/feedback/panel.
- Produces: explicit upload, preview, processing, success, partial failure, and retry states.

- [ ] **Step 1: Extend existing Excel tests with immutable result categorization**

Add a pure `categorizeImportResults` export beside the existing Excel helpers and test:

```ts
it("separates imported, skipped, and failed row outcomes", () => {
  const rows = [{ status: "imported" }, { status: "skipped" }, { status: "failed", error: "Missing product" }];
  expect(categorizeImportResults(rows)).toEqual({ imported: 1, skipped: 1, failed: 1 });
});
```

- [ ] **Step 2: Verify categorization test fails**

Run: `npm test -- src/lib/__tests__/excel.test.ts`

Expected: FAIL because `categorizeImportResults` is not exported.

- [ ] **Step 3: Implement categorization and compose the guided states**

Implement a non-mutating reducer in `src/lib/excel.ts`. In `ImportWorkbook`, render one explicit state at a time: instructions/file selection, preview with filename and row count, importing state with disabled controls, and result summary. Display API-provided row errors as text, never `dangerouslySetInnerHTML`. Preserve endpoints, payloads, parsing, and confirmation behavior.

- [ ] **Step 4: Run Excel tests and type checking**

Run: `npm test -- src/lib/__tests__/excel.test.ts`

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Verify import APIs are unchanged**

Run: `git diff --name-only -- src/app/api/import`

Expected: no output.

### Task 8: Unified Recipients, Groups, and Users Management

**Files:**
- Modify: `src/app/(app)/recipients/page.tsx`
- Modify: `src/app/(app)/groups/page.tsx`
- Modify: `src/app/(app)/users/page.tsx`
- Modify: `src/components/admin/recipient-form.tsx`
- Modify: `src/components/admin/group-form.tsx`
- Modify: `src/components/admin/user-invite-form.tsx`
- Modify: `src/components/admin/use-form-submit.ts`
- Modify: `src/components/ui/record-list.tsx`
- Test: `src/lib/__tests__/permissions.test.ts`

**Interfaces:**
- Consumes: existing management API endpoints, current permission helpers, `RecordList`, shared fields/buttons/feedback/status pills.
- Produces: one consistent add-form/list pattern with accessible status and destructive actions.

- [ ] **Step 1: Add role-presentation assertions to the permission tests**

```ts
it("keeps management capability aligned with stored roles", () => {
  expect(can("admin", "users:write")).toBe(true);
  expect(can("editor", "users:write")).toBe(false);
  expect(can("editor", "license:write")).toBe(true);
  expect(can("viewer", "license:write")).toBe(false);
});
```

Use the existing `can(role, action)` export from `src/lib/permissions.ts`; do not add new authorization logic to presentation code.

- [ ] **Step 2: Run permission tests before UI edits**

Run: `npm test -- src/lib/__tests__/permissions.test.ts`

Expected: PASS, establishing the authorization baseline.

- [ ] **Step 3: Apply the shared management composition**

Each page gets: a `PageHeader`, an add panel whose description states the outcome, and a list panel with count, empty state, semantic badges, metadata, and actions in the same positions. On narrow screens use `RecordList`; retain tables where data density benefits desktop users. Forms continue to use `useFormSubmit` and existing URLs/bodies. Feedback must use `role="status"` for success and `role="alert"` for errors without changing API handling.

- [ ] **Step 4: Run permissions, type checking, and focused lint**

Run: `npm test -- src/lib/__tests__/permissions.test.ts`

Run: `npm run typecheck`

Run: `npx eslint src/app/'(app)'/recipients/page.tsx src/app/'(app)'/groups/page.tsx src/app/'(app)'/users/page.tsx src/components/admin --ext .ts,.tsx --max-warnings=0`

Expected: PASS.

- [ ] **Step 5: Verify management APIs are unchanged**

Run: `git diff --name-only -- src/app/api/recipients src/app/api/groups src/app/api/users`

Expected: no output.

### Task 9: Notifications and Settings

**Files:**
- Modify: `src/app/(app)/notifications/page.tsx`
- Modify: `src/app/(app)/settings/email/page.tsx`
- Modify: `src/components/email-settings-form.tsx`
- Modify: `src/app/(app)/settings/lookups/page.tsx`
- Modify: `src/components/lookups-manager.tsx`
- Test: `src/lib/__tests__/presentation.test.ts`

**Interfaces:**
- Consumes: `notificationKindLabel`, shared panels/status/feedback/fields, existing email/lookups APIs and current server queries.
- Produces: scannable notification rows and consistent settings save/test/manage sections.

- [ ] **Step 1: Add failing notification-tone tests**

```ts
import { notificationTone } from "@/lib/presentation";

it("maps notification outcomes to semantic tones", () => {
  expect(notificationTone("sent")).toBe("success");
  expect(notificationTone("failed")).toBe("danger");
  expect(notificationTone("pending")).toBe("warning");
});
```

- [ ] **Step 2: Verify notification-tone test fails**

Run: `npm test -- src/lib/__tests__/presentation.test.ts`

Expected: FAIL because `notificationTone` is not exported.

- [ ] **Step 3: Implement notification presentation and settings sections**

Implement `notificationTone(status?: string): PresentationTone` with explicit sent/success, failed/error, pending/queued, and neutral fallbacks. Render notification history with readable kind, license context, recipients, outcome pill, and timestamp; distinguish outcome through icon/text/pill, not color alone.

Compose email settings into connection, authentication, sender, and test-message sections while retaining existing field names and request bodies. Compose lookups by type with compact rows and locally scoped feedback. Sensitive inputs remain password fields and are never echoed into feedback.

- [ ] **Step 4: Run focused tests, type checking, and security grep**

Run: `npm test -- src/lib/__tests__/presentation.test.ts`

Run: `npm run typecheck`

Run: `rg -n "dangerouslySetInnerHTML|console\.log\(.*password|console\.log\(.*secret" src/app/'(app)'/notifications src/components/email-settings-form.tsx src/components/lookups-manager.tsx`

Expected: tests/typecheck PASS and grep returns no matches.

- [ ] **Step 5: Verify settings and notification backend files are unchanged**

Run: `git diff --name-only -- src/app/api/settings src/app/api/licenses/'[id]'/notify src/lib/email.ts src/lib/reminders.ts`

Expected: no output.

### Task 10: Full Verification, Local Fake Data, and Boot

**Files:**
- Modify only if required by an actual failing check: files already listed in Tasks 1–9.
- Local ignored configuration: `.env.local`
- No schema, migration, API, landing, or setup edits.

**Interfaces:**
- Consumes: completed UI, existing Prisma PostgreSQL schema, existing setup/auth flows, and all project scripts.
- Produces: a locally running app with safe fake data, a test login, and a reported port.

- [ ] **Step 1: Format and review the complete local diff**

Run: `npx prettier --write src/app/layout.tsx src/app/globals.css src/app/login src/app/'(app)' src/components src/lib/presentation.ts src/lib/__tests__/presentation.test.ts tailwind.config.ts`

Run: `git diff --check`

Run: `git status --short`

Expected: formatting completes, `git diff --check` reports no whitespace errors, and all changes are expected local files.

- [ ] **Step 2: Run the verification ladder**

Run: `npm test`

Run: `npm run typecheck`

Run: `npm run lint`

Run: `npm run build`

Expected: every command exits 0. Fix the smallest relevant implementation issue when a command fails, rerun the narrow check, then rerun this ladder.

- [ ] **Step 3: Audit preservation and security boundaries**

Run: `git diff --name-only -- src/app/page.tsx src/app/setup/page.tsx src/components/setup-form.tsx src/app/api src/lib/auth.ts src/lib/crypto.ts src/lib/license-secure.ts prisma`

Expected: no output.

Run: `rg -n "(DATABASE_URL|NEXTAUTH_SECRET|CREDENTIAL_ENCRYPTION_KEY|CRON_SECRET)\s*=|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY" src prisma --glob '!**/*.test.ts'`

Expected: no hardcoded secrets or private keys.

- [ ] **Step 4: Configure an ignored local PostgreSQL database**

Confirm `.env.local` is ignored with `git check-ignore .env.local`. Populate it locally with a localhost PostgreSQL URL plus newly generated development-only values for `NEXTAUTH_SECRET`, `CREDENTIAL_ENCRYPTION_KEY`, and `CRON_SECRET`. Do not print the secrets to logs and do not add `.env.local` to Git.

Run: `npx prisma migrate deploy`

Expected: migrations apply successfully to the local development database.

- [ ] **Step 5: Seed fake operational data through existing models**

Use a one-off local Node script outside tracked source, or the existing setup/API paths, to create one test admin plus fake licenses, recipients, groups, lookup values, and notification history. Use reserved/example domains such as `example.test`; never use real customer addresses. Record only the generated test login and non-secret port in the handoff.

Expected dataset: at least six licenses covering healthy, due-soon, and expired states; at least three recipients; at least two groups; and notification history with success and failure states.

- [ ] **Step 6: Start and smoke-test the app on a free local port**

Run: `npm run dev -- --hostname 127.0.0.1 --port 3001`

Expected: Next.js reports ready at `http://127.0.0.1:3001` without terminating the sibling app already using port 3000.

Request `/login`, authenticate with the fake admin, and check `/dashboard`, `/licenses`, one `/licenses/{id}`, `/licenses/import`, `/recipients`, `/groups`, `/users`, `/notifications`, `/settings/email`, and `/settings/lookups` at approximately 1440 px, 768 px, and 390 px widths. Confirm mobile drawer, focus order, Escape-close, password visibility, table/card fallback, dark mode, empty/loading/error treatments, and no browser-console/runtime errors.

- [ ] **Step 7: Perform final no-push/no-commit confirmation**

Run: `git status --short`

Run: `git log -1 --oneline`

Expected: local changes remain uncommitted, the repository HEAD is still the cloned upstream commit, and no push command has been run.

Report the local URL, test login, verification results, and any unavailable visual check. Do not commit or push.
