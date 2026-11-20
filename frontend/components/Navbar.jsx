"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LayoutDashboard, Menu, X } from "lucide-react";
import { navbarStyles } from "@/assets/dummyStyles";
import { SignedOut, useAuth } from "@/context/AuthContext";
import { useGsapAnimations } from "@/lib/animations";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const { isSignedIn } = useAuth();
  const router = useRouter();
  const scopeRef = useRef(null);

  useGsapAnimations(scopeRef, open);

  useEffect(() => {
    if (isSignedIn) {
      const pathname = window.location.pathname || "/";
      if (
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname.startsWith("/auth") ||
        pathname === "/"
      ) {
        router.replace("/app/dashboard");
      }
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function openSignIn() {
    setOpen(false);
    router.push("/login");
  }

  function openSignUp() {
    setOpen(false);
    router.push("/signup");
  }

  return (
    <header ref={scopeRef} className={navbarStyles.header}>
      <div className={navbarStyles.container}>
        <nav className={navbarStyles.nav} aria-label="Main navigation" data-stagger>
          <div className={navbarStyles.logoSection}>
            <Link
              href="/"
              className={navbarStyles.logoLink}
              aria-label="PromptToInvoice home"
              data-hover="magnetic"
            >
              <Image
                src="/logo.png"
                alt="PromptToInvoice logo"
                width={36}
                height={36}
                priority
                className={navbarStyles.logoImage}
              />
              <span className={navbarStyles.logoText}>PromptToInvoice</span>
            </Link>

            <div className={navbarStyles.desktopNav} data-stagger>
              <a
                href="#features"
                className={`${navbarStyles.navLink} inline-flex items-center`}
                data-hover="lift"
              >
                Features
              </a>
              <a
                href="#pricing"
                className={`${navbarStyles.navLinkInactive} inline-flex items-center`}
                data-hover="lift"
              >
                Pricing
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={navbarStyles.authSection} data-stagger>
              <SignedOut>
                <button
                  type="button"
                  onClick={openSignIn}
                  className={navbarStyles.signInButton}
                  data-hover="magnetic"
                >
                  <span>Sign in</span>
                </button>
                <button
                  type="button"
                  onClick={openSignUp}
                  className={navbarStyles.signUpButton}
                  data-hover="magnetic"
                >
                  <span
                    className={navbarStyles.signUpOverlay}
                    aria-hidden="true"
                  />
                  <span className={navbarStyles.signUpText}>Get Started</span>
                  <ArrowRight
                    className={navbarStyles.signUpIcon}
                    aria-hidden="true"
                  />
                </button>
              </SignedOut>
              {isSignedIn && (
                <Link
                  href="/app/dashboard"
                  className={`${navbarStyles.signInButton} inline-flex items-center gap-2`}
                  data-hover="magnetic"
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  <span>Dashboard</span>
                </Link>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className={navbarStyles.mobileMenuButton}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              data-hover="lift"
            >
              {open ? (
                <X className={navbarStyles.mobileMenuIcon} aria-hidden="true" />
              ) : (
                <Menu className={navbarStyles.mobileMenuIcon} aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>
      </div>

      <div
        id="mobile-navigation"
        className={`${open ? "block" : "hidden"} ${navbarStyles.mobileMenu}`}
      >
        <nav
          className={navbarStyles.mobileMenuContainer}
          aria-label="Mobile navigation"
          data-stagger
        >
          <a
            href="#features"
            className={navbarStyles.mobileNavLink}
            onClick={() => setOpen(false)}
          >
            Features
          </a>
          <a
            href="#pricing"
            className={navbarStyles.mobileNavLink}
            onClick={() => setOpen(false)}
          >
            Pricing
          </a>

          <div className={navbarStyles.mobileAuthSection}>
            <SignedOut>
              <button
                type="button"
                onClick={openSignIn}
                className={navbarStyles.mobileSignIn}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={openSignUp}
                className={`${navbarStyles.mobileSignUp} inline-flex items-center justify-center gap-2`}
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </SignedOut>
            {isSignedIn && (
              <Link
                href="/app/dashboard"
                className={`${navbarStyles.mobileSignIn} inline-flex items-center justify-center gap-2`}
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                <span>Dashboard</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
