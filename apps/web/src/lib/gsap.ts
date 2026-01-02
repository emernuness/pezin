"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const defaultAnimation = {
  duration: 0.6,
  ease: "power2.out",
};

export function getAnimationDuration(duration = 0.6): number {
  return getPrefersReducedMotion() ? 0 : duration;
}

export { gsap, ScrollTrigger };
