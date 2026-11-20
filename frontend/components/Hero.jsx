"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
  Eye,
  Palette,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";
import { heroStyles } from "@/assets/dummyStyles";
import { SignedIn, SignedOut } from "@/context/AuthContext";
import { useGsapAnimations } from "@/lib/animations";

const heroHighlights = [
  { icon: Sparkles, label: "AI-Powered", desc: "Smart text parsing" },
  { icon: Zap, label: "Lightning Fast", desc: "Generate in seconds" },
  { icon: Palette, label: "Professional", desc: "Branded templates" },
];

const demoItems = [
  { description: "Website Design & Development", amount: "$2,500" },
  { description: "Consultation (2 hours)", amount: "$300" },
  { description: "Premium Hosting Setup", amount: "$200" },
];

const Hero = () => {
  const router = useRouter();
  const scopeRef = useRef(null);

  useGsapAnimations(scopeRef);

  const handleSignedInPrimary = () => {
    router.push("/app/select-template");
  };

  const handleSignedOutPrimary = () => {
    router.push("/signup");
  };

  return (
    <section
      ref={scopeRef}
      id="top"
      className={heroStyles.section}
      aria-labelledby="hero-title"
    >
      <div
        className={heroStyles.bgElement1}
        data-animate="float"
        aria-hidden="true"
      />
      <div
        className={heroStyles.bgElement2}
        data-animate="float"
        aria-hidden="true"
      />
      <div
        className={heroStyles.bgElement3}
        data-animate="float"
        aria-hidden="true"
      />
      <div className={heroStyles.gridPattern} aria-hidden="true" />

      <div className={heroStyles.container}>
        <div className={heroStyles.grid}>
          <div className={heroStyles.content}>
            <div className={heroStyles.contentInner}>
              <div className={heroStyles.badge} data-animate="hero">
                <span className={heroStyles.badgeDot} aria-hidden="true" />
                <span className={heroStyles.badgeText}>
                  AI-Powerd Invoicing Platform
                </span>
              </div>

              <h1
                id="hero-title"
                className={heroStyles.heading}
                data-animate="hero"
              >
                <span className={heroStyles.headingLine1}>Professional</span>
                <span className={heroStyles.headingLine2}>Invoices</span>
                <span className={heroStyles.headingLine3}>in Seconds</span>
              </h1>

              <p className={heroStyles.description} data-animate="hero">
                Transform conversations into professional invoices with AI{" "}
                <span className={heroStyles.descriptionHighlight}>
                  Paste any text
                </span>{" "}
                and watch AI extract items, calculate totals, and generate
                ready-to-send invoices instantly.
              </p>

              <div className={heroStyles.ctaContainer} data-animate="hero">
                <SignedIn>
                  <button
                    type="button"
                    onClick={handleSignedInPrimary}
                    className={heroStyles.primaryButton}
                    data-hover="magnetic"
                  >
                    <span
                      className={heroStyles.primaryButtonOverlay}
                      aria-hidden="true"
                    />
                    <span>Start Creating Free</span>
                    <ArrowRight
                      className={heroStyles.primaryButtonIcon}
                      aria-hidden="true"
                    />
                  </button>
                </SignedIn>

                <SignedOut>
                  <button
                    type="button"
                    onClick={handleSignedOutPrimary}
                    className={heroStyles.primaryButton}
                    data-hover="magnetic"
                  >
                    <span
                      className={heroStyles.primaryButtonOverlay}
                      aria-hidden="true"
                    />
                    <span>Start Creating Free</span>
                    <ArrowRight
                      className={heroStyles.primaryButtonIcon}
                      aria-hidden="true"
                    />
                  </button>
                </SignedOut>

                <a
                  href="#features"
                  className={heroStyles.secondaryButton}
                  data-hover="magnetic"
                >
                  <span>Explore Features</span>
                  <ArrowDown
                    className={heroStyles.secondaryButtonIcon}
                    aria-hidden="true"
                  />
                </a>
              </div>

              <ul
                className={`${heroStyles.featuresGrid} m-0 list-none p-0`}
                data-stagger
              >
                {heroHighlights.map(({ icon: Icon, label, desc }) => (
                  <li key={label} className={heroStyles.featureItem}>
                    <span
                      className={heroStyles.featureIcon}
                      aria-hidden="true"
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <div className={heroStyles.featureText}>
                      <div className={heroStyles.featureLabel}>{label}</div>
                      <div className={heroStyles.featureDesc}>{desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={heroStyles.demoColumn}>
            <div
              className={heroStyles.demoFloating1}
              data-animate="float"
              aria-hidden="true"
            />
            <div
              className={heroStyles.demoFloating2}
              data-animate="float"
              aria-hidden="true"
            />
            <div className={heroStyles.cardBackground} aria-hidden="true" />

            <div className={heroStyles.demoContainer}>
              <figure
                className={`${heroStyles.demoCard} text-left`}
                data-animate="hero-visual"
                data-hover="lift"
              >
                <figcaption className="sr-only">
                  Example of a paid invoice for Acme Corporation LLC totaling
                  $3,000.
                </figcaption>

                <div className={heroStyles.cardHeader}>
                  <div className={heroStyles.cardLogoContainer}>
                    <div className={heroStyles.cardLogo} aria-hidden="true">
                      AI
                    </div>
                    <div className="min-w-0">
                      <div className={heroStyles.cardClientName}>
                        Acme Corporation LLC
                      </div>
                      <div className={heroStyles.cardClientGst}>
                        EIN: 12-3456789
                      </div>
                    </div>
                  </div>

                  <div className={heroStyles.cardInvoiceInfo}>
                    <div className={heroStyles.cardInvoiceLabel}>Invoice</div>
                    <div className={heroStyles.cardInvoiceNumber}>
                      #INV-1024
                    </div>
                    <div className={heroStyles.cardStatus}>Paid</div>
                  </div>
                </div>

                <ul className={`${heroStyles.itemsContainer} m-0 list-none p-0`}>
                  {demoItems.map(({ description, amount }) => (
                    <li
                      key={description}
                      className={heroStyles.itemRow}
                      data-animate="hero-item"
                    >
                      <div className="flex min-w-0 items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={heroStyles.itemDot}
                            aria-hidden="true"
                          />
                          <span className={heroStyles.itemDescription}>
                            {description}
                          </span>
                        </div>
                        <span className={heroStyles.itemAmount}>{amount}</span>
                      </div>
                    </li>
                  ))}
                </ul>

                <dl className={heroStyles.calculationContainer}>
                  <div
                    className={heroStyles.calculationRow}
                    data-animate="hero-item"
                  >
                    <dt className={heroStyles.calculationLabel}>Subtotal</dt>
                    <dd className={heroStyles.calculationValue}>$3,000</dd>
                  </div>
                  <div
                    className={heroStyles.calculationRow}
                    data-animate="hero-item"
                  >
                    <dt className={heroStyles.calculationLabel}>Tax (0%)</dt>
                    <dd className={heroStyles.calculationValue}>$0.00</dd>
                  </div>
                  <div
                    className={heroStyles.totalRow}
                    data-animate="hero-item"
                  >
                    <dt className={heroStyles.totalLabel}>Total Amount</dt>
                    <dd className={heroStyles.totalValue}>$3,000</dd>
                  </div>
                </dl>

                <div className={heroStyles.actionButtons}>
                  <button
                    type="button"
                    className={heroStyles.previewButton}
                    aria-label="Preview sample invoice"
                    data-hover="magnetic"
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    <span className={heroStyles.previewButtonText}>
                      Preview
                    </span>
                  </button>
                  <button
                    type="button"
                    className={heroStyles.sendButton}
                    aria-label="Send sample invoice"
                    data-hover="magnetic"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    <span className={heroStyles.sendButtonText}>
                      Send Invoice
                    </span>
                  </button>
                </div>
              </figure>

              <div className={heroStyles.aiIndicator} data-animate="hero-item">
                <div className={heroStyles.aiIndicatorContent}>
                  <span
                    className={heroStyles.aiIndicatorDot}
                    aria-hidden="true"
                  />
                  <Sparkles
                    className="h-3.5 w-3.5 text-[var(--primary)]"
                    aria-hidden="true"
                  />
                  <span>AI parsed from:</span>
                  <span className={heroStyles.aiIndicatorText}>
                    &ldquo;Invoice for web design - $2,500&rdquo;
                  </span>
                </div>
              </div>
              <div
                className={heroStyles.cornerAccent1}
                aria-hidden="true"
              />
              <div
                className={heroStyles.cornerAccent2}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        <div className={heroStyles.scrollIndicator} aria-hidden="true">
          <div className={heroStyles.scrollContainer}>
            <span className={heroStyles.scrollText}>Scroll to explore</span>
            <div className={heroStyles.scrollBar}>
              <div className={heroStyles.scrollDot} />
            </div>
            <ArrowDown className="h-3 w-3 text-[var(--text-subtle)]" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
