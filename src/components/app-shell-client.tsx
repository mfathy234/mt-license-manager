"use client";

import {
  Bell,
  ChevronsLeft,
  ChevronsRight,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Moon,
  PanelLeft,
  Settings,
  Sun,
  Upload,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/licenses", label: "Licenses", icon: KeyRound },
  { href: "/licenses/import", label: "Import", icon: Upload },
  { href: "/recipients", label: "Recipients", icon: Mail },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/users", label: "Users", icon: Users },
  { href: "/settings/email", label: "Email", icon: Settings },
  { href: "/settings/lookups", label: "Lookups", icon: Settings }
];

type AppShellClientProps = {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
};

export function AppShellClient({ children, user }: AppShellClientProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const enabled = storedTheme ? storedTheme === "dark" : prefersDark;
    setDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  function toggleDarkMode() {
    setDark((current) => {
      const next = !current;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }

  const widthClass = collapsed ? "lg:w-[88px]" : "lg:w-[276px]";

  return (
    <div className="min-h-screen">
      {mobileOpen ? (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "glass-surface fixed inset-y-3 left-3 z-40 flex w-[276px] flex-col rounded-2xl border shadow-glass transition-all duration-300",
          widthClass,
          mobileOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)] lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between gap-3 px-3">
          <Link href="/dashboard" className="focus-ring flex min-w-0 items-center gap-3 rounded-xl px-2 py-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/25">
              M
            </span>
            <span className={cn("min-w-0 transition-opacity", collapsed && "lg:pointer-events-none lg:opacity-0")}>
              <span className="block truncate text-sm font-semibold">Microtec</span>
              <span className="block truncate text-xs text-muted-foreground">License Manager</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="focus-ring hidden h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-elevated/75 text-muted-foreground transition hover:text-foreground lg:grid"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <ChevronsRight aria-hidden className="h-4 w-4" /> : <ChevronsLeft aria-hidden className="h-4 w-4" />}
          </button>
        </div>

        <nav className="grid gap-1 px-3 py-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "focus-ring group relative flex h-11 items-center gap-3 overflow-hidden rounded-xl px-3 text-sm font-medium transition",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                  collapsed && "lg:justify-center lg:px-0"
                )}
              >
                <Icon aria-hidden className="h-4 w-4 shrink-0" />
                <span className={cn("truncate transition-opacity", collapsed && "lg:pointer-events-none lg:w-0 lg:opacity-0")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto grid gap-2 p-3">
          <button
            type="button"
            onClick={toggleDarkMode}
            className={cn(
              "focus-ring flex h-11 items-center gap-3 rounded-xl border border-border bg-elevated/75 px-3 text-sm font-medium text-muted-foreground transition hover:text-foreground",
              collapsed && "lg:justify-center lg:px-0"
            )}
            title={collapsed ? "Toggle dark mode" : undefined}
          >
            {dark ? <Sun aria-hidden className="h-4 w-4 shrink-0" /> : <Moon aria-hidden className="h-4 w-4 shrink-0" />}
            <span className={cn("truncate transition-opacity", collapsed && "lg:pointer-events-none lg:w-0 lg:opacity-0")}>
              {dark ? "Light mode" : "Dark mode"}
            </span>
          </button>
          <Link
            href="/api/auth/signout"
            className={cn(
              "focus-ring flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted/80 hover:text-foreground",
              collapsed && "lg:justify-center lg:px-0"
            )}
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut aria-hidden className="h-4 w-4 shrink-0" />
            <span className={cn("truncate transition-opacity", collapsed && "lg:pointer-events-none lg:w-0 lg:opacity-0")}>Sign out</span>
          </Link>
        </div>
      </aside>

      <div className={cn("transition-[padding] duration-300 lg:pl-[300px]", collapsed && "lg:pl-[112px]")}>
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/70 px-4 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open sidebar"
                className="focus-ring grid h-10 w-10 place-items-center rounded-xl border border-border bg-elevated text-muted-foreground lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <PanelLeft aria-hidden className="h-4 w-4" />
              </button>
              <div>
                <p className="text-sm font-semibold">{user.name || user.email}</p>
                <p className="text-xs uppercase text-muted-foreground">{user.role}</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Toggle dark mode"
              className="focus-ring grid h-10 w-10 place-items-center rounded-xl border border-border bg-elevated text-muted-foreground transition hover:text-foreground"
              onClick={toggleDarkMode}
            >
              {dark ? <Sun aria-hidden className="h-4 w-4" /> : <Moon aria-hidden className="h-4 w-4" />}
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
