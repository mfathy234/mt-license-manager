// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  AppRouterContext,
  type AppRouterInstance,
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GroupActions } from "@/components/admin/group-form";
import { RecipientActions } from "@/components/admin/recipient-form";
import { UserAccessActions } from "@/components/admin/user-invite-form";

const router: AppRouterInstance = {
  back() {},
  forward() {},
  refresh() {},
  push() {},
  replace() {},
  prefetch() {},
};

let root: Root | undefined;
let container: HTMLDivElement | undefined;

beforeEach(() => {
  vi.stubGlobal("React", React);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
});

afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  container?.remove();
  vi.unstubAllGlobals();
  root = undefined;
  container = undefined;
});

describe("management action accessible names", () => {
  it("identifies the recipient, group, and user affected by each repeated action", async () => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <AppRouterContext.Provider value={router}>
          <RecipientActions
            recipient={{
              id: "recipient-1",
              name: "Mona Ali",
              email: "mona@example.test",
              active: true,
            }}
          />
          <GroupActions
            group={{
              id: "group-1",
              name: "Operations",
              active: false,
              recipientIds: ["recipient-1"],
            }}
          />
          <UserAccessActions
            user={{
              id: "user-1",
              email: "operator@example.test",
              role: "editor",
              status: "active",
            }}
          />
        </AppRouterContext.Provider>,
      );
    });

    expect(buttonWithLabel("Deactivate Mona Ali")).not.toBeNull();
    expect(buttonWithLabel("Delete Mona Ali")).not.toBeNull();
    expect(buttonWithLabel("Activate Operations")).not.toBeNull();
    expect(buttonWithLabel("Delete Operations")).not.toBeNull();
    expect(buttonWithLabel("Manage operator@example.test")).not.toBeNull();
  });
});

function buttonWithLabel(label: string) {
  return container?.querySelector<HTMLButtonElement>(
    `button[aria-label="${label}"]`,
  );
}
