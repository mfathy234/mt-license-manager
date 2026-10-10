// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppShellClient } from "@/components/app-shell-client";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={String(href)} {...props}>
      {children}
    </a>
  ),
}));

let root: Root | undefined;
let container: HTMLDivElement | undefined;

beforeEach(() => {
  vi.stubGlobal("React", React);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    }),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  document.body.style.overflow = "";
});

afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  container?.remove();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  document.body.style.overflow = "";
  vi.unstubAllGlobals();
  root = undefined;
  container = undefined;
});

describe("AppShellClient", () => {
  it("renders the MFE brand asset and preserves user casing", async () => {
    await renderShell();

    expect(
      container?.querySelector('img[src="/icon.ico"][alt="Microtec"]'),
    ).not.toBeNull();
    expect(container?.textContent).toContain("Mona McDONALD");
    expect(
      container?.querySelector('[aria-current="page"]')?.textContent,
    ).toContain("Dashboard");
  });

  it("opens the mobile drawer, closes it with Escape, and restores trigger focus", async () => {
    await renderShell();
    const trigger = requiredButton("Open navigation");
    trigger.focus();

    await click(trigger);

    const drawer = container?.querySelector<HTMLElement>(
      '#application-navigation[role="dialog"]',
    );
    if (!drawer) throw new Error("Missing open navigation drawer");
    const close = drawer.querySelector<HTMLButtonElement>(
      "[data-drawer-initial-focus]",
    );
    expect(document.activeElement).toBe(close);
    expect(document.body.style.overflow).toBe("hidden");

    await keyDown("Escape");

    expect(
      container?.querySelector('#application-navigation[role="dialog"]'),
    ).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("");
  });

  it("loads the stored theme and persists the class toggle", async () => {
    localStorage.setItem("theme", "dark");
    await renderShell();

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    const themeToggle = requiredButton("Switch to light mode");
    expect(themeToggle.getAttribute("aria-pressed")).toBe("true");

    await click(themeToggle);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
    expect(
      requiredButton("Switch to dark mode").getAttribute("aria-pressed"),
    ).toBe("false");
  });
});

async function renderShell() {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      <AppShellClient
        user={{
          name: "Mona McDONALD",
          email: "mona@example.test",
          role: "admin",
        }}
      >
        <p>Workspace content</p>
      </AppShellClient>,
    );
  });
}

function requiredButton(label: string) {
  const button = container?.querySelector<HTMLButtonElement>(
    `button[aria-label="${label}"]`,
  );
  if (!button) throw new Error(`Missing button ${label}`);
  return button;
}

async function click(button: HTMLButtonElement) {
  await act(async () => {
    button.click();
    await Promise.resolve();
  });
}

async function keyDown(key: string) {
  await act(async () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key, bubbles: true }),
    );
    await Promise.resolve();
  });
}
