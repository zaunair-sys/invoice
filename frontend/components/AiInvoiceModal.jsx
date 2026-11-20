"use client";

import React, { useRef, useState } from "react";
import { aiInvoiceModalStyles } from "@/assets/dummyStyles";
import { useModalAnimation } from "@/lib/animations";
import GeminiIcon from "./GeminiIcon";
import AnimatedButton from "@/assets/GenerateBtn/Gbtn";

const AiInvoiceModal = ({ open, onClose, onGenerate, initialText = "" }) => {
  const scopeRef = useRef(null);
  const [text, setText] = useState(initialText || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevInitialText, setPrevInitialText] = useState(initialText);

  if (prevOpen !== open || prevInitialText !== initialText) {
    setPrevOpen(open);
    setPrevInitialText(initialText);
    setText(initialText || "");
    setError("");
    setLoading(false);
  }

  useModalAnimation(scopeRef, open);

  if (!open) return null;

  async function handleGenerateClick() {
    setError("");
    const row = (text || "").trim();

    if (!row) {
      setError("Please paste invoice text to generate from AI");
      return;
    }

    try {
      setLoading(true);
      const maybePromise = onGenerate && onGenerate(row);
      if (maybePromise && typeof maybePromise.then === "function") {
        await maybePromise;
      }
    } catch (err) {
      console.error("onGenerate handler failed:", err);
      const msg =
        err &&
        (err.message ||
          (typeof err === "string" ? err : JSON.stringify(err)));
      setError(msg || "Failed to generate. Try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={aiInvoiceModalStyles.overlay} ref={scopeRef}>
      <div
        className={aiInvoiceModalStyles.backdrop}
        data-modal-backdrop
        onClick={() => onClose && onClose()}
        aria-hidden="true"
      />

      <div
        className={aiInvoiceModalStyles.modal}
        data-modal-panel
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-invoice-modal-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              id="ai-invoice-modal-title"
              className={aiInvoiceModalStyles.title}
            >
              <GeminiIcon className="w-6 h-6 flex-none" />
              Create Invoice with AI
            </h3>
            <p className={aiInvoiceModalStyles.description}>
              Paste any text that contains invoice details (client, items, qty,
              prices) and we will attempt to extract an invoice
            </p>
          </div>

          <button
            type="button"
            onClick={() => onClose && onClose()}
            className={aiInvoiceModalStyles.closeButton}
            aria-label="Close dialog"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="mt-4">
          <label htmlFor="ai-invoice-text" className={aiInvoiceModalStyles.label}>
            Paste invoice text
          </label>
          <textarea
            id="ai-invoice-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`eg. A person wants a logo design for her organic brand "GreenVibe."
Quoted for $120 for 2 logo options and final delivery in PNG and vector format`}
            rows={8}
            className={aiInvoiceModalStyles.textarea}
          />
        </div>

        {error && (
          <div className={aiInvoiceModalStyles.error} role="alert">
            {String(error)
              .split("\n")
              .map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            {/quota|exhausted|resource_exhausted/i.test(String(error)) && (
              <div className="pti-card-sub mt-2">
                Tip: AI is temporarily unavailable (quota). Try again in a few
                minutes, or create the invoice manually.
              </div>
            )}
          </div>
        )}

        <div className={aiInvoiceModalStyles.actions}>
          <button
            type="button"
            onClick={() => onClose && onClose()}
            className="pti-btn pti-btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <AnimatedButton
            onClick={handleGenerateClick}
            isLoading={loading}
            disabled={loading}
            label="Generate"
          />
        </div>
      </div>
    </div>
  );
};

export default AiInvoiceModal;
