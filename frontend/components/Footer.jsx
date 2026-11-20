"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUp, Mail, Sparkles } from "lucide-react";
import { footerStyles } from "@/assets/dummyStyles";
import { useGsapAnimations } from "@/lib/animations";

const Footer = () => {
  const scopeRef = useRef(null);

  useGsapAnimations(scopeRef);

  return (
    <footer ref={scopeRef} className={`${footerStyles.footer} relative overflow-hidden`}>
      <div className="pti-container">
        <div
          className="grid gap-8 py-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
          data-stagger
        >
          <div className="flex items-center gap-3" data-hover="lift">
            <Image
              src="/logo.png"
              alt=""
              width={40}
              height={40}
              aria-hidden="true"
              className="h-10 w-10 rounded-xl object-contain"
            />
            <div className="min-w-0">
              <p className="text-sm font-extrabold tracking-tight text-[var(--text)]">
                PromptToInvoice
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Professional invoices, powered by AI.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="pti-btn pti-btn-primary pti-btn-sm"
              data-hover="magnetic"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="mailto:hello@prompttoinvoice.com"
              className="pti-btn pti-btn-secondary pti-btn-sm"
              data-hover="magnetic"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              <span>Contact</span>
            </a>
          </div>
        </div>

        <div className="pti-divider" />

        <div className={footerStyles.container} data-animate="fade-up">
          <p className={footerStyles.copyright}>
            &copy; {new Date().getFullYear()} PromptToInvoice • Developed By
            Riveen_Official.
          </p>

          <nav
            className={footerStyles.links}
            aria-label="Footer navigation"
            data-stagger
          >
            <a
              href="#features"
              className={`${footerStyles.link} inline-flex items-center`}
              data-hover="lift"
            >
              Features
            </a>
            <a
              href="#pricing"
              className={`${footerStyles.link} inline-flex items-center`}
              data-hover="lift"
            >
              Pricing
            </a>
            <a
              href="mailto:hello@prompttoinvoice.com"
              className={`${footerStyles.link} inline-flex items-center gap-1.5`}
              data-hover="lift"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Contact</span>
            </a>
            <Link
              href="/signup"
              className={`${footerStyles.link} inline-flex items-center`}
              data-hover="lift"
            >
              Get Started
            </Link>
            <a
              href="#top"
              className={`${footerStyles.link} inline-flex items-center gap-1.5`}
              data-hover="lift"
            >
              <span>Back to top</span>
              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
