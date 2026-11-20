"use client";

import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

let hasClientNavigation = false;
let lastSeenPathname =
  typeof window !== "undefined" ? window.location.pathname : "";

function navigationEntry() {
  if (typeof window === "undefined") return null;
  if (typeof performance === "undefined" || typeof performance.getEntriesByType !== "function") return null;
  return performance.getEntriesByType("navigation")[0] || null;
}

export function markClientNavigation() {
  hasClientNavigation = true;
  if (typeof window !== "undefined") lastSeenPathname = window.location.pathname;
  if (typeof document !== "undefined") delete document.documentElement.dataset.anim;
}

export function hasClientNavigated() {
  return hasClientNavigation;
}

const NO_ANIMATION_PATHS = [
  "/app/dashboard",
  "/app/invoices",
  "/app/create-invoice",
  "/app/business",
  "/app/select-template",
];

export function shouldDisableAnimations(pathname) {
  if (typeof pathname !== "string") return false;
  return NO_ANIMATION_PATHS.some(
    (base) => pathname === base || pathname.startsWith(`${base}/`)
  );
}

function syncClientNavigation() {
  if (typeof window === "undefined") return;
  const current = window.location.pathname;
  if (current !== lastSeenPathname) markClientNavigation();
}

function shouldSkipEntranceAnimations() {
  syncClientNavigation();
  if (hasClientNavigation) return false;
  const entry = navigationEntry();
  return entry?.type === "reload" || entry?.type === "back_forward";
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function revealImmediately(scope) {
  if (!scope) return;
  const nodes = scope.querySelectorAll(
    '[data-animate], [data-hover], [data-stagger] > *'
  );
  nodes.forEach((node) => {
    node.style.opacity = "1";
    node.style.transform = "none";
    node.style.visibility = "visible";
  });
}

export function useRevealFallback(scopeRef, delay = 700) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (scopeRef.current) revealImmediately(scopeRef.current);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [scopeRef, delay]);
}

function setupInteractions(select, cleanups) {
  select('[data-hover="lift"]').forEach((node) => {
    const enter = () =>
      gsap.to(node, {
        y: -5,
        scale: 1.015,
        duration: 0.3,
        ease: "power2.out",
        overwrite: true,
      });
    const leave = () =>
      gsap.to(node, {
        y: 0,
        scale: 1,
        duration: 0.35,
        ease: "power2.out",
        overwrite: true,
      });
    node.addEventListener("mouseenter", enter);
    node.addEventListener("mouseleave", leave);
    cleanups.push(() => {
      node.removeEventListener("mouseenter", enter);
      node.removeEventListener("mouseleave", leave);
    });
  });

  select('[data-hover="magnetic"]').forEach((node) => {
    const move = (event) => {
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.16;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.22;
      gsap.to(node, { x, y, duration: 0.35, ease: "power2.out" });
    };
    const leave = () =>
      gsap.to(node, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" });
    node.addEventListener("mousemove", move);
    node.addEventListener("mouseleave", leave);
    cleanups.push(() => {
      node.removeEventListener("mousemove", move);
      node.removeEventListener("mouseleave", leave);
    });
  });
}

/**
 * Coordinated GSAP entrance / scroll / hover animations for a component tree.
 * Every animation is scoped to `scopeRef` and reverted on unmount.
 */
export function useGsapAnimations(scopeRef, refreshKey = null) {
  useIsoLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    if (scope.closest("[data-no-animate]")) {
      revealImmediately(scope);
      return;
    }

    if (prefersReducedMotion() || shouldSkipEntranceAnimations()) {
      document.documentElement.dataset.anim = "off";
      revealImmediately(scope);
      const cleanups = [];
      setupInteractions(gsap.utils.selector(scope), cleanups);
      return () => cleanups.forEach((fn) => fn());
    }

    const cleanups = [];
    const ctx = gsap.context(() => {
      const select = gsap.utils.selector(scope);

      /* Hero: one controlled entrance timeline */
      const hero = select('[data-animate="hero"]');
      if (hero.length) {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(hero, { y: 34, opacity: 0, duration: 0.85, stagger: 0.11 }, 0.05)
          .from(
            select('[data-animate="hero-visual"]'),
            { x: 46, opacity: 0, scale: 0.94, duration: 1.05 },
            0.2
          )
          .from(
            select('[data-animate="hero-item"]'),
            { x: 22, opacity: 0, duration: 0.5, stagger: 0.08 },
            0.55
          );
      }

      /* Generic fade-up reveals on scroll */
      select('[data-animate="fade-up"]').forEach((node) => {
        gsap.from(node, {
          y: 26,
          opacity: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: node, start: "top 90%", once: true },
        });
      });

      /* Staggered groups (cards, table rows, list items) */
      select('[data-stagger]').forEach((group) => {
        const children = group.children;
        if (!children.length) return;
        gsap.from(children, {
          y: 24,
          opacity: 0,
          duration: 0.65,
          stagger: 0.085,
          ease: "power2.out",
          scrollTrigger: { trigger: group, start: "top 88%", once: true },
        });
      });

      /* Clip-path image / panel reveals */
      select('[data-animate="reveal"]').forEach((node) => {
        gsap.from(node, {
          clipPath: "inset(0 0 100% 0)",
          opacity: 0,
          duration: 1,
          ease: "power3.inOut",
          scrollTrigger: { trigger: node, start: "top 88%", once: true },
        });
      });

      /* Subtle parallax */
      select('[data-animate="parallax"]').forEach((node) => {
        gsap.to(node, {
          yPercent: Number(node.dataset.parallax || -12),
          ease: "none",
          scrollTrigger: {
            trigger: node,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      /* Continuous floating accents */
      select('[data-animate="float"]').forEach((node, i) => {
        gsap.to(node, {
          y: i % 2 ? -14 : -20,
          rotate: i % 2 ? 6 : -6,
          duration: 4 + i * 0.7,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      /* Animated numeric counters */
      select('[data-counter]').forEach((node) => {
        const target = Number(node.dataset.counter);
        if (!Number.isFinite(target)) return;
        const decimals = Number(node.dataset.decimals || 0);
        const suffix = node.dataset.suffix || "";
        const prefix = node.dataset.prefix || "";
        const state = { value: 0 };
        gsap.to(state, {
          value: target,
          duration: 1.15,
          ease: "power2.out",
          onUpdate: () => {
            node.textContent =
              prefix + state.value.toFixed(decimals) + suffix;
          },
          scrollTrigger: { trigger: node, start: "top 92%", once: true },
        });
      });

      setupInteractions(select, cleanups);
    }, scopeRef);

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 500);

    const revealVisibleFallback = window.setTimeout(() => {
      scope
        .querySelectorAll('[data-animate], [data-stagger] > *')
        .forEach((node) => {
          const rect = node.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            node.style.opacity = "1";
            node.style.visibility = "visible";
          }
        });
    }, 900);

    return () => {
      window.clearTimeout(refresh);
      window.clearTimeout(revealVisibleFallback);
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [scopeRef, refreshKey]);
}

/** Animate a modal / overlay on mount. */
export function useModalAnimation(scopeRef, open) {
  useIsoLayoutEffect(() => {
    const root = scopeRef.current;
    if (
      !root ||
      !open ||
      prefersReducedMotion() ||
      root.closest("[data-no-animate]")
    )
      return;
    const ctx = gsap.context(() => {
      gsap.from(root.querySelector("[data-modal-backdrop]"), {
        opacity: 0,
        duration: 0.25,
      });
      gsap.from(root.querySelector("[data-modal-panel]"), {
        y: 28,
        scale: 0.96,
        opacity: 0,
        duration: 0.45,
        ease: "back.out(1.5)",
      });
    }, scopeRef);
    return () => ctx.revert();
  }, [scopeRef, open]);
}

export { gsap, ScrollTrigger };
