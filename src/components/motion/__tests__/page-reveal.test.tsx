// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  context: vi.fn(),
  fromTo: vi.fn(),
  revert: vi.fn(),
}));

vi.mock("gsap", () => ({
  gsap: {
    context: mocks.context.mockImplementation((callback: () => void) => {
      callback();
      return { revert: mocks.revert };
    }),
    fromTo: mocks.fromTo,
  },
}));

import { PageReveal } from "@/components/motion/page-reveal";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("PageReveal", () => {
  it("reverts the GSAP context when page reveal unmounts", async () => {
    await act(async () => {
      root.render(<PageReveal>Content</PageReveal>);
    });

    expect(mocks.context).toHaveBeenCalledTimes(1);
    expect(mocks.fromTo).toHaveBeenCalledWith(
      expect.anything(),
      { opacity: 0, y: 12 },
      expect.objectContaining({ opacity: 1, y: 0 }),
    );

    await act(async () => root.unmount());

    expect(mocks.revert).toHaveBeenCalledTimes(1);
    root = createRoot(container);
  });
});
