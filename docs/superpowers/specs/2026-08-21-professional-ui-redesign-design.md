# Professional UI Redesign Specification

Date: 2026-08-21

## Objective

Bring the authenticated `mt-license-manager` application to a cohesive, professional product standard while preserving its existing Next.js architecture, workflows, APIs, authentication, encryption, database behavior, and role permissions.

The redesign applies the proven visual language of the sibling Licensemanager project without copying it literally. It keeps Microtec's blue-and-white identity, then refines it with stronger information hierarchy, calmer surfaces, consistent controls, and responsive behavior suitable for an operational license-management system.

## Approved Scope

Included:

- Login
- Authenticated application shell and navigation
- Dashboard
- License list, create, detail, edit, credential, history, and import experiences
- Recipients, groups, and users
- Notifications
- Email settings and lookup settings
- Shared UI primitives, loading states, empty states, errors, responsive states, accessibility, and dark mode

Excluded:

- Public landing page
- Initial setup page
- Backend contracts and business rules
- Authentication, authorization, encryption, database schema, and API behavior
- New product features unrelated to presentation or usability

## Design Direction

### Character

The interface should feel precise, dependable, and operational rather than decorative. The visual system uses:

- Deep navy navigation for a stable product frame
- Cobalt blue as the primary action and focus color
- Cool neutral backgrounds and elevated white surfaces
- Restrained borders and shadows rather than heavy glass effects
- Compact, legible typography optimized for tables and forms
- Green, amber, red, and slate semantic colors with text or icon reinforcement

The result should look like one deliberate enterprise product across every screen.

### Design Tokens

Existing Tailwind and CSS-variable infrastructure remains in place. Tokens should be consolidated around these roles:

- `background`: cool off-white in light mode, near-black navy in dark mode
- `surface`: white in light mode, raised navy-gray in dark mode
- `surface-subtle`: muted blue-gray for secondary regions
- `foreground`: deep navy/slate with strong contrast
- `foreground-muted`: readable slate for supporting text
- `primary`: Microtec cobalt blue
- `primary-hover`: darker cobalt
- `border`: cool low-contrast gray-blue
- `success`, `warning`, `danger`, `info`: semantic colors used consistently
- `focus-ring`: visible cobalt ring with sufficient contrast

Use a compact radius scale and soft, low-spread shadows. Avoid stacking multiple translucent layers. Motion should be brief and functional, mainly for navigation, dialogs, menus, and state changes.

### Typography

Replace Inter with Geist for a cleaner product UI while retaining robust system fallbacks. Establish a restrained scale:

- Page title: clear but not oversized
- Section title: medium emphasis
- Body: comfortable reading size
- Table and metadata: compact with preserved legibility
- Labels: consistent weight and spacing

Tabular numerals should be used for counts, dates, and renewal data where useful.

## Application Shell

### Navigation

The desktop shell uses a deep-navy sidebar with:

- Microtec/product identity at the top
- Destinations grouped by work area
- Clear icons, labels, and active states
- Permission-aware visibility unchanged from current behavior
- A compact/collapsed state that preserves usable tooltips
- User identity, role, theme control, and sign-out placed predictably

On smaller screens, navigation becomes an accessible drawer with a backdrop, focus management, Escape-to-close behavior, and a clear menu trigger.

### Header

The contextual header is quieter than the sidebar. It provides:

- Current page title and optional description or breadcrumb
- Screen-specific primary action
- Compact utility actions where relevant

It must not duplicate navigation or compete with page content.

### Content Frame

Use a consistent maximum reading width where appropriate while allowing tables to use available space. All authenticated pages share the same horizontal padding, vertical rhythm, title placement, and action alignment.

## Screen Specifications

### Login

Use a responsive split-panel layout:

- Brand and security context on the supporting panel
- Focused login form on the primary panel
- Clear labels, password visibility control, validation, and loading state
- Trustworthy copy without marketing excess
- Single-column layout on narrow screens

Authentication behavior remains unchanged.

### Dashboard

Create a clear operations overview:

- KPI row for total licenses, active status, upcoming renewals, and urgent/expired items
- Renewal-risk area with stronger semantic emphasis
- Quick-action shortcuts based on current permissions
- Recent activity or recent licenses table with consistent status treatment
- Useful empty states when data is absent

The dashboard should prioritize decisions and exceptions, not decorative charts.

### License List

Treat the list as the main data workspace:

- Strong page header and role-appropriate primary action
- Search and filter controls grouped in a clear toolbar
- Active filters shown as removable chips with an obvious reset action
- Stable column alignment and readable density
- Sticky table header for long lists when practical
- Renewal/expiry state communicated using label, color, and icon where appropriate
- Row actions grouped consistently and keyboard accessible
- Responsive fallback that preserves essential identity, state, date, and actions
- Loading, empty, filtered-empty, and error states that explain the next step

### License Detail

Organize detail content around license identity and renewal risk:

- Summary header containing name/product, owner/customer, status, and key dates
- Important actions aligned consistently and protected by existing permissions
- Structured sections for general details, assignment, commercial dates, notes, credentials, and history
- Credentials remain masked by default and retain current security behavior
- History is chronological, scannable, and visually distinct from editable data
- Destructive actions use clear confirmation and danger styling

### License Create and Edit

Use a predictable form structure:

- Group related fields into titled sections
- Maintain consistent label, help, error, and control spacing
- Put required and optional status in clear language
- Preserve values and show field-level errors on validation failure
- Keep primary and secondary actions reliable on long forms, using a sticky action area where it improves usability
- Stack fields on small screens without changing their logical order

### Import

Present import as a compact operational workflow:

- File selection/drop area with accepted format guidance
- Template or formatting guidance near the upload control
- Clear processing state
- Result summary separating imported, skipped, and failed rows
- Actionable row-level errors without exposing internal details

Import parsing and API behavior remain unchanged.

### Recipients, Groups, and Users

Use one management pattern across all three:

- Consistent list header, search, add action, table/card behavior, and dialogs
- Role/status badges using the shared semantic system
- Clear membership or relationship counts where already available
- Empty states with permission-aware actions
- Destructive actions confirmed and visually differentiated

### Notifications

Improve scanning and urgency:

- Unread state visible through more than color alone
- Type, license context, time, and action aligned consistently
- Filters or tabs retain current behavior but use the shared control system
- Bulk or mark-read actions provide immediate feedback
- Empty state distinguishes no notifications from no matching notifications

### Email and Lookup Settings

Settings use a stable section layout:

- Clear section descriptions and save boundaries
- Existing values, validation, and test actions presented consistently
- Sensitive values treated according to current security behavior
- Lookup collections use compact management rows with clear add, edit, reorder, and delete affordances where those capabilities already exist
- Success and failure feedback appears near the action that caused it

## Shared Component System

Existing primitives should be refined and reused instead of introducing a parallel component library. The shared set should cover:

- Buttons and icon buttons
- Inputs, text areas, selects, date controls, and multi-selects
- Cards and section containers
- Tables and responsive record cards
- Status badges and filter chips
- Dialogs, menus, tooltips, and confirmation states
- Alerts, toasts, inline errors, and success feedback
- Skeletons, spinners, empty states, and error states

Variants must have a clear purpose. Pages should not invent local colors, radii, or shadows when a shared token or primitive exists.

## Responsive Behavior

Target desktop, tablet, and mobile layouts:

- Sidebar collapses and then becomes a drawer
- Page actions wrap without overlapping titles
- Filter toolbars collapse into logical rows or panels
- Tables preserve essential fields and expose secondary detail accessibly
- Dialogs respect viewport height and retain reachable actions
- Forms become single-column in logical reading order
- Tap targets remain comfortably sized

Horizontal page scrolling should be avoided. A table may scroll within its own clearly bounded region when necessary.

## Accessibility

The redesign must preserve or improve:

- WCAG AA text and control contrast
- Visible keyboard focus on every interactive element
- Semantic headings and labels
- Programmatic form errors and descriptions
- Keyboard-operable dialogs, menus, tabs, and navigation
- Meaningful icon labels and tooltips
- Status communication that does not rely only on color
- Reduced-motion preferences

## Dark Mode

Dark mode remains a first-class variant. It should use opaque navy/slate surfaces, readable muted text, restrained borders, and adjusted semantic colors. Light-mode values must not simply be inverted, and all states must retain sufficient contrast.

## Preservation and Implementation Boundaries

The implementation will:

- Work within the existing Next.js, React, Tailwind, and component structure
- Refactor shared visual primitives where that reduces page-level duplication
- Preserve route paths, API payloads, server actions, permissions, and database access
- Preserve encryption and credential reveal behavior
- Leave the landing and setup pages unchanged
- Avoid adding unnecessary dependencies

If an existing UI defect reveals a backend defect, it will be documented separately rather than silently changing business behavior as part of the redesign.

## Verification

Implementation is complete only after proportionate verification:

- Tests are added or updated for changed interactive behavior
- Existing unit tests pass
- Type checking passes
- Linting passes
- Production build passes
- Key authenticated routes render without runtime errors
- Login, navigation, license CRUD presentation, import presentation, notifications, users/groups/recipients, and settings are checked at desktop and mobile widths
- Keyboard focus, dialog behavior, form errors, dark mode, and empty/loading/error states are checked
- Final diff is reviewed for accidental backend, auth, schema, or landing/setup changes

## Delivery Constraint

All work remains local. No commit or push will be performed unless the user explicitly requests it later.
