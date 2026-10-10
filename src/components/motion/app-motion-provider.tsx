"use client";

import Lenis from "lenis";
import { gsap } from "gsap";
import { type ReactNode, useEffect } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function AppMotionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    const lenis = new Lenis({
      anchors: true,
      autoRaf: false,
      prevent: (node) => Boolean(node.closest("[data-native-scroll]")),
      smoothWheel: true,
    });
    const update = (time: number) => lenis.raf(time * 1000);

    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  return children;
}
