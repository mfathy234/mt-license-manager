"use client";

import {
  Bell,
  ChevronsLeft,
  ChevronsRight,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Moon,
  Settings,
  Sun,
  UserCog,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { navigationForRole } from "@/lib/presentation";
import { cn } from "@/lib/utils";
import { PageReveal } from "@/components/motion/page-reveal";

const navigationIcons: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/licenses": KeyRound,
  "/notifications": Bell,
  "/recipients": Mail,
  "/groups": Users,
  "/users": UserCog,
  "/settings/email": Mail,
  "/settings/lookups": Settings,
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type AppShellClientProps = {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role: "admin" | "editor" | "viewer";
  };
};

export function AppShellClient({ children, user }: AppShellClientProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const wasMobileOpen = useRef(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const enabled = storedTheme ? storedTheme === "dark" : prefersDark;
    setDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      drawerRef.current
        ?.querySelector<HTMLElement>("[data-drawer-initial-focus]")
        ?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusableElements = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => element.offsetParent !== null);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (wasMobileOpen.current && !mobileOpen) {
      mobileMenuButtonRef.current?.focus();
    }
    wasMobileOpen.current = mobileOpen;
  }, [mobileOpen]);

  useEffect(() => {
    const desktopViewport = window.matchMedia("(min-width: 1024px)");

    function closeDrawerAtDesktop(event: MediaQueryListEvent) {
      if (event.matches) setMobileOpen(false);
    }

    desktopViewport.addEventListener("change", closeDrawerAtDesktop);
    return () =>
      desktopViewport.removeEventListener("change", closeDrawerAtDesktop);
  }, []);

  function toggleDarkMode() {
    setDark((current) => {
      const next = !current;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }

  const navigation = navigationForRole(user.role);
  const userLabel = user.name || user.email || "Signed-in user";
  const userInitial =
    (user.name || user.email || "U").trim().charAt(0).toUpperCase() || "U";
  const widthClass = collapsed ? "lg:w-16" : "lg:w-60";

  let pageTitle = "License Manager";

  if (pathname === "/dashboard") {
    pageTitle = "Dashboard";
  } else if (pathname === "/licenses/import") {
    pageTitle = "Import licenses";
  } else if (pathname === "/licenses/new") {
    pageTitle = "New license";
  } else if (pathname.endsWith("/edit") && pathname.startsWith("/licenses/")) {
    pageTitle = "Edit license";
  } else if (pathname.startsWith("/licenses/")) {
    pageTitle = "License details";
  } else if (pathname === "/licenses") {
    pageTitle = "Licenses";
  } else if (pathname === "/recipients") {
    pageTitle = "Recipients";
  } else if (pathname === "/groups") {
    pageTitle = "Groups";
  } else if (pathname === "/notifications") {
    pageTitle = "Notifications";
  } else if (pathname === "/users") {
    pageTitle = "Users";
  } else if (pathname === "/settings/email") {
    pageTitle = "Email settings";
  } else if (pathname === "/settings/lookups") {
    pageTitle = "Lookups";
  }

  const itemBase =
    "focus-ring flex items-center gap-2.5 rounded-md text-sm font-medium ring-offset-sidebar transition-[background-color,color] duration-150";

  return (
    <div className="min-h-[100dvh] bg-background">
      {mobileOpen ? (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close navigation"
          className="fixed inset-0 z-backdrop animate-fade-in bg-slate-950/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        ref={drawerRef}
        id="application-navigation"
        role={mobileOpen ? "dialog" : undefined}
        aria-modal={mobileOpen || undefined}
        aria-label="Application navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-modal w-[min(88vw,280px)] flex-col border-r border-sidebar-edge bg-sidebar text-sidebar-foreground shadow-popover transition-[width,transform] duration-200 ease-out-quart lg:z-sticky lg:flex lg:translate-x-0 lg:shadow-none",
          widthClass,
          mobileOpen ? "flex translate-x-0" : "hidden -translate-x-full",
        )}
      >
        <div className="relative flex h-14 shrink-0 items-center border-b border-sidebar-edge px-3">
          <Link
            href="/dashboard"
            className={cn(
              "focus-ring flex min-w-0 flex-1 items-center gap-2.5 rounded-md py-1.5 ring-offset-sidebar",
              collapsed && "lg:justify-center",
            )}
            onClick={() => setMobileOpen(false)}
            aria-label={collapsed ? "Microtec License Manager" : undefined}
            title={collapsed ? "Microtec License Manager" : undefined}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-md bg-white">
              {/* The MFE favicon is the canonical Microtec product mark. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.ico" alt="Microtec" className="h-full w-full" />
            </span>
            <span
              className={cn(
                "min-w-0 leading-tight transition-opacity duration-150",
                collapsed && "lg:pointer-events-none lg:w-0 lg:opacity-0",
              )}
            >
              <span className="block truncate text-sm font-semibold text-white">
                Microtec
              </span>
              <span className="block truncate text-xs text-sidebar-foreground/60">
                License Manager
              </span>
            </span>
          </Link>

          <button
            type="button"
            data-drawer-initial-focus
            aria-label="Close navigation"
            className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-md text-sidebar-foreground/70 ring-offset-sidebar transition-colors duration-150 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X aria-hidden className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            aria-expanded={!collapsed}
            aria-controls="primary-navigation"
            title={collapsed ? "Expand navigation" : "Collapse navigation"}
            className={cn(
              "focus-ring absolute hidden h-7 w-7 place-items-center rounded-md text-sidebar-foreground/70 ring-offset-sidebar transition-colors duration-150 hover:bg-white/10 hover:text-white lg:grid",
              collapsed
                ? "-right-3.5 top-3.5 border border-white/10 bg-sidebar"
                : "right-3 top-3.5",
            )}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? (
              <ChevronsRight aria-hidden className="h-4 w-4" />
            ) : (
              <ChevronsLeft aria-hidden className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav
          id="primary-navigation"
          aria-label="Primary navigation"
          className="min-h-0 flex-1 overflow-y-auto px-2 py-3"
        >
          {navigation.map((group, groupIndex) => (
            <div key={group.label} className={cn(groupIndex > 0 && "mt-4")}>
              <p
                className={cn(
                  "mb-1 px-2.5 text-xs font-medium text-sidebar-icon/70",
                  collapsed && "lg:sr-only",
                )}
              >
                {group.label}
              </p>
              <div className="grid gap-0.5">
                {group.items.map((item) => {
                  const Icon = navigationIcons[item.href] || KeyRound;
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(`${item.href}/`));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      aria-label={collapsed ? item.label : undefined}
                      title={collapsed ? item.label : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        itemBase,
                        "group relative min-h-11 px-2.5 lg:min-h-8",
                        active
                          ? "bg-sidebar-active text-white"
                          : "text-sidebar-foreground hover:bg-white/10",
                        collapsed && "lg:justify-center lg:px-0",
                      )}
                    >
                      {active ? (
                        <span
                          aria-hidden
                          className="absolute inset-y-0 left-0 w-1 rounded-l-md bg-sidebar-edge"
                        />
                      ) : null}
                      <Icon
                        aria-hidden
                        className={cn(
                          "h-4 w-4 shrink-0 text-sidebar-icon",
                        )}
                      />
                      <span
                        className={cn(
                          "truncate",
                          collapsed &&
                            "lg:pointer-events-none lg:w-0 lg:opacity-0",
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="relative z-sticky shrink-0 border-t border-sidebar-edge bg-sidebar p-2">
          <div
            className={cn(
              "flex min-w-0 items-center gap-2",
              collapsed && "lg:flex-col",
            )}
            title={collapsed ? `${userLabel} (${user.role})` : undefined}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-semibold text-white">
              {userInitial}
            </span>
            <span
              className={cn(
                "min-w-0 flex-1 leading-tight",
                collapsed && "lg:hidden",
              )}
            >
              <span className="block truncate text-[13px] font-medium text-white">
                {userLabel}
              </span>
              <span className="block truncate text-xs capitalize text-sidebar-foreground/60">
                {user.role}
              </span>
            </span>
            <div
              className={cn(
                "flex shrink-0 items-center",
                collapsed && "lg:flex-col",
              )}
            >
              <button
                type="button"
                onClick={toggleDarkMode}
                aria-label={
                  dark ? "Switch to light mode" : "Switch to dark mode"
                }
                aria-pressed={dark}
                title={dark ? "Switch to light mode" : "Switch to dark mode"}
                className={cn(
                  itemBase,
                  "h-10 w-10 justify-center text-sidebar-foreground/75 hover:bg-white/10 hover:text-white lg:h-8 lg:w-8",
                )}
              >
                {dark ? (
                  <Sun aria-hidden className="h-4 w-4" />
                ) : (
                  <Moon aria-hidden className="h-4 w-4" />
                )}
              </button>
              <Link
                href="/api/auth/signout"
                aria-label="Sign out"
                title="Sign out"
                className={cn(
                  itemBase,
                  "h-10 w-10 justify-center text-sidebar-foreground/75 hover:bg-white/10 hover:text-white lg:h-8 lg:w-8",
                )}
              >
                <LogOut aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </aside>

      <div
        className={cn(
          "min-h-[100dvh] min-w-0 transition-[margin,width] duration-200 ease-out-quart lg:ml-60 lg:w-[calc(100%-15rem)]",
          collapsed && "lg:ml-16 lg:w-[calc(100%-4rem)]",
        )}
      >
        <header className="sticky top-0 z-sticky flex h-12 items-center gap-2 border-b border-border bg-surface px-2 lg:hidden">
          <button
            ref={mobileMenuButtonRef}
            type="button"
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            aria-controls="application-navigation"
            className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-md text-foreground-muted transition-colors duration-150 hover:bg-muted hover:text-foreground"
            onClick={() => setMobileOpen(true)}
          >
            <Menu aria-hidden className="h-5 w-5" />
          </button>
          <p className="min-w-0 truncate text-sm font-semibold text-foreground">
            {pageTitle}
          </p>
        </header>
        <main className="min-w-0 w-full p-4 lg:px-8 lg:py-6 2xl:px-10">
          <PageReveal>{children}</PageReveal>
        </main>
      </div>
    </div>
  );
}
