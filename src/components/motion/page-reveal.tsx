"use client";

import { gsap } from "gsap";
import React, { type ReactNode, useLayoutEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type PageRevealProps = {
  children: ReactNode;
  className?: string;
};

export function PageReveal({ children, className }: PageRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        root,
        { opacity: 0, y: 12 },
        { duration: 0.42, ease: "power2.out", opacity: 1, y: 0 },
      );
    }, root);

    return () => context.revert();
  }, []);

  return (
    <div ref={rootRef} className={cn("min-w-0", className)}>
      {children}
    </div>
  );
}
