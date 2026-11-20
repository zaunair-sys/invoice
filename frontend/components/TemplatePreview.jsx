"use client";

import React from "react";

export default function TemplatePreview({ templateId = "classic", size = "card" }) {
  return (
    <span
      className={`pti-template-preview ${
        size === "large" ? "pti-template-preview-large" : ""
      }`}
      data-template={templateId}
      aria-hidden="true"
    >
      <span className="pti-template-preview-top">
        <span className="pti-template-preview-mark" />
        <span className="pti-template-preview-title">INVOICE</span>
      </span>
      <span className="pti-template-preview-lines">
        <span />
        <span />
      </span>
      <span className="pti-template-preview-rows">
        <span />
        <span />
        <span />
      </span>
      <span className="pti-template-preview-total" />
    </span>
  );
}
