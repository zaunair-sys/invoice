"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Mail, Sparkles } from "lucide-react";
import { pricingStyles, pricingCardStyles } from "@/assets/dummyStyles";
import { SignedIn, SignedOut, useAuth } from "@/context/AuthContext";
import { useGsapAnimations } from "@/lib/animations";

const PricingCard = ({
  title,
  price,
  period,
  description,
  features = [],
  isPopular = false,
  isAnnual = false,
  onCtaClick,
}) => {
  const amount = Number(String(price).replace(/[^0-9.]/g, ""));
  const planId = `plan-${title.toLowerCase()}-${isAnnual ? "annual" : "monthly"}`;
  const descriptionId = `${planId}-description`;

  return (
    <article
      className={`${pricingCardStyles.card} ${
        isPopular
          ? pricingCardStyles.cardPopular
          : pricingCardStyles.cardRegular
      } h-full`}
      aria-labelledby={planId}
      aria-describedby={descriptionId}
      data-hover="lift"
    >
      {isPopular && (
        <div className={pricingCardStyles.popularBadge}>
          <div className={`${pricingCardStyles.popularBadgeContent} inline-flex items-center gap-1.5`}>
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            <span>Most Popular</span>
          </div>
        </div>
      )}
      {isPopular && (
        <div
          className={pricingCardStyles.gradientOverlay}
          aria-hidden="true"
        />
      )}
      <div
        className={pricingCardStyles.animatedBorder}
        aria-hidden="true"
      />

      <div className={`${pricingCardStyles.content} flex h-full flex-col`}>
        <div className={pricingCardStyles.header}>
          <h3
            id={planId}
            className={`${pricingCardStyles.title} ${
              isPopular
                ? pricingCardStyles.titlePopular
                : pricingCardStyles.titleRegular
            }`}
          >
            {title}
          </h3>
          <p id={descriptionId} className={pricingCardStyles.description}>
            {description}
          </p>
        </div>

        <div className={pricingCardStyles.priceContainer}>
          <div className={pricingCardStyles.priceWrapper}>
            <span
              className={`${pricingCardStyles.price}${
                isPopular
                  ? pricingCardStyles.pricePopular
                  : pricingCardStyles.priceRegular
              }`}
              data-counter={Number.isFinite(amount) ? amount : undefined}
              data-prefix="$"
            >
              {price}
            </span>
            {period && (
              <span className={pricingCardStyles.period}>/{period}</span>
            )}
          </div>
          {isAnnual && (
            <div className={`${pricingCardStyles.annualBadge} inline-flex items-center`}>
              <span>Save</span>
              <span className="ml-1" data-counter={20} data-suffix="%">
                20%
              </span>
              <span className="ml-1">annually</span>
            </div>
          )}
        </div>

        <ul
          className={pricingCardStyles.featuresList}
          aria-label={`${title} plan features`}
        >
          {features.map((feature) => (
            <li key={feature} className={pricingCardStyles.featureItem}>
              <span
                className={`
                  ${pricingCardStyles.featureIcon}
                  ${
                    isPopular
                      ? pricingCardStyles.featureIconPopular
                      : pricingCardStyles.featureIconRegular
                  }
                `}
                aria-hidden="true"
              >
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
              </span>
              <span className={pricingCardStyles.featureText}>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6">
          <SignedIn>
            <button
              type="button"
              onClick={() => onCtaClick && onCtaClick({ title, isPopular, isAnnual })}
              className={`
                ${pricingCardStyles.ctaButton}
                ${
                  isPopular
                    ? pricingCardStyles.ctaButtonPopular
                    : pricingCardStyles.ctaButtonRegular
                }
              `}
              data-hover="magnetic"
            >
              <span
                className={`
                  ${pricingCardStyles.ctaButtonText}
                  ${
                    isPopular
                      ? pricingCardStyles.ctaButtonTextPopular
                      : pricingCardStyles.ctaButtonTextRegular
                  }
                `}
              >
                {isPopular ? "Get Started" : "Choose Plan"}
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </SignedIn>

          <SignedOut>
            <button
              type="button"
              onClick={() =>
                onCtaClick &&
                onCtaClick(
                  { title, isPopular, isAnnual },
                  { openSignInFallback: true }
                )
              }
              className={`
                ${pricingCardStyles.ctaButton}
                ${pricingCardStyles.ctaButtonRegular}
              `}
              data-hover="magnetic"
            >
              <span className={pricingCardStyles.ctaButtonText}>
                Sign in to get started
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </SignedOut>
        </div>
      </div>

      {isPopular && (
        <>
          <div
            className={pricingCardStyles.cornerAccent1}
            aria-hidden="true"
          />
          <div
            className={pricingCardStyles.cornerAccent2}
            aria-hidden="true"
          />
        </>
      )}
    </article>
  );
};

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const scopeRef = useRef(null);

  useGsapAnimations(scopeRef, billingPeriod);

  const plans = {
    monthly: [
      {
        title: "Starter",
        price: "$0",
        period: "month",
        description: "Perfect for freelancers and small projects",
        features: [
          "5 invoices per month",
          "Basic AI parsing",
          "Standard templates",
          "Email support",
          "PDF export",
        ],
        isPopular: false,
        priceId: null,
      },
      {
        title: "Professional",
        price: "$29",
        period: "month",
        description: "For growing businesses and agencies",
        features: [
          "Unlimited invoices",
          "Advanced AI parsing",
          "Custom branding",
          "Priority support",
          "Advanced analytics",
          "Team collaboration (3 members)",
          "API access",
        ],
        isPopular: true,
        priceId: "price_professional_monthly",
      },
      {
        title: "Enterprise",
        price: "$99",
        period: "month",
        description: "For large organizations with custom needs",
        features: [
          "Everything in Professional",
          "Unlimited team members",
          "Custom workflows",
          "Dedicated account manager",
          "SLA guarantee",
          "White-label solutions",
          "Advanced security",
        ],
        isPopular: false,
        priceId: "price_enterprise_monthly",
      },
    ],
    annual: [
      {
        title: "Starter",
        price: "$0",
        period: "month",
        description: "Perfect for freelancers and small projects",
        features: [
          "5 invoices per month",
          "Basic AI parsing",
          "Standard templates",
          "Email support",
          "PDF export",
        ],
        isPopular: false,
        isAnnual: false,
        priceId: null,
      },
      {
        title: "Professional",
        price: "$24",
        period: "month",
        description: "For growing businesses and agencies",
        features: [
          "Unlimited invoices",
          "Advanced AI parsing",
          "Custom branding",
          "Priority support",
          "Advanced analytics",
          "Team collaboration (3 members)",
          "API access",
        ],
        isPopular: true,
        isAnnual: true,
        priceId: "price_professional_annual",
      },
      {
        title: "Enterprise",
        price: "$79",
        period: "month",
        description: "For large organizations with custom needs",
        features: [
          "Everything in Professional",
          "Unlimited team members",
          "Custom workflows",
          "Dedicated account manager",
          "SLA guarantee",
          "White-label solutions",
          "Advanced security",
        ],
        isPopular: false,
        isAnnual: true,
        priceId: "price_enterprise_annual",
      },
    ],
  };

  const currentPlans = plans[billingPeriod];

  function handleCtaClick(planMeta, flags = {}) {
    if (flags.openSignInFallback || !isSignedIn) {
      router.push(`/login?from=${encodeURIComponent("/app/select-template")}`);
      return;
    }
    router.push("/app/select-template");
  }

  return (
    <section
      ref={scopeRef}
      id="pricing"
      className={pricingStyles.section}
      aria-labelledby="pricing-title"
    >
      <div
        className={pricingStyles.bgElement1}
        data-animate="float"
        aria-hidden="true"
      />
      <div
        className={pricingStyles.bgElement2}
        data-animate="float"
        aria-hidden="true"
      />
      <div
        className={pricingStyles.bgElement3}
        data-animate="float"
        aria-hidden="true"
      />

      <div className={pricingStyles.container}>
        <div className={pricingStyles.headerContainer}>
          <div className={pricingStyles.badge} data-animate="fade-up">
            <span
              className={pricingStyles.badgeDot}
              aria-hidden="true"
            />
            <span className={pricingStyles.badgeText}>Transparent Pricing</span>
          </div>

          <h2
            id="pricing-title"
            className={pricingStyles.title}
            data-animate="fade-up"
          >
            Simple,{" "}
            <span className={pricingStyles.titleGradient}>Fair Pricing</span>
          </h2>
          <p className={pricingStyles.description} data-animate="fade-up">
            Start free, upgrade as you grow.No hidden fees, no surprices
            charges.
          </p>
          <div
            className={pricingStyles.billingToggle}
            role="group"
            aria-label="Billing period"
            data-animate="fade-up"
          >
            <button
              type="button"
              onClick={() => setBillingPeriod("monthly")}
              aria-pressed={billingPeriod === "monthly"}
              className={`${pricingStyles.billingButton} ${
                billingPeriod === "monthly"
                  ? pricingStyles.billingButtonActive
                  : pricingStyles.billingButtonInactive
              }`}
            >
              Monthly
            </button>

            <button
              type="button"
              onClick={() => setBillingPeriod("annual")}
              aria-pressed={billingPeriod === "annual"}
              className={`${pricingStyles.billingButton} ${
                billingPeriod === "annual"
                  ? pricingStyles.billingButtonActive
                  : pricingStyles.billingButtonInactive
              }`}
            >
              <span>Annual</span>
              <span className={pricingStyles.billingBadge}>
                Save <span data-counter={20} data-suffix="%">20%</span>
              </span>
            </button>
          </div>
          <p className="sr-only" role="status">
            {billingPeriod === "annual"
              ? "Annual pricing shown"
              : "Monthly pricing shown"}
          </p>
        </div>

        <div className={pricingStyles.grid} data-stagger>
          {currentPlans.map((plan) => (
            <PricingCard
              key={plan.title}
              {...plan}
              onCtaClick={handleCtaClick}
            />
          ))}
        </div>

        <div className={pricingStyles.additionalInfo} data-animate="fade-up">
          <div className={pricingStyles.featuresCard}>
            <h3 className={pricingStyles.featuresTitle}>All plans include</h3>
            <div className={pricingStyles.featuresGrid} data-stagger>
              {[
                "Secure cloud storage",
                "Mobile-friendly interface",
                "Automatic backups",
                "Real-time notifications",
                "Multi-currency support",
                "Tax calculation",
              ].map((feature) => (
                <div key={feature} className={pricingStyles.featureItem}>
                  <span
                    className={pricingStyles.featureDot}
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={pricingStyles.faqCta} data-animate="fade-up">
          <p className={pricingStyles.faqText}>
            Have questions about pricing?{" "}
            <a
              href="mailto:hello@prompttoinvoice.com?subject=Pricing%20question"
              className={`${pricingStyles.contactLink} inline-flex items-center gap-1.5`}
              data-hover="lift"
            >
              <span>Contact our sales team ➜</span>
              <Mail className="h-4 w-4" aria-hidden="true" />
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
