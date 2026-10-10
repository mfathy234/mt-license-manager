// @vitest-environment jsdom

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { StatusPill } from "@/components/ui/feedback";
import { TableScroll, THead, Th } from "@/components/ui/table";

beforeAll(() => vi.stubGlobal("React", React));
afterAll(() => vi.unstubAllGlobals());

describe("modernized MFE UI primitives", () => {
  it("keeps table scrolling native and uses the MFE table header token", () => {
    const container = render(
      <TableScroll ariaLabel="Results">
        <THead>
          <tr>
            <Th>License</Th>
          </tr>
        </THead>
      </TableScroll>,
    );

    expect(container.querySelector("[data-native-scroll]")).not.toBeNull();
    expect(container.querySelector("th")?.className).toContain(
      "bg-table-header",
    );
  });

  it("marks dialog scrolling as native", () => {
    const container = render(
      <Dialog open onClose={() => undefined} ariaLabelledBy="title">
        <h2 id="title">Review</h2>
      </Dialog>,
    );

    expect(
      container.querySelector('[role="dialog"][data-native-scroll]'),
    ).not.toBeNull();
  });

  it("preserves status casing and exposes text independent of color", () => {
    const container = render(<StatusPill value="Microsoft Entra ID" />);
    const status = container.querySelector("span");

    expect(status?.textContent).toBe("Microsoft Entra ID");
    expect(status?.className).not.toContain("capitalize");
  });

  it("keeps explicit button states in the shared class contract", () => {
    const container = render(
      <Button loading disabled>
        Save license
      </Button>,
    );
    const button = container.querySelector("button");

    expect(button?.getAttribute("aria-busy")).toBe("true");
    expect(button?.hasAttribute("disabled")).toBe(true);
    expect(button?.className).toContain("focus-ring");
    expect(button?.className).toContain("bg-primary");
  });
});

function render(node: React.ReactNode) {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(node);
  return container;
}
