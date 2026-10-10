// @vitest-environment jsdom

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { ModernMultiSelect } from "@/components/modern-select";

beforeAll(() => vi.stubGlobal("React", React));
afterAll(() => vi.unstubAllGlobals());

describe("ModernMultiSelect", () => {
  it("associates its visible label with the rendered combobox", () => {
    const container = document.createElement("div");
    container.innerHTML = renderToStaticMarkup(
      <ModernMultiSelect
        label="Recipients"
        name="recipients"
        options={[{ value: "alex", label: "Alex Morgan" }]}
        selectedValues={[]}
      />,
    );

    const combobox =
      container.querySelector<HTMLInputElement>("[role=combobox]");
    expect(combobox).not.toBeNull();

    const associatedLabel = Array.from(
      container.querySelectorAll("label"),
    ).find((candidate) => candidate.htmlFor === combobox?.id);
    expect(associatedLabel?.textContent).toBe("Recipients");
  });
});
