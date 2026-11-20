"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, FileText, Mail } from "lucide-react";
import { featuresStyles } from "@/assets/dummyStyles";
import { useAuth } from "@/context/AuthContext";
import { useGsapAnimations } from "@/lib/animations";

const FeatureCard = ({ id, title, desc, icon: Icon }) => (
  <article
    className={`${featuresStyles.featureCard} h-full`}
    aria-labelledby={`${id}-title`}
    data-hover="lift"
  >
    <div className={featuresStyles.featureCardGradient} aria-hidden="true" />
    <div className={featuresStyles.featureCardBorder} aria-hidden="true" />
    <div className={featuresStyles.featureCardContent}>
      <span
        className={featuresStyles.featureCardIconContainer}
        aria-hidden="true"
      >
        <Icon className="h-6 w-6" strokeWidth={1.8} />
      </span>
      <div className={featuresStyles.featureCardTextContainer}>
        <h3 id={`${id}-title`} className={featuresStyles.featureCardTitle}>
          {title}
        </h3>
        <p className={featuresStyles.featureCardDescription}>{desc}</p>

        <a
          href="#pricing"
          className={featuresStyles.featureCardCta}
          aria-label={`Learn more about ${title}`}
          data-hover="magnetic"
        >
          <span className={featuresStyles.featureCardCtaText}>Learn more</span>
          <ArrowRight
            className={featuresStyles.featureCardCtaIcon}
            aria-hidden="true"
          />
        </a>
      </div>
    </div>
  </article>
);

const Features = () => {
  const scopeRef = useRef(null);
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useGsapAnimations(scopeRef);

  const features = [
    {
      id: "parsing",
      title: "AI Invoice Parsing",
      desc: "Paste freeform text and let our advanced AI extract client details, line items, and totals into a perfectly formatted draft invoice in seconds.",
      icon: FileText,
    },
    {
      id: "reminders",
      title: "Smart Email Reminders",
      desc: "Generate professional, context-aware reminder emails with one click — complete with intelligent tone selection and personalized messaging.",
      icon: Mail,
    },
    {
      id: "export",
      title: "Professional PDF Export",
      desc: "Generate high-quality, brand-consistent PDF invoices with reliable email delivery and comprehensive tracking of all sent communications.",
      icon: Download,
    },
  ];

  const handleExplore = () => {
    router.push(isSignedIn ? "/app/dashboard" : "/signup");
  };

  return (
    <section
      ref={scopeRef}
      id="features"
      className={featuresStyles.section}
      aria-labelledby="features-title"
    >
      <div
        className={featuresStyles.backgroundBlob1}
        data-animate="float"
        aria-hidden="true"
      />
      <div
        className={featuresStyles.backgroundBlob2}
        data-animate="float"
        aria-hidden="true"
      />
      <div
        className={featuresStyles.backgroundBlob3}
        data-animate="float"
        aria-hidden="true"
      />

      <div className={featuresStyles.container}>
        <div className={featuresStyles.headerContainer}>
          <div className={featuresStyles.badge} data-animate="fade-up">
            <span
              className={featuresStyles.badgeDot}
              aria-hidden="true"
            />
            <span className={featuresStyles.badgeText}>Powerful Features</span>
          </div>

          <h2
            id="features-title"
            className={featuresStyles.title}
            data-animate="fade-up"
          >
            Built for{" "}
            <span className={featuresStyles.titleGradient}>
              Speed &amp; Clarity
            </span>
          </h2>

          <p className={featuresStyles.subtitle} data-animate="fade-up">
            A minimal, intelligent interface that focuses on what truly matters
            - create, send and track invoices effortlessly while maintaining
            professional excellence.
          </p>
        </div>

        <div className={featuresStyles.featuresGrid} data-stagger>
          {features.map((feature) => (
            <FeatureCard key={feature.id} {...feature} />
          ))}
        </div>

        <div className={featuresStyles.bottomCtaContainer} data-animate="fade-up">
          <button
            type="button"
            onClick={handleExplore}
            className={featuresStyles.bottomCtaButton}
            data-hover="magnetic"
          >
            <span>{featuresStyles.bottomCtaButtonText}</span>
            <ArrowRight
              className={featuresStyles.bottomCtaButtonIcon}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Features;
