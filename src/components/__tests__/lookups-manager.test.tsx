// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  AppRouterContext,
  type AppRouterInstance,
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { LookupsManager } from "@/components/lookups-manager";

const fetchMock = vi.fn<typeof fetch>();

const router: AppRouterInstance = {
  back() {},
  forward() {},
  refresh() {},
  push() {},
  replace() {},
  prefetch() {},
};

const initialValues = [
  {
    id: "status-pending",
    category: "status",
    value: "Pending",
    sortOrder: 0,
    active: true,
  },
  {
    id: "status-sent",
    category: "status",
    value: "Sent",
    sortOrder: 10,
    active: true,
  },
  {
    id: "branch-cairo",
    category: "branch",
    value: "Cairo",
    sortOrder: 0,
    active: true,
  },
];

beforeAll(() => {
  vi.stubGlobal("React", React);
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
});

afterAll(() => vi.unstubAllGlobals());

let root: Root | undefined;
let container: HTMLDivElement | undefined;

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(successResponse());
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
});

describe("LookupsManager", () => {
  it("identifies the lookup value and collection in repeated actions", async () => {
    await renderManager();

    expect(
      container?.querySelector(
        'button[aria-label="Edit lookup value Pending"]',
      ),
    ).not.toBeNull();
    expect(
      container?.querySelector('button[aria-label="Add value to Status"]'),
    ).not.toBeNull();
    expect(
      container?.querySelector('button[aria-label="Add value to Branch"]'),
    ).not.toBeNull();
  });

  it("adds a lookup with the exact POST payload and category-local feedback", async () => {
    await renderManager();
    const statusSection = sectionNamed("Status");
    const branchSection = sectionNamed("Branch");
    await click(buttonNamed("Add value", statusSection));

    const dialog = requiredDialog();
    requiredInput("value", dialog).value = "Archived";
    requiredInput("sortOrder", dialog).value = "12";
    await submit(requiredForm(dialog));

    expectRequest(0, "/api/settings/lookups", "POST", {
      category: "status",
      value: "Archived",
      sortOrder: 12,
      active: true,
    });
    expect(statusSection.querySelector('[role="status"]')?.textContent).toBe(
      "Lookup added.",
    );
    expect(branchSection.querySelector('[role="status"]')).toBeNull();
  });

  it("edits a lookup with the exact PATCH payload and method", async () => {
    await renderManager();
    const pendingRow = rowContaining("Pending");
    await click(buttonNamed("Edit", pendingRow));

    const dialog = requiredDialog();
    requiredInput("value", dialog).value = "Waiting";
    requiredInput("sortOrder", dialog).value = "3";
    requiredInput("active", dialog).checked = false;
    await submit(requiredForm(dialog));

    expectRequest(0, "/api/settings/lookups/status-pending", "PATCH", {
      category: "status",
      value: "Waiting",
      sortOrder: 3,
      active: false,
    });
    expect(
      sectionNamed("Status").querySelector('[role="status"]')?.textContent,
    ).toBe("Lookup updated.");
  });

  it("reorders within a category through the exact bulk PUT contract", async () => {
    await renderManager();
    const moveDown = container?.querySelector<HTMLButtonElement>(
      '[aria-label="Move Pending down"]',
    );
    if (!moveDown) throw new Error("Missing reorder button");

    await click(moveDown);

    expectRequest(0, "/api/settings/lookups", "PUT", {
      values: [
        {
          id: "status-sent",
          category: "status",
          value: "Sent",
          sortOrder: 0,
          active: true,
        },
        {
          id: "status-pending",
          category: "status",
          value: "Pending",
          sortOrder: 1,
          active: true,
        },
      ],
    });
    expect(
      sectionNamed("Status").querySelector('[role="status"]')?.textContent,
    ).toBe("Lookup order updated.");
    expect(sectionNamed("Branch").querySelector('[role="status"]')).toBeNull();
  });

  it("keeps a rejected save visible after busy dismissal attempts", async () => {
    let resolveRequest: ((response: Response) => void) | undefined;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    await renderManager();
    const editTrigger = buttonNamed("Edit", rowContaining("Pending"));
    await click(editTrigger);

    const dialog = requiredDialog();
    requiredInput("value", dialog).value = "Waiting";
    await submit(requiredForm(dialog));

    const closeButton = dialog.querySelector<HTMLButtonElement>(
      'button[aria-label="Close"]',
    );
    if (!closeButton) throw new Error("Missing close button");
    const backdrop = dialog.parentElement;
    if (!backdrop) throw new Error("Missing dialog backdrop");
    expect(closeButton.disabled).toBe(true);

    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
      closeButton.click();
      backdrop.dispatchEvent(new Event("pointerdown", { bubbles: true }));
      resolveRequest?.(
        new Response(JSON.stringify({ error: "Lookup service unavailable." }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }),
      );
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    const retainedDialog = requiredDialog();
    expect(closeButton.disabled).toBe(false);
    expect(retainedDialog.querySelector('[role="alert"]')?.textContent).toBe(
      "Lookup service unavailable.",
    );
    expect(document.activeElement).not.toBe(editTrigger);
  });
});

async function renderManager() {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      <AppRouterContext.Provider value={router}>
        <LookupsManager initialValues={initialValues} />
      </AppRouterContext.Provider>,
    );
  });
}

function sectionNamed(name: string) {
  const heading = Array.from(container?.querySelectorAll("h3") ?? []).find(
    (candidate) => candidate.textContent === name,
  );
  const section = heading?.closest("section");
  if (!section) throw new Error(`Missing section ${name}`);
  return section;
}

function rowContaining(value: string) {
  const row = Array.from(container?.querySelectorAll("li") ?? []).find(
    (candidate) => candidate.textContent?.includes(value),
  );
  if (!row) throw new Error(`Missing row ${value}`);
  return row;
}

function buttonNamed(name: string, within: ParentNode) {
  const button = Array.from(within.querySelectorAll("button")).find(
    (candidate) => candidate.textContent?.trim() === name,
  );
  if (!button) throw new Error(`Missing button ${name}`);
  return button;
}

function requiredDialog() {
  const dialog = container?.querySelector<HTMLElement>('[role="dialog"]');
  if (!dialog) throw new Error("Missing lookup dialog");
  return dialog;
}

function requiredForm(within: ParentNode) {
  const form = within.querySelector("form");
  if (!form) throw new Error("Missing form");
  return form;
}

function requiredInput(name: string, within: ParentNode) {
  const input = within.querySelector<HTMLInputElement>(`[name="${name}"]`);
  if (!input) throw new Error(`Missing input ${name}`);
  return input;
}

async function click(button: HTMLButtonElement) {
  await act(async () => {
    button.click();
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function submit(form: HTMLFormElement) {
  await act(async () => {
    form.requestSubmit();
    await Promise.resolve();
    await Promise.resolve();
  });
}

function successResponse() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function expectRequest(
  index: number,
  url: string,
  method: string,
  body: Record<string, unknown>,
) {
  const [actualUrl, init] = fetchMock.mock.calls[index] ?? [];
  expect(actualUrl).toBe(url);
  expect(init?.method).toBe(method);
  expect(JSON.parse(String(init?.body))).toEqual(body);
}
