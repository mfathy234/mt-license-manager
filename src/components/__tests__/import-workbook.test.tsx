// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ImportWorkbook } from "@/components/import-workbook";

const framework = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: framework.refresh }),
}));
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

const preview = {
  filename: "licenses.xlsx",
  rowCount: 2,
  rows: [{ details: "Endpoint protection" }, { details: "Design suite" }],
  lookups: [{ category: "status", value: "Active" }],
};

const fetchMock = vi.fn<typeof fetch>();
const NativeFormData = FormData;
let root: Root | undefined;
let container: HTMLDivElement | undefined;

beforeEach(() => {
  vi.stubGlobal("React", React);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  fetchMock.mockReset();
  framework.refresh.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal(
    "FormData",
    class FormDataWithSelectedFiles extends NativeFormData {
      constructor(form?: HTMLFormElement) {
        super();
        if (!form) return;

        for (const input of form.querySelectorAll<HTMLInputElement>(
          'input[type="file"][name]',
        )) {
          const file = input.files?.[0];
          if (file) this.append(input.name, file);
        }
      }
    },
  );
});

afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  container?.remove();
  vi.unstubAllGlobals();
  root = undefined;
  container = undefined;
});

describe("ImportWorkbook", () => {
  it("moves from selection through preview and confirmation, then resets", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(preview))
      .mockResolvedValueOnce(jsonResponse({ batch: { rowCount: 2 } }));
    await renderImport();
    expect(container?.textContent).toContain("Choose a workbook");

    const file = new File(["workbook"], "licenses.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const fileInput = requiredInput("file");
    await selectFile(fileInput, file);
    expect(container?.textContent).toContain("Selected: licenses.xlsx");

    await submit(requiredForm(fileInput));

    expect(container?.textContent).toContain("Review import");
    expect(container?.textContent).toContain("2 rows ready to import");
    const [previewUrl, previewInit] = fetchMock.mock.calls[0] ?? [];
    expect(previewUrl).toBe("/api/import/preview");
    expect(previewInit?.method).toBe("POST");
    const previewBody = previewInit?.body;
    expect(previewBody).toBeInstanceOf(FormData);
    expect(Array.from((previewBody as FormData).keys())).toEqual(["file"]);
    expect(((previewBody as FormData).get("file") as File).name).toBe(
      "licenses.xlsx",
    );

    await click(buttonNamed("Confirm import"));

    expectRequest(1, "/api/import/confirm", "POST", preview);
    expect(container?.textContent).toContain("Import complete");
    expect(container?.textContent).toContain("2 rows were imported");
    expect(framework.refresh).toHaveBeenCalledOnce();

    await click(buttonNamed("Import another workbook"));

    expect(container?.textContent).toContain("Choose a workbook");
    expect(container?.textContent).not.toContain("Selected: licenses.xlsx");
    expect(requiredInput("file").value).toBe("");
  });
});

async function renderImport() {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(<ImportWorkbook />);
  });
}

function requiredInput(name: string) {
  const input = container?.querySelector<HTMLInputElement>(`[name="${name}"]`);
  if (!input) throw new Error(`Missing input ${name}`);
  return input;
}

function requiredForm(input: HTMLInputElement) {
  if (!input.form) throw new Error("Missing import form");
  return input.form;
}

function buttonNamed(name: string) {
  const button = Array.from(container?.querySelectorAll("button") ?? []).find(
    (candidate) => candidate.textContent?.trim() === name,
  );
  if (!button) throw new Error(`Missing button ${name}`);
  return button;
}

async function selectFile(input: HTMLInputElement, file: File) {
  Object.defineProperty(input, "files", {
    configurable: true,
    value: [file],
  });
  await act(async () => {
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await Promise.resolve();
  });
}

async function submit(form: HTMLFormElement) {
  await act(async () => {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function click(button: HTMLButtonElement) {
  await act(async () => {
    button.click();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
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
