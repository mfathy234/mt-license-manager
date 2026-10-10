// @vitest-environment jsdom

import React, { act } from "react";
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

import {
  ManagementFeedback,
  publishManagementSuccess,
} from "@/components/admin/management-feedback";

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
  root = undefined;
  container = undefined;
  sessionStorage.clear();
});

describe("ManagementFeedback", () => {
  it("announces a stored deletion success after the deleted row is removed", async () => {
    publishManagementSuccess("recipients", "Recipient deleted.");
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<ManagementFeedback scope="recipients" />);
    });

    const status = container.querySelector('[role="status"]');
    expect(status?.textContent).toBe("Recipient deleted.");
  });
});
