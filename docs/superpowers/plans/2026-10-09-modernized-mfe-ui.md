# Modernized MFE UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a locally verified redesign of Microtec License Manager using the sibling MFE product language, exact favicon, and restrained Lenis/GSAP motion without changing product behavior.

**Architecture:** Consolidate the visual system in CSS variables and existing Tailwind primitives, then apply it in dependency order through the shell and feature screens. Smooth scrolling and animation live in isolated client-only components with reduced-motion handling and cleanup; server pages retain their current data access and permission responsibilities.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.7, Tailwind CSS 3.4, Lenis, GSAP, Prisma/PostgreSQL, Vitest, Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-09-modernized-mfe-ui-design.md`

## Global Constraints

- Preserve all routes, APIs, authentication, authorization, encryption, Prisma schema, database behavior, and workflows.
- Use MFE brand colors exactly: primary `#1a90b0`, strong emphasis `#15738d`, slate `#30486d`, secondary slate `#5b77a2`, danger `#cb3f2d`.
- Use Geist/Geist Mono and the 12/14/16/20/24/32 type scale.
- Use 8px controls, 12px panels, and 16px major data containers.
- Copy `MFE-Apps/apps/dashboard/src/favicon.ico` byte-for-byte; do not redraw it.
- Lenis applies only to the main page viewport and must be destroyed on cleanup.
- GSAP animates only opacity and transform, uses scoped cleanup, and renders immediately for reduced motion.
- Do not animate tables, nested scrollers, dialogs, form controls, validation feedback, data values, or destructive actions.
- Maintain WCAG 2.2 AA contrast, visible focus, keyboard operation, and 44px touch targets.
- Work in the existing dirty tree and preserve all prior user changes.
- Do not commit, push, merge, or deploy. Any generic commit step in an execution skill is replaced by a local diff review checkpoint.

## Review Focus

- Reduced-motion users must receive immediate rendering and native scrolling; test in Task 2.
- Lenis must not capture nested table/dialog scrolling; test provider boundaries in Task 2 and Playwright behavior in Task 8.
- Existing permission-aware navigation and actions must remain unchanged; test roles in Tasks 3, 4, and 6.
- Long labels, filter values, and localized/user-entered casing must not clip or become capitalized; test in Tasks 3, 4, and 6.
- Mobile layouts must not create page-level horizontal overflow; test all critical routes in Task 8.

---

## File structure

### New files

- `src/components/motion/app-motion-provider.tsx` - Lenis lifecycle and GSAP ticker integration for the main viewport.
- `src/components/motion/page-reveal.tsx` - scoped, reduced-motion-aware page-entry animation leaf.
- `src/components/motion/__tests__/app-motion-provider.test.tsx` - lifecycle and reduced-motion coverage.
- `src/components/motion/__tests__/page-reveal.test.tsx` - animation setup and cleanup coverage.
- `tests/e2e/visual-regression.spec.ts` - authenticated desktop/mobile route and overflow checks.

### Existing files to modify

- `package.json`, `package-lock.json` - add `lenis` and `gsap`.
- `src/app/icon.ico` - exact sibling MFE favicon.
- `src/app/globals.css`, `tailwind.config.ts`, `src/app/layout.tsx` - tokens, typography, base interaction rules, metadata, and motion provider.
- `src/components/ui/*` - shared controls, panels, tables, feedback, dialogs, headings, and record lists.
- `src/components/app-shell-client.tsx`, `src/components/app-shell.tsx` - modernized MFE shell.
- Feature pages/components under `src/app/(app)` and `src/components` - screen-level composition only.
- Existing component tests under `src/components/__tests__` - regression coverage.
- `playwright.config.ts`, `tests/e2e/setup-login.spec.ts` - shared authenticated E2E foundation.

---

### Task 1: Dependency and brand asset foundation

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/app/icon.ico`
- Test: local byte comparison against `C:/Users/tuy_2/Desktop/Work/MFE-Apps/apps/dashboard/src/favicon.ico`

**Interfaces:**
- Consumes: approved spec and sibling MFE favicon.
- Produces: installed `lenis` and `gsap` packages; Next.js metadata favicon at `src/app/icon.ico`.

- [ ] **Step 1: Record the failing dependency and favicon checks**

Run: `npm ls lenis gsap` and compare hashes for the sibling favicon and `src/app/icon.ico`.

Expected: dependencies missing and/or destination favicon missing.

- [ ] **Step 2: Install the exact current compatible packages**

Run: `npm install lenis gsap`

Expected: both packages appear in dependencies without replacing the existing framework or styling stack.

- [ ] **Step 3: Copy the favicon byte-for-byte**

Use the sibling asset as the source and `src/app/icon.ico` as the destination. Do not alter the source.

- [ ] **Step 4: Verify dependency and asset outputs**

Run: `npm ls lenis gsap` and PowerShell `Get-FileHash` for both favicon files.

Expected: dependency tree resolves and SHA256 hashes match.

- [ ] **Step 5: Review checkpoint**

Run: `git diff -- package.json package-lock.json --stat` and `git status --short -- src/app/icon.ico`.

Expected: only dependency metadata and the new favicon are included in this task; do not commit.

### Task 2: Motion infrastructure with reduced-motion safety

**Files:**
- Create: `src/components/motion/app-motion-provider.tsx`
- Create: `src/components/motion/page-reveal.tsx`
- Create: `src/components/motion/__tests__/app-motion-provider.test.tsx`
- Create: `src/components/motion/__tests__/page-reveal.test.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `Lenis` from `lenis`, `gsap` from `gsap`, `prefers-reduced-motion` media query.
- Produces: `AppMotionProvider({ children }: { children: ReactNode }): JSX.Element` and `PageReveal({ children, className }: PageRevealProps): JSX.Element`.

- [ ] **Step 1: Write failing lifecycle tests**

Test names and assertions:

- `does not create Lenis when reduced motion is enabled` asserts no Lenis constructor and immediate children.
- `creates one Lenis instance and destroys it on unmount` asserts constructor once, ticker callback registration, and cleanup.
- `does not prevent scrolling from nested operational scrollers` asserts the configured `prevent` callback returns true for nodes within `[data-native-scroll]`.
- `reverts the GSAP context when page reveal unmounts` asserts scoped context cleanup.

- [ ] **Step 2: Run motion tests to verify RED**

Run: `npm test -- src/components/motion/__tests__/app-motion-provider.test.tsx src/components/motion/__tests__/page-reveal.test.tsx`

Expected: FAIL because motion components do not exist.

- [ ] **Step 3: Implement `AppMotionProvider`**

Create a client component that instantiates Lenis once, drives it through `gsap.ticker`, marks nested scrollers with `data-native-scroll`, honors reduced motion, and removes ticker callbacks plus destroys Lenis on cleanup.

- [ ] **Step 4: Implement `PageReveal`**

Create a client leaf that scopes GSAP to its own element, animates only opacity/transform, skips animation for reduced motion, and reverts context on cleanup.

- [ ] **Step 5: Integrate the provider in the root layout**

Wrap application content without moving metadata, font loading, authentication, or server data responsibilities into a client component.

- [ ] **Step 6: Run tests to verify GREEN**

Run: `npm test -- src/components/motion/__tests__/app-motion-provider.test.tsx src/components/motion/__tests__/page-reveal.test.tsx`

Expected: all motion tests pass.

- [ ] **Step 7: Review checkpoint**

Inspect the diff for strict effect cleanup, no window scroll listeners, no nested-scroll capture, and no animation outside transform/opacity; do not commit.

### Task 3: MFE token system and shared primitives

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/field.tsx`
- Modify: `src/components/ui/panel.tsx`
- Modify: `src/components/ui/table.tsx`
- Modify: `src/components/ui/feedback.tsx`
- Modify: `src/components/ui/dialog.tsx`
- Modify: `src/components/ui/confirm-dialog.tsx`
- Modify: `src/components/ui/section-heading.tsx`
- Modify: `src/components/ui/record-list.tsx`
- Modify: `src/components/modern-select.tsx`
- Test: existing related files under `src/components/__tests__`

**Interfaces:**
- Consumes: semantic Tailwind color aliases and existing component props.
- Produces: unchanged public component APIs with modernized MFE styles and complete states.

- [ ] **Step 1: Extend failing component assertions**

Add assertions for primary/secondary/danger hierarchy, visible focus hooks, loading/disabled states, native-scroll table markers, sentence-case content, and status text independent of color.

- [ ] **Step 2: Run targeted tests to verify RED**

Run: `npm test -- src/components/__tests__`

Expected: new MFE token/state assertions fail against the current classes.

- [ ] **Step 3: Replace global tokens and base rules**

Set the approved light/dark semantic colors, cool background family, radius scale, tinted elevation, focus treatment, 44px touch baseline, and reduced-motion CSS. Remove any global capitalization behavior.

- [ ] **Step 4: Restyle shared primitives without changing behavior**

Apply the approved anatomy and states. Add `data-native-scroll` to table and dialog scrolling boundaries. Keep component signatures stable unless a test proves a required accessibility prop.

- [ ] **Step 5: Restyle React Select from semantic tokens**

Preserve its value and event contract while matching control height, focus, error, disabled, menu, and dark-mode rules.

- [ ] **Step 6: Run targeted tests to verify GREEN**

Run: `npm test -- src/components/__tests__`

Expected: all component tests pass.

- [ ] **Step 7: Run contrast and class audit**

Run searches for raw brand colors outside token files, page-level `overflow-x`, `h-screen`, global `text-transform`, and raw z-index values.

Expected: approved tokens are centralized and prohibited patterns are absent from changed UI code.

- [ ] **Step 8: Review checkpoint**

Review primitive diffs for stable APIs and complete states; do not commit.

### Task 4: Authenticated shell and login

**Files:**
- Modify: `src/components/app-shell-client.tsx`
- Modify: `src/components/app-shell.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/components/login-form.tsx`
- Modify: `src/components/__tests__/app-shell-client.test.tsx`
- Modify: `src/components/__tests__/login-form.test.tsx`
- Modify: `tests/e2e/setup-login.spec.ts`

**Interfaces:**
- Consumes: `navigationForRole(role)`, shared primitives, `PageReveal`, and existing NextAuth login behavior.
- Produces: permission-aware modernized MFE shell and responsive branded login.

- [ ] **Step 1: Write failing shell/login tests**

Cover role-filtered navigation, active destination, drawer keyboard behavior, long user labels, preserved casing, password toggle naming, and loading/error states.

- [ ] **Step 2: Run tests to verify RED**

Run: `npm test -- src/components/__tests__/app-shell-client.test.tsx src/components/__tests__/login-form.test.tsx`

Expected: the new layout/state assertions fail.

- [ ] **Step 3: Implement the modernized MFE shell**

Use deep slate navigation, teal active state, workflow groups, compact/collapsed desktop state, mobile drawer, quiet top bar, and stable content frame. Preserve current permission filtering and routes.

- [ ] **Step 4: Implement the branded login**

Use the exact favicon/identity, focused split layout, current credential flow, explicit field labels, password visibility, validation, and responsive single-column fallback.

- [ ] **Step 5: Run unit tests to verify GREEN**

Run the targeted shell/login tests.

Expected: all pass.

- [ ] **Step 6: Extend and run Playwright login coverage**

Assert successful login, shell visibility, active dashboard navigation, mobile drawer open/close, and no horizontal overflow.

Expected: Playwright passes at desktop and mobile viewport projects.

- [ ] **Step 7: Review checkpoint**

Confirm no authorization, auth callback, or route behavior changed; do not commit.

### Task 5: Dashboard and license workspace

**Files:**
- Modify: `src/app/(app)/dashboard/page.tsx`
- Modify: `src/app/(app)/licenses/page.tsx`
- Modify: `src/components/license-search-toolbar.tsx`
- Modify: `src/app/(app)/licenses/loading.tsx`
- Modify: `src/app/(app)/licenses/error.tsx`
- Modify: `src/components/__tests__/license-search-toolbar.test.tsx`
- Test: `tests/e2e/visual-regression.spec.ts`

**Interfaces:**
- Consumes: `getRenewalState`, existing query parameters and permissions, shared primitives, `PageReveal`.
- Produces: exception-first dashboard and compact license data workspace with unchanged URLs/filter semantics.

- [ ] **Step 1: Write failing presentation tests**

Cover filter query preservation, reset behavior, permission-aware actions, filtered-empty state, long license names, and status text independent of color.

- [ ] **Step 2: Run targeted tests to verify RED**

Run: `npm test -- src/components/__tests__/license-search-toolbar.test.tsx src/lib/__tests__/presentation.test.ts`

Expected: new presentation assertions fail.

- [ ] **Step 3: Recompose the dashboard**

Apply compact metrics, renewal risk, permission-aware quick actions, recent licenses, MFE density, and a single scoped entry sequence without changing database queries.

- [ ] **Step 4: Recompose the license workspace**

Apply consolidated filters, visible active-filter state, deep-teal table headers, stable actions, responsive record list, and distinct empty/loading/error states. Preserve all search parameter names and filtering behavior.

- [ ] **Step 5: Run targeted tests to verify GREEN**

Run the same targeted tests.

Expected: all pass.

- [ ] **Step 6: Add authenticated Playwright assertions**

Cover dashboard headings/metrics, license filter controls, table/record-list switch, long content, and no page-level overflow at desktop and mobile widths.

- [ ] **Step 7: Review checkpoint**

Confirm Prisma queries, decrypt behavior, permissions, and URLs are unchanged; do not commit.

### Task 6: License detail, form, delete, and import

**Files:**
- Modify: `src/app/(app)/licenses/[id]/page.tsx`
- Modify: `src/app/(app)/licenses/new/page.tsx`
- Modify: `src/components/license-form.tsx`
- Modify: `src/components/license-delete-button.tsx`
- Modify: `src/app/(app)/licenses/import/page.tsx`
- Modify: `src/components/import-workbook.tsx`
- Modify: `src/components/__tests__/license-form.test.tsx`
- Modify: `src/components/__tests__/confirm-dialog.test.tsx`
- Modify: `src/components/__tests__/import-workbook.test.tsx`

**Interfaces:**
- Consumes: existing API payloads, permissions, encryption/reveal behavior, shared primitives.
- Produces: structured detail/form/import presentation with unchanged persistence and security behavior.

- [ ] **Step 1: Write failing interaction tests**

Cover field grouping, retained values on error, sticky action accessibility, masked credentials, named delete confirmation, import processing state, and imported/skipped/failed result summaries.

- [ ] **Step 2: Run tests to verify RED**

Run the three targeted component test files.

Expected: new structure/state assertions fail.

- [ ] **Step 3: Implement detail and form composition**

Place identity and renewal summary first, then general, assignment, commercial, credentials, history, and notes. Preserve all field names, payloads, authorization checks, and credential masking.

- [ ] **Step 4: Implement delete and import presentation**

Use explicit destructive confirmation and a guided import flow with current API behavior unchanged.

- [ ] **Step 5: Run tests to verify GREEN**

Run the targeted component tests.

Expected: all pass.

- [ ] **Step 6: Review checkpoint**

Audit the diff for changes to API contracts, encryption, validation, or persistence; do not commit.

### Task 7: Management, notifications, and settings

**Files:**
- Modify: `src/app/(app)/recipients/page.tsx`
- Modify: `src/app/(app)/groups/page.tsx`
- Modify: `src/app/(app)/users/page.tsx`
- Modify: `src/components/admin/recipient-form.tsx`
- Modify: `src/components/admin/group-form.tsx`
- Modify: `src/components/admin/user-invite-form.tsx`
- Modify: `src/components/admin/management-feedback.tsx`
- Modify: `src/app/(app)/notifications/page.tsx`
- Modify: `src/app/(app)/settings/email/page.tsx`
- Modify: `src/components/email-settings-form.tsx`
- Modify: `src/app/(app)/settings/lookups/page.tsx`
- Modify: `src/components/lookups-manager.tsx`
- Test: related existing component and authorization tests

**Interfaces:**
- Consumes: existing management APIs, role permissions, shared management layout and primitives.
- Produces: one consistent management/settings pattern with unchanged contracts.

- [ ] **Step 1: Write failing management tests**

Cover permission-aware actions, long names/emails without forced capitalization, inline success/error feedback, disabled/loading states, and settings authorization.

- [ ] **Step 2: Run targeted tests to verify RED**

Run management, feedback, lookup, email settings, and settings authorization tests.

Expected: new presentation assertions fail.

- [ ] **Step 3: Apply the shared management pattern**

Use consistent page headers, actions, list/table composition, dialogs, relationship counts, status labels, and empty states across recipients, groups, and users.

- [ ] **Step 4: Recompose notifications and settings**

Use compact scannable notification rows and stable settings sections with feedback next to the triggering action. Preserve sensitive-value handling.

- [ ] **Step 5: Run targeted tests to verify GREEN**

Run the targeted test files.

Expected: all pass.

- [ ] **Step 6: Review checkpoint**

Confirm request payloads, permission checks, and sensitive-field behavior are unchanged; do not commit.

### Task 8: Full Playwright matrix and release-quality verification

**Files:**
- Modify: `playwright.config.ts`
- Modify: `tests/e2e/setup-login.spec.ts`
- Create: `tests/e2e/visual-regression.spec.ts`
- Modify: `.gitignore` only if new generated artifact directories require it

**Interfaces:**
- Consumes: completed UI, local PostgreSQL container, local test admin credentials supplied through environment variables.
- Produces: repeatable Chromium desktop/mobile checks and final verification evidence.

- [ ] **Step 1: Add failing cross-route Playwright checks**

Cover login, shell navigation, dashboard, licenses, one management route, one settings route, dark mode, reduced motion, keyboard focus, and page-level overflow. Use role/label locators and no arbitrary sleeps.

- [ ] **Step 2: Run Playwright to verify RED where coverage reveals remaining gaps**

Run: `npm run test:e2e`

Expected: any remaining responsive, focus, or overflow defects fail with trace/screenshot artifacts.

- [ ] **Step 3: Fix only defects demonstrated by Playwright**

Keep changes within the owning screen or primitive and repeat the targeted test first.

- [ ] **Step 4: Run the complete verification suite**

Run in order:

1. `npm test`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run build`
5. `npm run test:e2e`

Expected: every command exits 0; all unit and Playwright tests pass.

- [ ] **Step 5: Run final design-system audits**

Verify token use, favicon hash, reduced-motion behavior, no raw scroll listeners, no prohibited animations, no page-level overflow, no hardcoded secrets, and no accidental API/schema/auth changes.

- [ ] **Step 6: Review the complete diff**

Separate pre-existing user changes from changes made by this plan. Confirm there are no commits, no pushed refs, and no deployment changes.

- [ ] **Step 7: Leave the app running locally for user testing**

Confirm the PostgreSQL container is healthy and the Next.js dev server is available at `http://localhost:3000` with the local admin account. Do not deploy.
