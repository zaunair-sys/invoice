"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  gsap,
  hasClientNavigated,
  markClientNavigation,
  prefersReducedMotion,
  shouldDisableAnimations,
} from "@/lib/animations";

export default function PageTransition({ children }) {
  const ref = useRef(null);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      markClientNavigation();
    }

    const navigationEntry =
      typeof performance !== "undefined" &&
      typeof performance.getEntriesByType === "function"
        ? performance.getEntriesByType("navigation")[0]
        : null;
    const shouldSkipAnimation =
      shouldDisableAnimations(pathname) ||
      prefersReducedMotion() ||
      (!hasClientNavigated() &&
        (navigationEntry?.type === "reload" ||
          navigationEntry?.type === "back_forward"));

    if (shouldSkipAnimation) {
      node.style.opacity = "1";
      node.style.transform = "none";
      return;
    }

    const reveal = () => {
      node.style.opacity = "1";
      node.style.transform = "none";
    };

    const tween = gsap.fromTo(
      node,
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: "power2.out",
        clearProps: "opacity,transform",
        onInterrupt: reveal,
      }
    );

    return () => {
      tween.kill();
      reveal();
    };
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
