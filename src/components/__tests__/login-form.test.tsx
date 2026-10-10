// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/login-form";

const framework = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  signIn: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: framework.push, refresh: framework.refresh }),
}));

vi.mock("next-auth/react", () => ({ signIn: framework.signIn }));

let root: Root | undefined;
let container: HTMLDivElement | undefined;

beforeEach(() => {
  vi.stubGlobal("React", React);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
});

afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  container?.remove();
  framework.push.mockReset();
  framework.refresh.mockReset();
  framework.signIn.mockReset();
  vi.unstubAllGlobals();
  root = undefined;
  container = undefined;
});

describe("LoginForm", () => {
  it("uses the MFE favicon as its product identity", async () => {
    await renderForm();

    expect(
      container?.querySelector('img[src="/icon.ico"][alt="Microtec"]'),
    ).not.toBeNull();
  });

  it("toggles password visibility without changing the entered password", async () => {
    await renderForm();
    const password = requiredInput("password");
    password.value = "correct horse battery staple";

    const show = requiredButton("Show password");
    await click(show);
    expect(password.type).toBe("text");
    expect(password.value).toBe("correct horse battery staple");
    expect(show.getAttribute("aria-pressed")).toBe("true");

    const hide = requiredButton("Hide password");
    await click(hide);
    expect(password.type).toBe("password");
    expect(password.value).toBe("correct horse battery staple");
    expect(hide.getAttribute("aria-pressed")).toBe("false");
  });
});

async function renderForm() {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(<LoginForm />);
  });
}

function requiredInput(name: string) {
  const input = container?.querySelector<HTMLInputElement>(`[name="${name}"]`);
  if (!input) throw new Error(`Missing input ${name}`);
  return input;
}

function requiredButton(label: string) {
  const button = container?.querySelector<HTMLButtonElement>(
    `button[aria-label="${label}"]`,
  );
  if (!button) throw new Error(`Missing button ${label}`);
  return button;
}

async function click(button: HTMLButtonElement) {
  await act(async () => {
    button.click();
    await Promise.resolve();
  });
}
