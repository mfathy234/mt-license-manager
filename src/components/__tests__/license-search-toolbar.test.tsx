// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LicenseSearchToolbar } from "@/components/license-search-toolbar";

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  search: "q=Acme&status=Active&page=3&pageSize=25",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigation.push }),
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

let root: Root | undefined;
let container: HTMLDivElement | undefined;

beforeEach(() => {
  vi.stubGlobal("React", React);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  navigation.push.mockReset();
});

afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  container?.remove();
  document.body
    .querySelectorAll("[id^=react-select]")
    .forEach((node) => node.remove());
  vi.unstubAllGlobals();
  root = undefined;
  container = undefined;
});

describe("LicenseSearchToolbar", () => {
  it("submits, removes a chip, and resets through exact router URLs", async () => {
    await renderToolbar();
    const searchRegion = container?.querySelector<HTMLElement>(
      '[role="search"][aria-label="License search and filters"]',
    );
    if (!searchRegion) throw new Error("Missing responsive filter region");
    expect(searchRegion.textContent).toContain("Search:Acme");
    expect(searchRegion.textContent).toContain("Status:Active");
    expect(searchRegion.className).not.toContain("bg-surface-subtle");

    const query = searchRegion.querySelector<HTMLInputElement>(
      'input[type="search"]',
    );
    if (!query) throw new Error("Missing license search input");
    await changeInput(query, "Globex");
    await click(buttonNamed("Search", searchRegion));
    expect(navigation.push).toHaveBeenNthCalledWith(
      1,
      "/licenses?q=Globex&status=Active&page=1&pageSize=25",
    );

    const statusChip = searchRegion.querySelector<HTMLButtonElement>(
      'button[aria-label="Remove Status filter: Active"]',
    );
    if (!statusChip) throw new Error("Missing active status chip");
    expect(statusChip.className).toContain("rounded-md");
    expect(statusChip.className).not.toContain("rounded-full");
    await click(statusChip);
    expect(navigation.push).toHaveBeenNthCalledWith(
      2,
      "/licenses?q=Globex&page=1&pageSize=25",
    );

    await click(buttonNamed("Reset filters", searchRegion));
    expect(navigation.push).toHaveBeenNthCalledWith(3, "/licenses");
    expect(query.value).toBe("");
  });
});

async function renderToolbar() {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      <LicenseSearchToolbar
        lookupOptions={{
          status: [{ id: "active", value: "Active" }],
          serviceType: [],
          branch: [],
          renewalFrequency: [],
        }}
        adminOptions={[{ id: "admin-1", name: "Mona" }]}
      />,
    );
  });
}

function buttonNamed(name: string, within: ParentNode) {
  const button = Array.from(within.querySelectorAll("button")).find(
    (candidate) => candidate.textContent?.trim() === name,
  );
  if (!button) throw new Error(`Missing button ${name}`);
  return button;
}

async function changeInput(input: HTMLInputElement, value: string) {
  const setValue = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;
  if (!setValue) throw new Error("Missing input value setter");

  await act(async () => {
    setValue.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await Promise.resolve();
  });
}

async function click(button: HTMLButtonElement) {
  await act(async () => {
    button.click();
    await Promise.resolve();
    await Promise.resolve();
  });
}
