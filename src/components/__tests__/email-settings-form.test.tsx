// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
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

import { EmailSettingsForm } from "@/components/email-settings-form";

const fetchMock = vi.fn<typeof fetch>();

const settingsWithCipher = {
  host: "smtp.example.test",
  port: 465,
  secure: true,
  username: "mailer",
  fromName: "License Desk",
  fromEmail: "licenses@example.test",
  passwordCipher: "never-send-ciphertext",
};

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

describe("EmailSettingsForm", () => {
  it("shows first-time password guidance when no SMTP password is saved", async () => {
    await renderForm(false);

    expect(container?.textContent).toContain(
      "Enter the SMTP password to complete initial setup.",
    );
    expect(container?.textContent).not.toContain(
      "Leave blank to keep the existing password.",
    );
  });

  it("offers to preserve a saved SMTP password without exposing it", async () => {
    await renderForm(true);

    expect(container?.textContent).toContain(
      "Leave blank to keep the existing password.",
    );
    expect(container?.textContent).not.toContain("never-send-ciphertext");
  });

  it("saves SMTP settings even when the test recipient is invalid", async () => {
    await renderForm();
    const testRecipient = requiredInput("testTo");
    const saveButton = buttonNamed("Save settings");
    testRecipient.value = "not-an-email";

    await click(saveButton);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/settings/email");
  });

  it("submitting the test form sends only the recipient and keeps feedback local", async () => {
    await renderForm();
    const saveButton = buttonNamed("Save settings");
    const testButton = buttonNamed("Send test");
    const testRecipient = requiredInput("testTo");
    testRecipient.value = "operator@example.test";

    await submit(testRecipient.form);

    expect(saveButton.form).not.toBe(testButton.form);
    expectRequest(0, "/api/settings/email/test", "POST", {
      to: "operator@example.test",
    });
    expect(testButton.form?.querySelector('[role="status"]')?.textContent).toBe(
      "Test email sent to operator@example.test.",
    );
    expect(saveButton.form?.querySelector('[role="status"]')).toBeNull();
  });

  it("sends the exact settings payload without blank passwords or server ciphertext", async () => {
    await renderForm();
    const saveButton = buttonNamed("Save settings");
    const testButton = buttonNamed("Send test");

    await click(saveButton);

    expectRequest(0, "/api/settings/email", "PUT", {
      host: "smtp.example.test",
      port: 465,
      secure: true,
      username: "mailer",
      fromName: "License Desk",
      fromEmail: "licenses@example.test",
    });
    const requestBody = String(fetchMock.mock.calls[0]?.[1]?.body);
    expect(requestBody).not.toContain("password");
    expect(requestBody).not.toContain("never-send-ciphertext");
    expect(saveButton.form?.querySelector('[role="status"]')?.textContent).toBe(
      "SMTP settings saved.",
    );
    expect(testButton.form?.querySelector('[role="status"]')).toBeNull();
  });
});

async function renderForm(hasPassword = true) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      <EmailSettingsForm
        settings={settingsWithCipher}
        hasPassword={hasPassword}
      />,
    );
  });
}

function requiredInput(name: string) {
  const input = container?.querySelector<HTMLInputElement>(`[name="${name}"]`);
  if (!input) throw new Error(`Missing input ${name}`);
  return input;
}

function buttonNamed(name: string) {
  const button = Array.from(container?.querySelectorAll("button") ?? []).find(
    (candidate) => candidate.textContent?.trim() === name,
  );
  if (!button) throw new Error(`Missing button ${name}`);
  return button;
}

async function click(button: HTMLButtonElement) {
  await act(async () => {
    button.click();
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function submit(form: HTMLFormElement | null) {
  if (!form) throw new Error("Missing form");
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
