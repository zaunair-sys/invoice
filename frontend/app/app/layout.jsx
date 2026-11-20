"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";

export default function AppLayout({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [isLoaded, isSignedIn, pathname, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="pti-card pti-card-pad text-center">
          <span className="pti-eyebrow">Loading workspace</span>
          <p className="pti-card-sub mt-2">Preparing your invoices...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="pti-card pti-card-pad text-center">
          <span className="pti-eyebrow">Sign in required</span>
          <p className="pti-card-sub mt-2">Redirecting you to sign in...</p>
        </div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
