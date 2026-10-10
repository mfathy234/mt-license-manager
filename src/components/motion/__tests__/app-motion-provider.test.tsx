// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  destroy: vi.fn(),
  lenis: vi.fn(),
  raf: vi.fn(),
  tickerAdd: vi.fn(),
  tickerRemove: vi.fn(),
}));

vi.mock("lenis", () => ({
  default: mocks.lenis.mockImplementation(function MockLenis() {
    return { destroy: mocks.destroy, raf: mocks.raf };
  }),
}));

vi.mock("gsap", () => ({
  gsap: {
    ticker: {
      add: mocks.tickerAdd,
      lagSmoothing: vi.fn(),
      remove: mocks.tickerRemove,
    },
  },
}));

import { AppMotionProvider } from "@/components/motion/app-motion-provider";

let container: HTMLDivElement;
let root: Root;
let reducedMotion = false;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: reducedMotion,
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
  reducedMotion = false;
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("AppMotionProvider", () => {
  it("does not create Lenis when reduced motion is enabled", async () => {
    reducedMotion = true;

    await renderProvider();

    expect(container.textContent).toBe("Workspace");
    expect(mocks.lenis).not.toHaveBeenCalled();
    expect(mocks.tickerAdd).not.toHaveBeenCalled();
  });

  it("creates one Lenis instance and destroys it on unmount", async () => {
    await renderProvider();

    expect(mocks.lenis).toHaveBeenCalledTimes(1);
    expect(mocks.tickerAdd).toHaveBeenCalledTimes(1);
    const tickerCallback = mocks.tickerAdd.mock.calls[0]?.[0];
    tickerCallback?.(1.25);
    expect(mocks.raf).toHaveBeenCalledWith(1250);

    await act(async () => root.unmount());

    expect(mocks.tickerRemove).toHaveBeenCalledWith(tickerCallback);
    expect(mocks.destroy).toHaveBeenCalledTimes(1);
    root = createRoot(container);
  });

  it("does not smooth scrolling from nested operational scrollers", async () => {
    await renderProvider();
    const options = mocks.lenis.mock.calls[0]?.[0] as {
      prevent?: (node: HTMLElement) => boolean;
    };
    const nativeScroller = document.createElement("div");
    nativeScroller.dataset.nativeScroll = "true";
    const nestedNode = document.createElement("span");
    nativeScroller.append(nestedNode);

    expect(options.prevent?.(nativeScroller)).toBe(true);
    expect(options.prevent?.(nestedNode)).toBe(true);
    expect(options.prevent?.(document.createElement("main"))).toBe(false);
  });
});

async function renderProvider() {
  await act(async () => {
    root.render(
      <AppMotionProvider>
        <p>Workspace</p>
      </AppMotionProvider>,
    );
  });
}
