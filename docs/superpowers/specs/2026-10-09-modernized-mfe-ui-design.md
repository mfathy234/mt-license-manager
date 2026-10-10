# Modernized MFE UI Design Specification

Date: 2026-10-09

## Context and goals

Redesign the local Microtec License Manager as a cohesive operational product using the sibling `MFE-Apps` repository as its visual reference. Preserve the existing Next.js architecture, routes, authentication, authorization, encryption, APIs, Prisma schema, database behavior, and license workflows.

The result must feel recognizably Microtec without copying legacy Angular CSS verbatim. It will retain the MFE suite's teal, deep teal, slate, compact data density, and favicon while improving hierarchy, responsive behavior, accessibility, component consistency, and motion quality.

All work remains local. Do not commit, push, merge, or deploy.

## Design direction

Selected direction: **Modernized MFE**.

Design dials:

- Design variance: 4/10
- Motion intensity: 4/10
- Visual density: 7/10

The interface is structured, compact, and operational. Motion supports hierarchy and state changes but never competes with data entry or scanning.

## Design tokens and foundations

### Color

- Primary action: `#1a90b0`
- Strong emphasis and table headers: `#15738d`
- Navigation and primary slate text: `#30486d`
- Secondary slate: `#5b77a2`
- Page background: cool off-white derived from the MFE blue-gray family
- Surfaces: opaque white in light mode and opaque slate/navy in dark mode
- Borders: low-contrast blue-gray
- Danger: `#cb3f2d`
- Success and warning: restrained semantic colors that remain readable in both themes

Semantic CSS variables remain the source of truth. Feature pages must not introduce local brand colors when a token already exists.

### Typography

Use Geist and Geist Mono through `next/font`. Preserve the MFE compact scale of 12, 14, 16, 20, 24, and 32 pixels while improving hierarchy with weight and spacing.

- Page titles: 24-32px, semibold, tight tracking
- Section titles: 16-20px, semibold
- Body and controls: 14px
- Metadata: 12px
- Numeric and date columns: tabular numerals

Do not apply global capitalization. Product names, emails, and user-entered content retain their original casing.

### Shape and elevation

- Controls: 8px radius
- Standard panels: 12px radius
- Major data containers: 16px radius
- Pills: reserved for compact status only
- Shadows: restrained blue-slate tint; borders and spacing carry most hierarchy

### Theme

Light and dark modes share the same teal/slate identity. Dark mode uses opaque navy/slate surfaces and adjusted semantic colors, not simple inversion or translucent glass layers.

### Brand asset

Copy the exact favicon from `MFE-Apps/apps/dashboard/src/favicon.ico` into the Next.js application metadata location. Use that asset without redrawing or recoloring it.

## Application shell

The authenticated shell retains a left navigation because the product contains dense operational workflows.

- Deep slate/navy navigation with Microtec identity
- Teal active destination and clear hover/focus states
- Destinations grouped by workflow and filtered by existing permissions
- Collapsed desktop state with accessible labels/tooltips
- Mobile drawer with backdrop, focus trapping, Escape close, and focus restoration
- Quiet contextual top bar with current page identity
- Shared content frame with stable width and spacing

The shell remains a client boundary only where interaction requires it. Server-rendered pages continue to own data queries and permission checks.

## Component-level rules

### Buttons

- Primary: solid teal
- Secondary: slate outline or subtle blue-gray surface
- Tertiary: text/ghost treatment
- Danger: explicit red treatment
- States: default, hover, focus-visible, active, disabled, and loading
- Active state uses a subtle transform; labels never wrap at desktop widths

### Form controls

- Compact, consistent control height and spacing
- Persistent or floating labels with no placeholder-only fields
- Visible focus ring with WCAG AA contrast
- Inline help and field-level validation
- Disabled and loading states remain legible
- Password visibility buttons have unambiguous accessible names

### Panels

Do not wrap every group in a generic card. Use panels only when a boundary communicates hierarchy. Prefer whitespace, dividers, and section headings for related content within one task.

### Tables and record lists

- Deep-teal headers inspired by MFE tables
- Compact 14px body rows with stable alignment
- Sticky header for long bounded lists
- Tabular numeric and date columns
- Row hover and keyboard focus treatments
- Consistent action placement
- Responsive record-list representation below desktop width
- Horizontal scrolling stays inside the table boundary

### Status and feedback

- Status labels use text plus restrained semantic color
- Empty states explain the next available action
- Skeletons reflect final layout geometry
- Errors appear near the action or field that produced them
- Success feedback is concise and non-disruptive

### Dialogs and drawers

- Predictable header, content, and action anatomy
- Focus trap, Escape close, focus restoration, and reachable mobile actions
- Destructive confirmations name the affected record

## Screen specifications

### Login

Use a responsive split layout with the real Microtec favicon and identity, a focused sign-in form, visible labels, password visibility control, validation, and loading state. Collapse to one column on narrow screens.

### Dashboard

Prioritize exceptions and renewal risk:

- Compact metric row
- Renewal-risk workspace
- Permission-aware quick actions
- Recent license activity
- Useful empty state

No decorative charts are required.

### Licenses

Treat the list as the primary data workspace:

- Consolidated search and filter bar
- Clear active filters and reset action
- Stable table density and row actions
- Renewal state communicated with text and color
- Responsive record cards
- Distinct unfiltered-empty and filtered-empty states

### License detail and forms

- Identity and renewal summary first
- Grouped general, assignment, commercial, credential, history, and notes sections
- Credentials masked by default with existing security behavior preserved
- Sticky form actions only where they improve long-form usability
- Destructive operations retain confirmation and permissions

### Import

- Guided file selection and format instructions
- Clear processing state
- Imported, skipped, and failed summaries
- Actionable row-level validation results

### Recipients, groups, and users

Use one management pattern with consistent headers, add actions, list/table presentation, dialogs, empty states, status treatment, and contextual feedback.

### Notifications and settings

Use compact, scannable lists and stable settings sections. Place success or failure feedback beside the action that caused it. Preserve existing sensitive-value behavior.

## Motion architecture

Install and use `lenis` and `gsap`.

### Lenis

- Apply only to the main page-level content viewport
- Do not smooth table containers, dialogs, drawers, form controls, or nested operational scrollers
- Disable when reduced motion is requested
- Destroy the Lenis instance during provider cleanup

### GSAP

- Isolate animation logic in small client-only leaf components
- Use short shell, navigation, and page-entry sequences
- Animate only transform and opacity
- Avoid animating data values, table scrolling, validation messages, or destructive actions
- Scope animations with GSAP context and revert them on cleanup
- Render immediately under reduced motion

No parallax, cursor physics, infinite animation, scroll hijacking, or decorative animation is included.

## Responsive behavior

- Desktop sidebar collapses and becomes a mobile drawer
- Page headers and actions wrap without overlap
- Filters reflow into logical rows
- Forms become single-column in reading order
- Tables become responsive record lists where appropriate
- Dialog actions remain reachable within viewport height
- Minimum touch target is 44px
- Horizontal page scrolling is prohibited

## Accessibility requirements

- WCAG 2.2 AA text and control contrast
- Visible focus on every interactive element
- Keyboard-operable navigation, forms, dialogs, menus, and actions
- Semantic headings and landmarks
- Programmatic labels, descriptions, and errors
- Status is never communicated by color alone
- Reduced-motion behavior for Lenis, GSAP, and CSS transitions
- Screen-reader labels for icon-only actions

## Content and tone

Use concise, confident operational language.

- Prefer `Save license` over `Submit`
- Prefer `Connection failed. Try again.` over playful error copy
- Use sentence case
- Preserve user-entered casing
- Avoid marketing language, exclamation marks in feedback, and ambiguous labels

## Prohibited implementations

- Copying MFE Angular or PrimeNG CSS directly into the Next.js app
- Global text capitalization
- Purple editorial palette from the generic modern preset
- Multiple competing accent colors
- Glassmorphism across operational surfaces
- Cards around every content group
- Decorative GSAP animation
- Lenis on nested data or form scrollers
- Direct DOM animation without cleanup
- New backend behavior, route contracts, database changes, or permission changes
- Commit, push, merge, or deployment

## Verification and QA checklist

- Unit tests cover any changed interaction or presentation helper
- Playwright covers login, shell navigation, dashboard, license list, and responsive behavior
- Desktop and mobile layouts have no page-level horizontal overflow
- Keyboard navigation and visible focus are verified
- Dialog focus trap and restoration are verified
- Empty, loading, error, disabled, and success states are verified
- Reduced-motion mode disables smooth scrolling and sequenced animations
- Light and dark themes retain WCAG AA contrast
- Favicon matches the sibling MFE asset byte-for-byte
- Unit tests pass
- Type checking passes
- Linting passes
- Production build passes
- Playwright passes
- Final diff contains no backend, schema, authentication, or deployment changes outside previously existing user work

## Delivery boundary

The redesign is complete only when the approved screens and shared system are implemented, locally verified, and left uncommitted in the existing working tree. Nothing is pushed or deployed.
