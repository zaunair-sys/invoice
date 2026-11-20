"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSelectedTemplate, setSelectedTemplate } from "@/lib/navState";
import TemplatePreview from "@/components/TemplatePreview";
import {
  DEFAULT_INVOICE_TEMPLATE,
  INVOICE_TEMPLATES,
  getInvoiceTemplate,
  normalizeInvoiceTemplate,
} from "@/lib/invoiceTemplates";
import { templateSelectorStyles } from "@/assets/dummyStyles";

function ArrowLeftIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function EyeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function TemplateSelector() {
  const router = useRouter();
  const previewRef = useRef(null);
  const [selectedTemplate, setSelectedTemplateState] = useState(() =>
    normalizeInvoiceTemplate(
      getSelectedTemplate() || DEFAULT_INVOICE_TEMPLATE
    )
  );

  const selected = getInvoiceTemplate(selectedTemplate);

  function selectTemplate(templateId) {
    const normalized = normalizeInvoiceTemplate(templateId);
    setSelectedTemplateState(normalized);
    setSelectedTemplate(normalized);
  }

  function previewTemplate(templateId) {
    selectTemplate(templateId);
    if (previewRef.current && typeof previewRef.current.scrollIntoView === "function") {
      previewRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function continueToCreate() {
    router.push(
      `/app/create-invoice?template=${encodeURIComponent(selected.id)}`
    );
  }

  return (
    <div className={templateSelectorStyles.pageContainer} data-no-animate>
      <div className={templateSelectorStyles.headerContainer}>
        <div>
          <span className="pti-eyebrow">Step 1 of 2 · Choose a layout</span>
          <h1 className={templateSelectorStyles.headerTitle}>
            Select Invoice Template
          </h1>
          <p className={templateSelectorStyles.headerSubtitle}>
            Pick a template first, then continue to build your invoice.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/app/dashboard")}
          className={templateSelectorStyles.backButton}
         
        >
          <ArrowLeftIcon />
          Back to dashboard
        </button>
      </div>

      <div className={templateSelectorStyles.layout}>
        <section className={templateSelectorStyles.cardGrid} role="radiogroup" aria-label="Invoice templates">
          {INVOICE_TEMPLATES.map((template) => {
            const active = template.id === selected.id;
            return (
              <div
                key={template.id}
                role="radio"
                aria-checked={active}
                data-active={active}
                tabIndex={0}
                onClick={() => selectTemplate(template.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectTemplate(template.id);
                  }
                }}
                className={templateSelectorStyles.card}
               
              >
                <div className={templateSelectorStyles.cardPreview}>
                  <TemplatePreview templateId={template.id} />
                </div>
                <div className={templateSelectorStyles.cardMeta}>
                  <span className={templateSelectorStyles.cardName}>{template.name}</span>
                  <span className={templateSelectorStyles.cardDescription}>
                    {template.description}
                  </span>
                </div>
                <div className={templateSelectorStyles.cardActions}>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      previewTemplate(template.id);
                    }}
                    className={templateSelectorStyles.previewButton}
                   
                  >
                    <EyeIcon />
                    Preview
                  </button>
                  {active ? (
                    <span className={templateSelectorStyles.selectedBadge}>
                      <CheckIcon />
                      Selected
                    </span>
                  ) : (
                    <span className={templateSelectorStyles.cardHint}>Click to select</span>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        <aside ref={previewRef} className={templateSelectorStyles.previewPanel}>
          <div className={templateSelectorStyles.previewCard}>
            <div className={templateSelectorStyles.previewHead}>
              <div>
                <span className="pti-eyebrow">Live preview</span>
                <h2 className={templateSelectorStyles.previewName}>{selected.name}</h2>
              </div>
              <span className={templateSelectorStyles.selectedBadge}>
                <CheckIcon />
                Selected
              </span>
            </div>
            <p className={templateSelectorStyles.previewDescription}>
              {selected.description}
            </p>
            <div className={templateSelectorStyles.previewStage}>
              <TemplatePreview templateId={selected.id} size="large" />
            </div>
            <button
              type="button"
              onClick={continueToCreate}
              className={templateSelectorStyles.continueButton}
             
            >
              Continue to invoice
              <ArrowRightIcon />
            </button>
            <p className={templateSelectorStyles.hint}>
              Your selection is saved if you refresh this page.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
