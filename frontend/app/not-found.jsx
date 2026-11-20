"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useGsapAnimations } from "@/lib/animations";

const NotFound = () => {
  const scopeRef = useRef(null);
  useGsapAnimations(scopeRef);

  return (
    <div ref={scopeRef} className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-6">
      <div className="pti-card pti-card-pad text-center max-w-md w-full" data-animate="fade-up">
        <div className="pti-badge pti-badge--pill mx-auto">404</div>
        <h1 className="pti-page-title mt-4">Page not found</h1>
        <p className="pti-page-subtitle mt-3">The page you are looking for doesn&apos;t exist or has been moved.</p>
        <div className="mt-6 flex justify-center">
          <Link href="/" className="pti-btn pti-btn-primary" data-hover="magnetic">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
