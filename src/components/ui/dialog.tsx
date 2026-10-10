"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  busy?: boolean;
  role?: "dialog" | "alertdialog";
  ariaLabelledBy: string;
  ariaDescribedBy?: string;
  children: ReactNode;
  backdropClassName?: string;
  panelClassName?: string;
};

export function Dialog({
  open,
  onClose,
  busy = false,
  role = "dialog",
  ariaLabelledBy,
  ariaDescribedBy,
  children,
  backdropClassName,
  panelClassName,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const initialFocus =
      panel?.querySelector<HTMLElement>("[data-dialog-initial-focus]") ??
      focusableElements(panel)[0] ??
      panel;
    initialFocus?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (!busy) {
          event.preventDefault();
          onClose();
        }
        return;
      }

      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      const focusable = focusableElements(panel);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!first || !last) {
        event.preventDefault();
        panel?.focus();
      } else if (
        event.shiftKey &&
        (active === first || !panel?.contains(active))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (active === last || !panel?.contains(active))
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose, open]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-backdrop grid place-items-center animate-fade-in bg-slate-950/55 p-4",
        backdropClassName,
      )}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        ref={panelRef}
        data-native-scroll
        role={role}
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        tabIndex={-1}
        className={cn(
          "z-modal max-h-[calc(100dvh-2rem)] w-full animate-dialog-in overflow-y-auto rounded-lg border border-border bg-surface shadow-popover",
          panelClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

function focusableElements(panel: HTMLElement | null) {
  if (!panel) return [];
  return Array.from(
    panel.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter(
    (element) =>
      element.tabIndex >= 0 && element.getAttribute("aria-hidden") !== "true",
  );
}
