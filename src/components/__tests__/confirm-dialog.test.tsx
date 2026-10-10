// @vitest-environment jsdom

import React, { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

beforeAll(() => {
  vi.stubGlobal("React", React);
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
});

afterAll(() => vi.unstubAllGlobals());

let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  container?.remove();
  document.body.style.overflow = "";
  root = undefined;
  container = undefined;
});

describe("ConfirmDialog keyboard and focus behavior", () => {
  it("wraps Tab and Shift+Tab within the open dialog", async () => {
    await renderHarness();
    await click(requiredButton("Delete record"));

    const cancel = requiredButton("Cancel");
    const confirm = requiredButton("Delete Quarterly license");
    expect(document.activeElement).toBe(cancel);

    confirm.focus();
    await keyDown("Tab");
    expect(document.activeElement).toBe(cancel);

    cancel.focus();
    await keyDown("Tab", { shiftKey: true });
    expect(document.activeElement).toBe(confirm);
  });

  it("restores focus to the trigger after Escape closes the dialog", async () => {
    await renderHarness();
    const trigger = requiredButton("Delete record");
    await click(trigger);

    await keyDown("Escape");

    expect(container?.querySelector('[role="alertdialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("locks body scrolling only while the dialog is open", async () => {
    document.body.style.overflow = "clip";
    await renderHarness();

    await click(requiredButton("Delete record"));
    expect(document.body.style.overflow).toBe("hidden");

    await keyDown("Escape");
    expect(document.body.style.overflow).toBe("clip");
  });
});

function DialogHarness() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Delete record
      </button>
      <ConfirmDialog
        open={open}
        itemName="Quarterly license"
        title="Delete license?"
        description="This cannot be undone."
        onConfirm={() => undefined}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

async function renderHarness() {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(<DialogHarness />);
  });
}

function requiredButton(name: string) {
  const button = Array.from(container?.querySelectorAll("button") ?? []).find(
    (candidate) => candidate.textContent?.trim() === name,
  );
  if (!button) throw new Error(`Missing button ${name}`);
  return button;
}

async function click(button: HTMLButtonElement) {
  await act(async () => {
    button.focus();
    button.click();
    await Promise.resolve();
  });
}

async function keyDown(
  key: string,
  init: Pick<KeyboardEventInit, "shiftKey"> = {},
) {
  await act(async () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key,
        shiftKey: init.shiftKey,
        bubbles: true,
      }),
    );
    await Promise.resolve();
  });
}
