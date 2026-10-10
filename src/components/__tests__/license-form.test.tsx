// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AppRouterContext,
  type AppRouterInstance,
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { LicenseForm } from "@/components/license-form";
import { toLicenseFormValues } from "@/lib/license-secure";

const router: AppRouterInstance = {
  back() {},
  forward() {},
  refresh() {},
  push() {},
  replace() {},
  prefetch() {},
};

const license = {
  id: "license-1",
  details: "Design suite",
  status: "Active",
  serviceType: "Subscription",
  branch: "Cairo",
  vendor: "Vendor Co",
  ownerAccount: "Finance",
  adminIds: ["admin-1"],
  usersCount: 25,
  startDate: "2026-01-15",
  expiryDate: "2027-01-15",
  paymentMethod: "Card",
  renewalFrequency: "Yearly",
  monthlyCostEgp: "100.5",
  yearlyCostEgp: "1200",
  fiveYearsCostEgp: "6000",
  monthlyCostUsd: "10.25",
  yearlyCostUsd: "120",
  fiveYearsCostUsd: "600",
  notes: "Renew in January",
};

const adminOptions = [{ id: "admin-1", name: "Mona" }];
const lookupOptions = {
  status: [{ id: "status-active", value: "Active" }],
  serviceType: [{ id: "service-subscription", value: "Subscription" }],
  branch: [{ id: "branch-cairo", value: "Cairo" }],
  paymentMethod: [{ id: "payment-card", value: "Card" }],
  renewalFrequency: [{ id: "renewal-yearly", value: "Yearly" }],
};

beforeAll(() => {
  vi.stubGlobal("React", React);
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
});

afterAll(() => vi.unstubAllGlobals());

let mountedRoot: Root | undefined;
let mountedContainer: HTMLDivElement | undefined;

afterEach(async () => {
  if (mountedRoot) {
    await act(async () => mountedRoot?.unmount());
  }
  mountedContainer?.remove();
  mountedRoot = undefined;
  mountedContainer = undefined;
});

describe("LicenseForm", () => {
  it("renders every form name and initial value with Cancel before Save", () => {
    const container = renderForm(license);
    const expectedValues: Record<string, string[]> = {
      details: ["Design suite"],
      status: ["Active"],
      serviceType: ["Subscription"],
      branch: ["Cairo"],
      vendor: ["Vendor Co"],
      ownerAccount: ["Finance"],
      adminIds: ["admin-1"],
      usersCount: ["25"],
      startDate: ["2026-01-15"],
      expiryDate: ["2027-01-15"],
      paymentMethod: ["Card"],
      renewalFrequency: ["Yearly"],
      monthlyCostEgp: ["100.5"],
      yearlyCostEgp: ["1200"],
      fiveYearsCostEgp: ["6000"],
      monthlyCostUsd: ["10.25"],
      yearlyCostUsd: ["120"],
      fiveYearsCostUsd: ["600"],
      notes: ["Renew in January"],
    };

    expect(Object.keys(expectedValues)).toHaveLength(19);
    for (const [name, expected] of Object.entries(expectedValues)) {
      const actual = Array.from(
        container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
          `[name="${name}"]`,
        ),
      ).map((element) => element.value);
      expect(actual, name).toEqual(expected);
    }

    const actionLabels = Array.from(container.querySelectorAll("button"))
      .map((button) => button.textContent?.trim())
      .filter((label) => label === "Cancel" || label === "Save license");
    expect(actionLabels).toEqual(["Cancel", "Save license"]);
  });

  it("does not render encrypted server values passed through the client boundary", () => {
    const clientValues = toLicenseFormValues({
      ...license,
      encryptedData: {
        cipher: "never-render-cipher",
        iv: "never-render-iv",
        tag: "never-render-tag",
      },
      credentials: [{ passwordCipher: "never-render-password" }],
    });
    const markup = renderToStaticMarkup(formElement(clientValues));

    expect(markup).not.toContain("never-render");
    expect(clientValues).not.toHaveProperty("encryptedData");
    expect(clientValues).not.toHaveProperty("credentials");
  });

  it("associates and focuses the details error after invalid submission", async () => {
    mountedContainer = document.createElement("div");
    document.body.append(mountedContainer);
    mountedRoot = createRoot(mountedContainer);

    await act(async () => {
      mountedRoot?.render(formElement({ ...license, details: "" }));
    });

    const form = mountedContainer.querySelector("form");
    const details = mountedContainer.querySelector<HTMLInputElement>(
      'input[name="details"]',
    );
    expect(form).not.toBeNull();
    expect(details?.getAttribute("aria-invalid")).toBeNull();

    await act(async () => form?.requestSubmit());

    const errorId = details?.getAttribute("aria-describedby");
    expect(details?.getAttribute("aria-invalid")).toBe("true");
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId ?? "")?.textContent).toBe(
      "Details are required.",
    );
    expect(document.activeElement).toBe(details);
  });
});

function renderForm(values: Record<string, unknown>) {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(formElement(values));
  return container;
}

function formElement(values: Record<string, unknown>) {
  return (
    <AppRouterContext.Provider value={router}>
      <LicenseForm
        action="update"
        license={values}
        adminOptions={adminOptions}
        lookupOptions={lookupOptions}
      />
    </AppRouterContext.Provider>
  );
}
