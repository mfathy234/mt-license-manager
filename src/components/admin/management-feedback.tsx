"use client";

import { useEffect, useState } from "react";

import { FormMessage } from "@/components/ui";

export type ManagementFeedbackScope = "recipients" | "groups";

const feedbackEvent = "management:success";

function storageKey(scope: ManagementFeedbackScope) {
  return `management-success:${scope}`;
}

export function publishManagementSuccess(
  scope: ManagementFeedbackScope,
  message: string,
) {
  try {
    sessionStorage.setItem(storageKey(scope), message);
  } catch {
    // The live event still works when browser storage is unavailable.
  }
  window.dispatchEvent(
    new CustomEvent(feedbackEvent, { detail: { scope, message } }),
  );
}

export function ManagementFeedback({
  scope,
}: {
  scope: ManagementFeedbackScope;
}) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const key = storageKey(scope);
    let storedMessage: string | null = null;
    try {
      storedMessage = sessionStorage.getItem(key);
    } catch {
      // Storage is only the refresh fallback; live events remain available.
    }
    if (storedMessage) {
      setMessage(storedMessage);
    }

    function handleSuccess(event: Event) {
      const detail = (event as CustomEvent).detail as
        | { scope?: ManagementFeedbackScope; message?: string }
        | undefined;
      if (detail?.scope !== scope || !detail.message) return;

      setMessage(detail.message);
    }

    window.addEventListener(feedbackEvent, handleSuccess);
    return () => window.removeEventListener(feedbackEvent, handleSuccess);
  }, [scope]);

  useEffect(() => {
    if (!message) return;
    try {
      sessionStorage.removeItem(storageKey(scope));
    } catch {
      // The status is already rendered, so storage cleanup is best-effort.
    }
  }, [message, scope]);

  return message ? (
    <div className="border-b border-border px-4 py-3">
      <FormMessage tone="success">{message}</FormMessage>
    </div>
  ) : null;
}
