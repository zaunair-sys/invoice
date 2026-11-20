"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const emptySubscribe = () => () => {};
const listeners = new Set();

function subscribe(callback) {
  listeners.add(callback);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", callback);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", callback);
    }
  };
}

function getStoredDark() {
  try {
    return localStorage.getItem("theme") === "dark";
  } catch {
    return false;
  }
}

function emitThemeChange() {
  listeners.forEach((listener) => listener());
}

export default function ThemeToggle({ className = "" }) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const dark = useSyncExternalStore(subscribe, getStoredDark, () => false);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  function toggle() {
    const next = !dark;
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    emitThemeChange();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`pti-theme-toggle ${className}`}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      suppressHydrationWarning
    >
      {mounted && dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
