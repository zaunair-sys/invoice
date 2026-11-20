"use client";

import React from "react";

const StatusIcons = {
  paid: ({ className = "w-3 h-3" }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  unpaid: ({ className = "w-3 h-3" }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  overdue: ({ className = "w-3 h-3" }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  draft: ({ className = "w-3 h-3" }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

const statusConfig = {
  paid: { tone: "pti-badge--success", icon: "paid", pulse: false },
  unpaid: { tone: "pti-badge--warning", icon: "unpaid", pulse: true },
  overdue: { tone: "pti-badge--danger", icon: "overdue", pulse: true },
  draft: { tone: "pti-badge--neutral", icon: "draft", pulse: false },
  default: { tone: "pti-badge--neutral", icon: "draft", pulse: false },
};

const sizeClasses = {
  small: "text-[11px] px-2.5 py-1 gap-1.5",
  default: "text-xs px-3 py-1.5 gap-2",
  large: "text-sm px-4 py-2 gap-2.5",
};

const StatusBadge = ({ status = "", size = "default", showIcon = true }) => {
  const s = (status || "").toLowerCase();
  const config = statusConfig[s] || statusConfig.default;
  const IconComponent = StatusIcons[config.icon] || StatusIcons.draft;
  const label = status || "draft";

  return (
    <span
      className={`pti-badge ${config.tone} ${
        sizeClasses[size] || sizeClasses.default
      }`}
      role="status"
      aria-label={`Status: ${label}`}
    >
      {showIcon && (
        <span className="flex items-center" aria-hidden="true">
          <IconComponent className="w-3 h-3" />
        </span>
      )}
      <span className="font-semibold tracking-wide first-letter:uppercase">
        {label}
      </span>
      {config.pulse && (
        <span className="pti-dot pti-pulse" aria-hidden="true" />
      )}
    </span>
  );
};

export function StatusWithCount({ status, count, size = "default" }) {
  return (
    <span className="inline-flex items-center gap-2">
      <StatusBadge status={status} size={size} />
      {count !== undefined && (
        <span className="pti-badge pti-badge--neutral text-[11px] px-2 py-1 pti-mono-num">
          {count}
        </span>
      )}
    </span>
  );
}

export default StatusBadge;
