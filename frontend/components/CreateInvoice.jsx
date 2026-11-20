"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import TemplatePreview from "@/components/TemplatePreview";
import {
  clearInvoiceDraft,
  getInvoiceDraft,
  getNavState,
  setInvoiceDraft,
  setNavState,
} from "@/lib/navState";
import {
  INVOICE_TEMPLATES,
  normalizeInvoiceTemplate,
} from "@/lib/invoiceTemplates";
import {
  createInvoiceStyles,
  createInvoiceIconColors,
  createInvoiceCustomStyles,
} from "@/assets/dummyStyles";

/* ---------- API BASE ---------- */
const API_BASE = "http://localhost:4000";

const INVOICE_STATUS_OPTIONS = [
  { value: "draft", label: "Draft", description: "Not sent yet" },
  { value: "unpaid", label: "Unpaid", description: "Awaiting payment" },
  { value: "paid", label: "Paid", description: "Payment received" },
  { value: "overdue", label: "Overdue", description: "Past due date" },
];

const INVOICE_CURRENCY_OPTIONS = [
  { value: "USD", symbol: "$", label: "US Dollar", description: "United States" },
  { value: "EUR", symbol: "€", label: "Euro", description: "European Union" },
  { value: "CUSTOM", symbol: "¤", label: "Custom", description: "Use your own symbol" },
];

/* ---------- storage helpers (unchanged) ---------- */
/* ----------------- frontend-only: normalize image URLs ----------------- */
function resolveImageUrl(url) {
  if (!url) return null;
  const s = String(url).trim();

  // keep data/blobs as-is
  if (s.startsWith("data:") || s.startsWith("blob:")) return s;

  // absolute http(s)
  if (/^https?:\/\//i.test(s)) {
    try {
      const parsed = new URL(s);
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        // rewrite localhost -> API_BASE (preserve path/search/hash)
        const path =
          parsed.pathname + (parsed.search || "") + (parsed.hash || "");
        return `${API_BASE.replace(/\/+$/, "")}${path}`;
      }
      return parsed.href;
    } catch {
      // fall through to relative handling
    }
  }

  // relative paths like "/uploads/..." or "uploads/..." -> prefix with API_BASE
  return `${API_BASE.replace(/\/+$/, "")}/${s.replace(/^\/+/, "")}`;
}

function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function writeJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (error) {
    console.warn("Failed to write localStorage:", error);
  }
}

/* ---------- local invoices helpers (fallback) ---------- */
function getStoredInvoices() {
  return readJSON("invoices_v1", []) || [];
}
function saveStoredInvoices(arr) {
  writeJSON("invoices_v1", arr);
}

/* ---------- util ---------- */
function uid() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (error) {
    console.warn("Failed to generate uuid:", error);
  }
  return Math.random().toString(36).slice(2, 9);
}
function currencyFmt(amount = 0, currency = "USD", customSymbol = "") {
  const value = Number(amount || 0);
  const code = String(currency || "USD").toUpperCase();

  if (code === "CUSTOM") {
    const symbol = String(customSymbol || "").trim() || "¤";
    return `${symbol}${value.toFixed(2)}`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${code} ${value.toFixed(2)}`;
  }
}
function computeTotals(items = [], taxPercent = 0) {
  const safe = Array.isArray(items) ? items.filter(Boolean) : [];
  const subtotal = safe.reduce(
    (s, it) => s + Number(it.qty || 0) * Number(it.unitPrice || 0),
    0
  );
  const tax = (subtotal * Number(taxPercent || 0)) / 100;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

/* ---------- icons ---------- (kept same as before) */
const PreviewIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const SaveIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
const TemplateIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const UploadIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const DeleteIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const AddIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 5v14m-7-7h14" />
  </svg>
);

/* ---------- Component (Create / Edit Invoice) ---------- */
export default function CreateInvoice({ initialTemplate }) {
  const router = useRouter();
  const { id } = useParams();

  // Next's router has no equivalent of react-router's `navigate(to, { state })`;
  // any invoice object handed off from another page (AI generation, preview->edit,
  // create->preview) is bridged via sessionStorage, keyed by the id in the URL.
  const invoiceFromState = id ? getNavState(id) : null;
  const isEditing = Boolean(id && id !== "new");
  const restoredDraft =
    !isEditing && !invoiceFromState ? getInvoiceDraft() : null;

  // Auth hooks
  const { getToken, isSignedIn } = useAuth();

  // helper to obtain token with a retry
  const obtainToken = useCallback(async () => {
    if (typeof getToken !== "function") return null;
    try {
      let token = await getToken({ template: "default" }).catch(() => null);
      if (!token) {
        token = await getToken({ forceRefresh: true }).catch(() => null);
      }
      return token;
    } catch {
      return null;
    }
  }, [getToken]);

  // invoice & items state
  function buildDefaultInvoice() {
    // Use a safe client-side local id for previews and local storage.
    const localId = uid();
    return {
      id: localId, // local preview id (server will return _id after save)
      invoiceNumber: "", // will be set on creation by generator
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: "",
      fromBusinessName: "",
      fromEmail: "",
      fromAddress: "",
      fromPhone: "",
      fromTaxId: "", // EIN for US, VAT for Europe
      client: { name: "", email: "", address: "", phone: "" },
      items: [
        { id: uid(), description: "Service / Item", qty: 1, unitPrice: 0 },
      ],
      currency: "USD",
      currencySymbol: "",
      status: "draft",
      template: normalizeInvoiceTemplate(initialTemplate),
      stampDataUrl: null,
      signatureDataUrl: null,
      logoDataUrl: null,
      signatureName: "",
      signatureTitle: "",
      // leave taxPercent undefined so business profile default can fill it
      taxPercent: undefined,
      notes: "",
    };
  }

  const [invoice, setInvoice] = useState(() => {
    const base = buildDefaultInvoice();
    const draftInvoice = restoredDraft?.invoice;
    if (!draftInvoice) return base;
    return {
      ...base,
      ...draftInvoice,
      template: normalizeInvoiceTemplate(
        initialTemplate || draftInvoice.template || base.template
      ),
      currency: String(draftInvoice.currency || base.currency).toUpperCase(),
      currencySymbol: String(draftInvoice.currencySymbol || "").trim(),
    };
  });
  const [items, setItems] = useState(() => {
    const draftItems = restoredDraft?.items;
    return Array.isArray(draftItems) ? draftItems : invoice.items || [];
  });
  const [loading, setLoading] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  useEffect(() => {
    if (id || !invoice) return;
    setInvoiceDraft({ invoice: { ...invoice, items }, items });
  }, [id, invoice, items]);

  // profile fetched from server

  /* ---------- helpers for invoice editing ---------- */
  function updateInvoiceField(field, value) {
    setInvoice((inv) => (inv ? { ...inv, [field]: value } : inv));
  }
  function updateClient(field, value) {
    setInvoice((inv) =>
      inv ? { ...inv, client: { ...(inv.client || {}), [field]: value } } : inv
    );
  }

  function updateItem(idx, key, value) {
    setItems((arr) => {
      const copy = arr.slice();
      const it = { ...(copy[idx] || {}) };
      if (key === "description") it.description = value;
      else if (key === "unitPrice") {
        const raw = String(value).replace(/[^0-9.]/g, "");
        const [whole, ...decimals] = raw.split(".");
        it.unitPrice = decimals.length
          ? `${whole}.${decimals.join("").slice(0, 2)}`
          : whole;
      } else it[key] = Number(value) || 0;
      copy[idx] = it;
      setInvoice((inv) => (inv ? { ...inv, items: copy } : inv));
      return copy;
    });
  }
  function addItem() {
    const it = { id: uid(), description: "", qty: 1, unitPrice: 0 };
    setItems((arr) => {
      const next = [...arr, it];
      setInvoice((inv) => (inv ? { ...inv, items: next } : inv));
      return next;
    });
  }
  function removeItem(idx) {
    setItems((arr) => {
      const next = arr.filter((_, i) => i !== idx);
      setInvoice((inv) => (inv ? { ...inv, items: next } : inv));
      return next;
    });
  }

  /* status & currency handlers */
  function handleStatusChange(newStatus) {
    setInvoice((inv) => (inv ? { ...inv, status: newStatus } : inv));
  }
  function handleCurrencyChange(newCurrency) {
    setInvoice((inv) =>
      inv ? { ...inv, currency: String(newCurrency || "USD").toUpperCase() } : inv
    );
  }

  /* images - keep as data URLs in the invoice object */
  function handleImageUpload(file, kind = "logo") {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      const dataUrl = target?.result;
      if (!dataUrl) return;
      setInvoice((inv) =>
        inv
          ? {
            ...inv,
            [`${kind}DataUrl`]: dataUrl,
            ...(kind === "logo" ? { logoDataUrl: dataUrl } : {}),
          }
          : inv
      );
    };
    reader.readAsDataURL(file);
  }
  function removeImage(kind = "logo") {
    setInvoice((inv) =>
      inv
        ? {
          ...inv,
          [`${kind}DataUrl`]: null,
          ...(kind === "logo" ? { logoDataUrl: null } : {}),
        }
        : inv
    );
  }

  /* ---------- helper: check candidate invoiceNumber exists on server/local ---------- */
  const checkInvoiceExists = useCallback(
    async (candidate) => {
      // Check local storage first
      const local = getStoredInvoices();
      if (local.some((x) => x && x.invoiceNumber === candidate)) return true;

      // If we have token, ask server
      try {
        const token = await obtainToken();
        const headers = { Accept: "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(
          `${API_BASE}/api/invoices?invoiceNumber=${encodeURIComponent(
            candidate
          )}`,
          { method: "GET", headers }
        );
        if (!res.ok) {
          // if unauthorized or server error, treat as "not found" to avoid blocking generation;
          // collisions will still be caught on save (server returns 409).
          return false;
        }
        const json = await res.json().catch(() => null);
        const data = json?.data || json || [];
        if (Array.isArray(data) && data.length > 0) return true;
        return false;
      } catch {
        // network / other error -> assume not exists (we rely on server-side check on save)
        return false;
      }
    },
    [obtainToken]
  );

  /* ---------- generator: create a candidate and ensure uniqueness (tries up to N times) ---------- */
  const generateUniqueInvoiceNumber = useCallback(
    async (attempts = 10) => {
      for (let i = 0; i < attempts; i++) {
        const datePart = new Date()
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "");
        const rand = Math.floor(Math.random() * 9000) + 1000; // 4 digit
        const candidate = `INV-${datePart}-${rand}`;
        // quick local check first
        const exists = await checkInvoiceExists(candidate);
        if (!exists) return candidate;
        // else loop to try again
      }
      // fallback: use uid suffix if all attempts collide (very unlikely)
      return `INV-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "")}-${uid().slice(0, 4)}`;
    },
    [checkInvoiceExists]
  );

  /* ---------- fetch business profile as soon as page loads (when signed in) ---------- */
  useEffect(() => {
    let mounted = true;

    async function fetchBusinessProfile() {
      if (!isSignedIn) return;
      try {
        const token = await obtainToken();
        if (!token) return;
        const res = await fetch(`${API_BASE}/api/businessProfile/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (!res.ok || res.status === 204) return;
        const json = await res.json().catch(() => null);
        const data = json?.data || json || null;
        if (!data || !mounted) return;

        const serverProfile = {
          businessName: data.businessName ?? "",
          email: data.email ?? "",
          address: data.address ?? "",
          phone: data.phone ?? "",
          taxId: data.taxId ?? data.gst ?? "", // Support legacy GST field
          defaultTaxPercent: data.defaultTaxPercent ?? 0,
          signatureOwnerName: data.signatureOwnerName ?? "",
          signatureOwnerTitle: data.signatureOwnerTitle ?? "",
          logoUrl: data.logoUrl ?? null,
          stampUrl: data.stampUrl ?? null,
          signatureUrl: data.signatureUrl ?? null,
        };


        // Merge into invoice only if those invoice fields are empty/unset
        setInvoice((prev) => {
          if (!prev) return prev;
          const shouldOverwriteBusinessName =
            !prev.fromBusinessName || prev.fromBusinessName.trim() === "";
          const shouldOverwriteEmail =
            !prev.fromEmail || prev.fromEmail.trim() === "";
          const shouldOverwriteAddress =
            !prev.fromAddress || prev.fromAddress.trim() === "";
          const shouldOverwritePhone =
            !prev.fromPhone || prev.fromPhone.trim() === "";
          const shouldOverwriteTaxId =
            !prev.fromTaxId || prev.fromTaxId.trim() === "";

          const merged = {
            ...prev,
            fromBusinessName: shouldOverwriteBusinessName
              ? serverProfile.businessName
              : prev.fromBusinessName,
            fromEmail: shouldOverwriteEmail
              ? serverProfile.email
              : prev.fromEmail,
            fromAddress: shouldOverwriteAddress
              ? serverProfile.address
              : prev.fromAddress,
            fromPhone: shouldOverwritePhone
              ? serverProfile.phone
              : prev.fromPhone,
            fromTaxId: shouldOverwriteTaxId ? serverProfile.taxId : prev.fromTaxId,
            logoDataUrl:
              prev.logoDataUrl ||
              resolveImageUrl(serverProfile.logoUrl) ||
              null,
            stampDataUrl:
              prev.stampDataUrl ||
              resolveImageUrl(serverProfile.stampUrl) ||
              null,
            signatureDataUrl:
              prev.signatureDataUrl ||
              resolveImageUrl(serverProfile.signatureUrl) ||
              null,
            signatureName:
              prev.signatureName || serverProfile.signatureOwnerName || "",
            signatureTitle:
              prev.signatureTitle || serverProfile.signatureOwnerTitle || "",
            taxPercent:
              prev && prev.taxPercent !== undefined && prev.taxPercent !== null
                ? prev.taxPercent
                : serverProfile.defaultTaxPercent,
          };

          return merged;
        });
      } catch (err) {
        console.warn("Failed to fetch business profile:", err);
      }
    }

    fetchBusinessProfile();

    return () => {
      mounted = false;
    };
  }, [isSignedIn, obtainToken]);

  /* ---------- load invoice when editing (server first, fallback local) ---------- */
  useEffect(() => {
    let mounted = true;

    async function prepare() {
      // If AI/Gemini/preview handoff passed an invoice via sessionStorage
      if (invoiceFromState) {
        // merge then normalize any image URLs that may be `http://localhost:...`
        const base = { ...buildDefaultInvoice(), ...invoiceFromState };

        base.logoDataUrl =
          resolveImageUrl(base.logoDataUrl ?? base.logoUrl ?? base.logo) ||
          null;
        base.stampDataUrl =
          resolveImageUrl(base.stampDataUrl ?? base.stampUrl ?? base.stamp) ||
          null;
        base.signatureDataUrl =
          resolveImageUrl(
            base.signatureDataUrl ?? base.signatureUrl ?? base.signature
          ) || null;
        base.template = normalizeInvoiceTemplate(
          invoiceFromState.template ?? initialTemplate ?? base.template
        );
        base.currency = String(base.currency || "USD").toUpperCase();
        base.currencySymbol = String(base.currencySymbol || "").trim();

        setInvoice(base);

        setItems(
          Array.isArray(invoiceFromState.items)
            ? invoiceFromState.items.slice()
            : invoiceFromState.items
              ? [...invoiceFromState.items]
              : buildDefaultInvoice().items
        );

        return;
      }

      // If editing and no invoiceFromState then fetch from server (or local fallback)
      if (isEditing && !invoiceFromState) {
        setLoading(true);
        try {
          const token = await obtainToken();
          const headers = { Accept: "application/json" };
          if (token) headers["Authorization"] = `Bearer ${token}`;

          const res = await fetch(`${API_BASE}/api/invoices/${id}`, {
            method: "GET",
            headers,
          });
          if (res.ok) {
            const json = await res.json().catch(() => null);
            const data = json?.data || json || null;
            if (data && mounted) {
              const merged = { ...buildDefaultInvoice(), ...data };
              merged.id = data._id ?? data.id ?? merged.id;
              merged.invoiceNumber = data.invoiceNumber ?? merged.invoiceNumber;

              // normalize server-returned image fields (rewrite localhost/relative -> API_BASE)
              merged.logoDataUrl =
                resolveImageUrl(
                  data.logoDataUrl ?? data.logoUrl ?? data.logo
                ) ||
                merged.logoDataUrl ||
                null;
              merged.stampDataUrl =
                resolveImageUrl(
                  data.stampDataUrl ?? data.stampUrl ?? data.stamp
                ) ||
                merged.stampDataUrl ||
                null;
              merged.signatureDataUrl =
                resolveImageUrl(
                  data.signatureDataUrl ?? data.signatureUrl ?? data.signature
                ) ||
                merged.signatureDataUrl ||
                null;
              merged.template = normalizeInvoiceTemplate(
                data.template ?? merged.template
              );
              merged.currency = String(merged.currency || "USD").toUpperCase();
              merged.currencySymbol = String(merged.currencySymbol || "").trim();

              setInvoice(merged);
              setItems(
                Array.isArray(data.items) ? data.items.slice() : merged.items
              );
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          // ignore and fallback
          console.warn(
            "Server invoice fetch failed, will fallback to local:",
            err
          );
        } finally {
          setLoading(false);
        }

        // fallback to local storage
        const all = getStoredInvoices();
        const found = all.find(
          (x) => x && (x.id === id || x._id === id || x.invoiceNumber === id)
        );
        if (found && mounted) {
          const fixed = { ...buildDefaultInvoice(), ...found };

          fixed.logoDataUrl =
            resolveImageUrl(found.logoDataUrl ?? found.logoUrl ?? found.logo) ||
            fixed.logoDataUrl ||
            null;
          fixed.stampDataUrl =
            resolveImageUrl(
              found.stampDataUrl ?? found.stampUrl ?? found.stamp
            ) ||
            fixed.stampDataUrl ||
            null;
          fixed.signatureDataUrl =
            resolveImageUrl(
              found.signatureDataUrl ?? found.signatureUrl ?? found.signature
            ) ||
            fixed.signatureDataUrl ||
            null;
          fixed.template = normalizeInvoiceTemplate(
            found.template ?? fixed.template
          );
          fixed.currency = String(fixed.currency || "USD").toUpperCase();
          fixed.currencySymbol = String(fixed.currencySymbol || "").trim();

          setInvoice(fixed);
          setItems(
            Array.isArray(found.items)
              ? found.items.slice()
              : buildDefaultInvoice().items
          );
        }

        return;
      }

      // Creating new (neither editing nor invoiceFromState)
      // Build default invoice then generate unique invoiceNumber and set it
      setInvoice((prev) => {
        const base = { ...buildDefaultInvoice(), ...prev };
        base.template = normalizeInvoiceTemplate(
          initialTemplate || base.template
        );
        return base;
      });
      setItems((current) =>
        Array.isArray(current) && current.length
          ? current
          : buildDefaultInvoice().items
      );

      // generate unique invoice number for new invoices
      if (!isEditing && !restoredDraft?.invoice?.invoiceNumber) {
        try {
          const candidate = await generateUniqueInvoiceNumber(10);
          if (mounted) {
            setInvoice((inv) =>
              inv ? { ...inv, invoiceNumber: candidate } : inv
            );
          }
        } catch (err) {
          // ignore, keep empty (server will handle on save)
          console.warn("Invoice number generation failed:", err);
        }
      }
    }

    prepare();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    id,
    isEditing,
    initialTemplate,
    obtainToken,
    generateUniqueInvoiceNumber,
  ]);

  /* ---------- Save invoice to backend (POST or PUT) using auth token ---------- */
  async function handleSave() {
    if (!invoice) return;
    setLoading(true);

    try {
      // Build prepared object but OMIT invoiceNumber when empty so server auto-generates.
      const prepared = {
        issueDate: invoice.issueDate || "",
        dueDate: invoice.dueDate || "",
        fromBusinessName: invoice.fromBusinessName || "",
        fromEmail: invoice.fromEmail || "",
        fromAddress: invoice.fromAddress || "",
        fromPhone: invoice.fromPhone || "",
        fromTaxId: invoice.fromTaxId || invoice.fromGst || "", // Support legacy GST field
        client: invoice.client || {},
        items: (items || []).map((it) => ({
          ...it,
          qty: Number(it.qty) || 0,
          unitPrice: Number(it.unitPrice) || 0,
        })),
        currency: invoice.currency || "USD",
        currencySymbol: invoice.currencySymbol || "",
        status: invoice.status || "draft",
        template: normalizeInvoiceTemplate(invoice.template),
        taxPercent: Number(invoice.taxPercent ?? 18),
        subtotal: computeTotals(items, invoice.taxPercent).subtotal,
        tax: computeTotals(items, invoice.taxPercent).tax,
        total: computeTotals(items, invoice.taxPercent).total,
        logoDataUrl: invoice.logoDataUrl || null,
        stampDataUrl: invoice.stampDataUrl || null,
        signatureDataUrl: invoice.signatureDataUrl || null,
        signatureName: invoice.signatureName || "",
        signatureTitle: invoice.signatureTitle || "",
        notes: invoice.notes || "",
        localId: invoice.id,
      };

      // include invoiceNumber only if provided (we prefill for new invoices)
      if (
        invoice.invoiceNumber &&
        String(invoice.invoiceNumber).trim().length > 0
      ) {
        prepared.invoiceNumber = String(invoice.invoiceNumber).trim();
      }

      const endpoint =
        isEditing && invoice.id
          ? `${API_BASE}/api/invoices/${invoice.id}`
          : `${API_BASE}/api/invoices`;
      const method = isEditing && invoice.id ? "PUT" : "POST";

      // try to obtain auth token; if present include Authorization
      const token = await obtainToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(prepared),
      });

      // handle conflict (409) when user supplied invoiceNumber already exists
      if (res.status === 409) {
        const json = await res.json().catch(() => null);
        const message = json?.message || "Invoice number already exists.";
        // Let the user decide — do not auto-retry; they may want to pick a different number.
        throw new Error(message);
      }

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = json?.message || `Save failed (${res.status})`;
        throw new Error(msg);
      }

      const saved = json?.data || json || null;
      const savedId = saved?._id ?? saved?.id ?? invoice.id;

      // Use server-provided invoiceNumber (if server generated one)
      const merged = {
        ...prepared,
        id: savedId,
        invoiceNumber:
          saved?.invoiceNumber ??
          prepared.invoiceNumber ??
          invoice.invoiceNumber,
        subtotal: saved?.subtotal ?? prepared.subtotal,
        tax: saved?.tax ?? prepared.tax,
        total: saved?.total ?? prepared.total,
        currency: String(saved?.currency ?? prepared.currency ?? "USD").toUpperCase(),
        currencySymbol: String(
          saved?.currencySymbol ?? prepared.currencySymbol ?? ""
        ).trim(),
      };

      setInvoice((inv) => ({ ...inv, ...merged }));
      setItems(Array.isArray(saved?.items) ? saved.items : items);

      // update local stored invoices (keep local fallback in sync)
      const all = getStoredInvoices();
      if (isEditing) {
        const idx = all.findIndex(
          (x) =>
            x &&
            (x.id === invoice.id ||
              x._id === invoice.id ||
              x.invoiceNumber === invoice.invoiceNumber)
        );
        if (idx >= 0) all[idx] = merged;
        else all.unshift(merged);
      } else {
        // For newly created, use server's invoiceNumber/id if provided
        all.unshift(merged);
      }
      saveStoredInvoices(all);
      clearInvoiceDraft();

      alert(`Invoice ${isEditing ? "updated" : "created"} successfully.`);
      router.push("/app/invoices");
    } catch (err) {
      console.error("Failed to save invoice to server:", err);

      // If it was a 409 conflict (duplicate invoice number provided by user), show message and let user fix.
      if (
        String(err?.message || "")
          .toLowerCase()
          .includes("invoice number")
      ) {
        alert(err.message || "Invoice number already exists. Choose another.");
        setLoading(false);
        return;
      }

      // fallback: save locally
      try {
        const all = getStoredInvoices();
        const preparedLocal = {
          ...invoice,
          items,
          subtotal: computeTotals(items, invoice.taxPercent).subtotal,
          tax: computeTotals(items, invoice.taxPercent).tax,
          total: computeTotals(items, invoice.taxPercent).total,
        };
        if (isEditing) {
          const idx = all.findIndex(
            (x) =>
              x &&
              (x.id === invoice.id ||
                x._id === invoice.id ||
                x.invoiceNumber === invoice.invoiceNumber)
          );
          if (idx >= 0) all[idx] = preparedLocal;
          else all.unshift(preparedLocal);
        } else {
          all.unshift(preparedLocal);
        }
        saveStoredInvoices(all);
        alert("Saved locally as fallback (server error).");
        router.push("/app/invoices");
      } catch (localErr) {
        console.error("Local fallback failed:", localErr);
        alert(err?.message || "Save failed. See console.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handlePreview() {
    const prepared = {
      ...invoice,
      items,
      template: normalizeInvoiceTemplate(invoice.template),
      subtotal: computeTotals(items, invoice.taxPercent).subtotal,
      tax: computeTotals(items, invoice.taxPercent).tax,
      total: computeTotals(items, invoice.taxPercent).total,
    };
    setNavState(invoice.id, prepared);
    router.push(`/app/invoices/${invoice.id}/preview`);
  }

  const activeStatus = String(invoice?.status || "draft").toLowerCase();
  const activeCurrency = String(invoice?.currency || "USD").toUpperCase();
  const customCurrencySymbol = String(invoice?.currencySymbol || "").trim();
  const selectedCurrency =
    INVOICE_CURRENCY_OPTIONS.find((option) => option.value === activeCurrency) ||
    INVOICE_CURRENCY_OPTIONS[0];
  const totals = computeTotals(items, invoice?.taxPercent ?? 18);

  /* ---------- JSX (kept structure, invoiceNumber input prefills generated value) ---------- */
  return (
    <div
      className={`${createInvoiceStyles.pageContainer} pti-container pti-create-invoice`}
      data-no-animate
    >
      <div
        className={createInvoiceStyles.headerContainer}
       
      >
        <div>
          <span className="pti-eyebrow">Invoice workspace</span>
          <h1 className={createInvoiceStyles.headerTitle}>
            {isEditing ? "Edit Invoice" : "Create New Invoice"}
          </h1>
          <p className={createInvoiceStyles.headerSubtitle}>
            {isEditing
              ? "Update invoice details and items below"
              : "Fill in invoice details, add line items, and configure branding"}
          </p>
        </div>

        <div className={createInvoiceStyles.headerButtonContainer}>
          {(!isEditing || activeStatus === "draft") && (
            <button
              type="button"
              onClick={() => setTemplatePickerOpen((open) => !open)}
              aria-expanded={templatePickerOpen}
             
              className={createInvoiceStyles.previewButton}
            >
              <TemplateIcon className="w-4 h-4" aria-hidden="true" />
              Change Template
            </button>
          )}
          <button
            type="button"
            onClick={handlePreview}
           
            className={createInvoiceStyles.previewButton}
          >
            <PreviewIcon className="w-4 h-4" aria-hidden="true" />
            Preview Invoice
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
           
            aria-busy={loading}
            className={createInvoiceStyles.saveButton}
          >
            <SaveIcon className="w-4 h-4" aria-hidden="true" />
            {loading
              ? "Saving..."
              : isEditing
                ? "Update Invoice"
                : "Create Invoice"}
          </button>
        </div>
      </div>
      {(!isEditing || activeStatus === "draft") && templatePickerOpen && (
        <div
          className={`${createInvoiceStyles.cardContainer} pti-card-hover mb-6`}
         
        >
          <div className={createInvoiceStyles.templateHeader}>
            <div>
              <span className={createInvoiceStyles.labelWithMargin}>
                Template
              </span>
              <p className={createInvoiceStyles.templateHint}>
                Choose a new layout for this draft invoice.
              </p>
            </div>
            <span className={createInvoiceStyles.templateCount}>
              {INVOICE_TEMPLATES.length} layouts
            </span>
          </div>
          <div
            className={createInvoiceStyles.templateGrid}
            role="radiogroup"
            aria-label="Draft invoice template"
          >
            {INVOICE_TEMPLATES.map((template) => {
              const active =
                normalizeInvoiceTemplate(invoice?.template) === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-active={active}
                 
                  onClick={() => updateInvoiceField("template", template.id)}
                  className={createInvoiceStyles.templateCard}
                >
                  <TemplatePreview templateId={template.id} />
                  <span className={createInvoiceStyles.templateMeta}>
                    <span className={createInvoiceStyles.templateName}>
                      {template.name}
                    </span>
                    <span className={createInvoiceStyles.templateDescription}>
                      {template.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div
        className={`${createInvoiceStyles.cardContainer} pti-card-hover`}
       
      >
        <div className={createInvoiceStyles.cardHeaderContainer}>
          <div
            className={`${createInvoiceStyles.cardIconContainer} ${createInvoiceIconColors.invoice}`}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h2 className={createInvoiceStyles.cardTitle}>Invoice Details</h2>
        </div>

        <div className={createInvoiceStyles.gridCols3}>
          <div>
            <label className={createInvoiceStyles.label} htmlFor="ci-number">
              Invoice Number
            </label>
            <input
              id="ci-number"
              value={invoice?.invoiceNumber || ""}
              onChange={(e) =>
                updateInvoiceField("invoiceNumber", e.target.value)
              }
              className={createInvoiceStyles.inputMedium}
            />
          </div>

          <div>
            <label className={createInvoiceStyles.label} htmlFor="ci-issue-date">
              Invoice Date
            </label>
            <input
              id="ci-issue-date"
              type="date"
              value={invoice?.issueDate || ""}
              onChange={(e) => updateInvoiceField("issueDate", e.target.value)}
              className={createInvoiceStyles.input}
            />
          </div>

          <div>
            <label className={createInvoiceStyles.label} htmlFor="ci-due-date">
              Due Date
            </label>
            <input
              id="ci-due-date"
              type="date"
              value={invoice?.dueDate || ""}
              onChange={(e) => updateInvoiceField("dueDate", e.target.value)}
              className={createInvoiceStyles.input}
            />
          </div>
        </div>

        {/* Currency and Status Section */}
        <div className={createInvoiceStyles.currencyStatusGrid}>
          <div className={createInvoiceStyles.currencySection}>
            <div className={createInvoiceStyles.currencyHead}>
              <div>
                <span
                  className={createInvoiceStyles.labelWithMargin}
                  id="ci-currency-label"
                >
                  Currency
                </span>
                <p className={createInvoiceStyles.currencyHint}>
                  Choose how invoice amounts are displayed.
                </p>
              </div>
              <span className={createInvoiceStyles.currencySummary}>
                <span className={createInvoiceStyles.currencySummarySymbol}>
                  {activeCurrency === "CUSTOM"
                    ? customCurrencySymbol || "¤"
                    : selectedCurrency.symbol}
                </span>
                <span className="font-semibold">
                  {activeCurrency === "CUSTOM" ? "Custom" : activeCurrency}
                </span>
              </span>
            </div>
            <div
              className={createInvoiceStyles.currencyGrid}
              role="radiogroup"
              aria-labelledby="ci-currency-label"
            >
              {INVOICE_CURRENCY_OPTIONS.map((option) => {
                const active = activeCurrency === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    data-active={active}
                   
                    onClick={() => handleCurrencyChange(option.value)}
                    className={createInvoiceStyles.currencyOption}
                  >
                    <span className={createInvoiceStyles.currencyOptionSymbol}>
                      {option.symbol}
                    </span>
                    <span className={createInvoiceStyles.currencyOptionMeta}>
                      <span className="font-semibold">{option.label}</span>
                      <span
                        className={createInvoiceStyles.currencyOptionDescription}
                      >
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            {activeCurrency === "CUSTOM" && (
              <div className={createInvoiceStyles.customCurrencyField}>
                <label
                  htmlFor="ci-custom-currency"
                  className={createInvoiceStyles.label}
                >
                  Currency symbol
                </label>
                <div className={createInvoiceStyles.customCurrencyInputWrap}>
                  <span className={createInvoiceStyles.customCurrencyPreview}>
                    {customCurrencySymbol || "¤"}
                  </span>
                  <input
                    id="ci-custom-currency"
                    type="text"
                    maxLength={8}
                    value={invoice?.currencySymbol || ""}
                    onChange={(e) =>
                      updateInvoiceField("currencySymbol", e.target.value)
                    }
                    placeholder="e.g. £, ¥, ₿"
                    className={createInvoiceStyles.customCurrencyInput}
                  />
                </div>
                <p className={createInvoiceStyles.currencyHint}>
                  This symbol will be used in all invoice amounts.
                </p>
              </div>
            )}
          </div>

          <div className={createInvoiceStyles.statusSection}>
            <div className={createInvoiceStyles.statusSectionHead}>
              <div>
                <span
                  className={createInvoiceStyles.labelWithMargin}
                  id="ci-status-label"
                >
                  Status
                </span>
                <p className={createInvoiceStyles.statusHint}>
                  Track where this invoice stands.
                </p>
              </div>
              <span className={createInvoiceStyles.statusSummary}>
                <StatusBadge status={activeStatus} size="small" showIcon />
              </span>
            </div>

            <div
              className={createInvoiceStyles.statusGrid}
              role="radiogroup"
              aria-labelledby="ci-status-label"
            >
              {INVOICE_STATUS_OPTIONS.map((status) => {
                const active = activeStatus === status.value;
                return (
                  <button
                    key={status.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    data-active={active}
                    onClick={() => handleStatusChange(status.value)}
                   
                    className={createInvoiceStyles.statusOption}
                  >
                    <StatusBadge
                      status={status.label}
                      size="small"
                      showIcon
                    />
                    <span className={createInvoiceStyles.statusDescription}>
                      {status.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className={createInvoiceStyles.statusDropdown}>
              <div className={createInvoiceStyles.statusSelectWrap}>
                <StatusBadge status={activeStatus} size="small" showIcon />
                <select
                  id="ci-status-mobile"
                  value={activeStatus}
                  aria-labelledby="ci-status-label"
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={createInvoiceStyles.statusSelect}
                >
                  {INVOICE_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>
        <div className={createInvoiceStyles.mainGrid}>
        <div className={createInvoiceStyles.leftColumn}>
          <div
            className={`${createInvoiceStyles.cardContainer} pti-card-hover`}
           
          >
            <div className={createInvoiceStyles.cardHeaderWithButton}>
              <div className={createInvoiceStyles.cardHeaderLeft}>
                <div
                  className={`${createInvoiceStyles.cardIconContainer} ${createInvoiceIconColors.billFrom}`}
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className={createInvoiceStyles.cardTitle}>Bill From</h3>
              </div>
              {/* Save as Profile button removed */}
            </div>

            <div className={createInvoiceStyles.gridCols2}>
              <div>
                <label className={createInvoiceStyles.label} htmlFor="ci-from-name">
                  Business Name
                </label>
                <input
                  id="ci-from-name"
                  autoComplete="organization"
                  value={invoice?.fromBusinessName ?? ""}
                  onChange={(e) =>
                    updateInvoiceField("fromBusinessName", e.target.value)
                  }
                  placeholder="Your Business Name"
                  className={createInvoiceStyles.input}
                />
              </div>
              <div>
                <label className={createInvoiceStyles.label} htmlFor="ci-from-email">
                  Email
                </label>
                <input
                  id="ci-from-email"
                  type="email"
                  autoComplete="email"
                  value={invoice?.fromEmail ?? ""}
                  onChange={(e) =>
                    updateInvoiceField("fromEmail", e.target.value)
                  }
                  placeholder="business@email.com"
                  className={createInvoiceStyles.input}
                />
              </div>
              <div className={createInvoiceStyles.gridColSpan2}>
                <label className={createInvoiceStyles.label} htmlFor="ci-from-address">
                  Address
                </label>
                <textarea
                  id="ci-from-address"
                  autoComplete="street-address"
                  value={invoice?.fromAddress ?? ""}
                  onChange={(e) =>
                    updateInvoiceField("fromAddress", e.target.value)
                  }
                  placeholder="Business Address"
                  rows={3}
                  className={createInvoiceStyles.textarea}
                />
              </div>
              <div>
                <label className={createInvoiceStyles.label} htmlFor="ci-from-phone">
                  Phone
                </label>
                <input
                  id="ci-from-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={invoice?.fromPhone ?? ""}
                  onChange={(e) =>
                    updateInvoiceField("fromPhone", e.target.value)
                  }
                  placeholder="+1 (555) 123-4567"
                  className={createInvoiceStyles.input}
                />
              </div>
              <div>
                <label className={createInvoiceStyles.label} htmlFor="ci-from-tax">
                  Tax ID (EIN/VAT)
                </label>
                <input
                  id="ci-from-tax"
                  value={invoice?.fromTaxId ?? invoice?.fromGst ?? ""}
                  onChange={(e) =>
                    updateInvoiceField("fromTaxId", e.target.value)
                  }
                  placeholder="12-3456789 (US EIN) or GB123456789 (EU VAT)"
                  className={createInvoiceStyles.input}
                />
              </div>
            </div>
          </div>

          <div
            className={`${createInvoiceStyles.cardContainer} pti-card-hover`}
           
          >
            <div className={createInvoiceStyles.cardHeaderContainer}>
              <div
                className={`${createInvoiceStyles.cardIconContainer} ${createInvoiceIconColors.billTo}`}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3 className={createInvoiceStyles.cardTitle}>Bill To</h3>
            </div>

            <div className={createInvoiceStyles.gridCols2}>
              <div>
                <label className={createInvoiceStyles.label} htmlFor="ci-client-name">
                  Client Name
                </label>
                <input
                  id="ci-client-name"
                  autoComplete="organization"
                  value={invoice?.client?.name || ""}
                  onChange={(e) => updateClient("name", e.target.value)}
                  placeholder="Client Name"
                  className={createInvoiceStyles.input}
                />
              </div>
              <div>
                <label className={createInvoiceStyles.label} htmlFor="ci-client-email">
                  Client Email
                </label>
                <input
                  id="ci-client-email"
                  type="email"
                  autoComplete="email"
                  value={invoice?.client?.email || ""}
                  onChange={(e) => updateClient("email", e.target.value)}
                  placeholder="client@email.com"
                  className={createInvoiceStyles.input}
                />
              </div>
              <div className={createInvoiceStyles.gridColSpan2}>
                <label className={createInvoiceStyles.label} htmlFor="ci-client-address">
                  Client Address
                </label>
                <textarea
                  id="ci-client-address"
                  autoComplete="street-address"
                  value={invoice?.client?.address || ""}
                  onChange={(e) => updateClient("address", e.target.value)}
                  placeholder="Client Address"
                  rows={3}
                  className={createInvoiceStyles.textarea}
                />
              </div>
              <div>
                <label className={createInvoiceStyles.label} htmlFor="ci-client-phone">
                  Client Phone
                </label>
                <input
                  id="ci-client-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={invoice?.client?.phone || ""}
                  onChange={(e) => updateClient("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={createInvoiceStyles.input}
                />
              </div>
            </div>
          </div>

          <div
            className={`${createInvoiceStyles.cardContainer} pti-card-hover`}
           
          >
            <div className={createInvoiceStyles.cardHeaderWithButton}>
              <div className={createInvoiceStyles.cardHeaderLeft}>
                <div className={createInvoiceStyles.cardIconContainer}>
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                  </svg>
                </div>
                <h3 className={createInvoiceStyles.cardTitle}>
                  Items & Services
                </h3>
              </div>
              <div className="pti-badge pti-badge--accent">
                All amounts in{" "}
                {activeCurrency === "CUSTOM"
                  ? customCurrencySymbol || "custom"
                  : activeCurrency}
              </div>
            </div>

            <div
              className={createInvoiceStyles.itemsListWrapper}
             
            >
              {items.map((it, idx) => {
                const totalValue =
                  Number(it?.qty || 0) * Number(it?.unitPrice || 0);
                const totalLabel = currencyFmt(totalValue, invoice.currency, invoice.currencySymbol);

                return (
                  <div
                    key={it?.id ?? idx}
                    className={`${createInvoiceStyles.itemsTableRow} ${createInvoiceStyles.itemRow}`}
                  >
                    {/* Description */}
                    <div className={createInvoiceStyles.itemColDescription}>
                      <label
                        className={createInvoiceStyles.itemsFieldLabel}
                        htmlFor={`desc-${idx}`}
                      >
                        Description
                      </label>
                      <input
                        id={`desc-${idx}`}
                        className={createInvoiceStyles.itemsInput}
                        value={it?.description ?? ""}
                        onChange={(e) =>
                          updateItem(idx, "description", e.target.value)
                        }
                        placeholder="Item description"
                        title={it?.description ?? ""}
                        aria-label={`Item ${idx + 1} description`}
                      />
                    </div>

                    {/* Quantity */}
                    <div className={createInvoiceStyles.itemColQuantity}>
                      <label
                        className={createInvoiceStyles.itemsFieldLabel}
                        htmlFor={`qty-${idx}`}
                      >
                        Quantity
                      </label>
                      <input
                        id={`qty-${idx}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className={createInvoiceStyles.itemsNumberInput}
                        value={String(it?.qty ?? "")}
                        onChange={(e) => updateItem(idx, "qty", e.target.value)}
                        title={String(it?.qty ?? "")}
                        aria-label={`Item ${idx + 1} quantity`}
                      />
                    </div>

                    {/* Unit Price */}
                    <div className={createInvoiceStyles.itemColUnitPrice}>
                      <label
                        className={createInvoiceStyles.itemsFieldLabel}
                        htmlFor={`price-${idx}`}
                      >
                        Unit Price
                      </label>
                      <input
                        id={`price-${idx}`}
                        type="text"
                        inputMode="decimal"
                        className={createInvoiceStyles.itemsNumberInput}
                        value={String(it?.unitPrice ?? "")}
                        onChange={(e) =>
                          updateItem(idx, "unitPrice", e.target.value)
                        }
                        title={String(it?.unitPrice ?? "")}
                        aria-label={`Item ${idx + 1} unit price`}
                      />
                    </div>

                    {/* Total */}
                    <div className={createInvoiceStyles.itemColTotal}>
                      <label
                        className={createInvoiceStyles.itemsFieldLabel}
                        aria-hidden
                      >
                        Total
                      </label>
                      <div
                        className={createInvoiceStyles.itemsTotal}
                        title={totalLabel}
                        aria-label={`Item ${idx + 1} total`}
                      >
                        {totalLabel}
                      </div>
                    </div>

                    {/* Remove */}
                    <div className={createInvoiceStyles.itemColRemove}>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className={createInvoiceStyles.itemsRemoveButton}
                        aria-label={`Remove item ${idx + 1}`}
                        title="Remove item"
                      >
                        <DeleteIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={addItem}
               
                className={createInvoiceStyles.addItemButton}
              >
                <AddIcon
                  className={`w-4 h-4 ${createInvoiceStyles.iconHover}`}
                  aria-hidden="true"
                />{" "}
                Add Item
              </button>
            </div>
          </div>
        </div>

        <div className={createInvoiceStyles.rightColumn}>
          <div
            className={`${createInvoiceStyles.cardSmallContainer} pti-card-hover`}
           
          >
            <h3 className={createInvoiceStyles.cardTitle}>Branding</h3>

            <div className="space-y-4">
              <div>
                <label className={createInvoiceStyles.label}>
                  Company Logo
                </label>
                <div className={createInvoiceStyles.uploadSmallArea}>
                  {invoice?.logoDataUrl ? (
                    <div className={createInvoiceStyles.imagePreviewContainer}>
                      <div className={createInvoiceStyles.logoPreview}>
                        <img
                          src={invoice.logoDataUrl}
                          alt="logo"
                          className="object-contain w-full h-full"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            console.warn(
                              "[CreateInvoice] failed to load logo preview:",
                              invoice.logoDataUrl
                            );
                          }}
                        />
                      </div>
                      <div className={createInvoiceStyles.buttonGroup}>
                        <label className={createInvoiceStyles.changeButton}>
                          <UploadIcon className="w-4 h-4" /> Change
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageUpload(
                                e.target.files && e.target.files[0],
                                "logo"
                              )
                            }
                            className="sr-only"
                          />
                        </label>
                        <button
                          type="button" onClick={() => removeImage("logo")}
                          className={createInvoiceStyles.removeButton}
                        >
                          <DeleteIcon className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <div
                        className={`${createInvoiceStyles.imagePreviewContainer} ${createInvoiceStyles.hoverScale}`}
                      >
                        <div
                          className={createInvoiceStyles.uploadIconContainer}
                        >
                          <UploadIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={createInvoiceStyles.uploadTextTitle}>
                            Upload Logo
                          </p>
                          <p className={createInvoiceStyles.uploadTextSubtitle}>
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(
                              e.target.files && e.target.files[0],
                              "logo"
                            )
                          }
                          className="sr-only"
                        />
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`${createInvoiceStyles.cardSmallContainer} pti-card-hover`}
           
          >
            <h3 className={createInvoiceStyles.cardTitle}>Summary &amp; Tax</h3>
            <div className="space-y-4">
              <div className={createInvoiceStyles.summaryRow}>
                <div className={createInvoiceStyles.summaryLabel}>Subtotal</div>
                <div className={createInvoiceStyles.summaryValue}>
                  {currencyFmt(totals.subtotal, invoice.currency, invoice.currencySymbol)}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className={createInvoiceStyles.label} htmlFor="ci-tax-percent">
                    Tax Percentage
                  </label>
                  <input
                    id="ci-tax-percent"
                    type="number"
                    inputMode="decimal"
                    value={invoice.taxPercent ?? 18}
                    onChange={(e) =>
                      updateInvoiceField(
                        "taxPercent",
                        Number(e.target.value || 0)
                      )
                    }
                    className={createInvoiceStyles.inputCenter}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div className={createInvoiceStyles.taxRow}>
                  <div className="text-sm text-gray-600">Tax Amount</div>
                  <div className="font-medium text-gray-900">
                    {currencyFmt(totals.tax, invoice.currency, invoice.currencySymbol)}
                  </div>
                </div>
              </div>

              <div className={createInvoiceStyles.totalRow}>
                <div className={createInvoiceStyles.totalLabel}>Total</div>
                <div className={createInvoiceStyles.totalValue}>
                  {currencyFmt(totals.total, invoice.currency, invoice.currencySymbol)}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`${createInvoiceStyles.cardSmallContainer} pti-card-hover`}
           
          >
            <h3 className={createInvoiceStyles.cardTitle}>
              Stamp &amp; Signature
            </h3>

            <div className="space-y-6">
              {/* Stamp */}
              <div>
                <label className={createInvoiceStyles.label}>
                  Digital Stamp
                </label>
                <div className={createInvoiceStyles.uploadSmallArea}>
                  {invoice.stampDataUrl ? (
                    <div className={createInvoiceStyles.imagePreviewContainer}>
                      <div className={createInvoiceStyles.stampPreview}>
                        <img
                          src={invoice.stampDataUrl}
                          alt="stamp"
                          className="object-contain w-full h-full"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            console.warn(
                              "[CreateInvoice] failed to load stamp preview:",
                              invoice.stampDataUrl
                            );
                          }}
                        />
                      </div>
                      <div className={createInvoiceStyles.buttonGroup}>
                        <label className={createInvoiceStyles.changeButton}>
                          <UploadIcon className="w-4 h-4" /> Change
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageUpload(
                                e.target.files && e.target.files[0],
                                "stamp"
                              )
                            }
                            className="sr-only"
                          />
                        </label>
                        <button
                          type="button" onClick={() => removeImage("stamp")}
                          className={createInvoiceStyles.removeButton}
                        >
                          <DeleteIcon className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <div
                        className={`${createInvoiceStyles.imagePreviewContainer} ${createInvoiceStyles.hoverScale}`}
                      >
                        <div
                          className={
                            createInvoiceStyles.uploadSmallIconContainer
                          }
                        >
                          <UploadIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className={createInvoiceStyles.uploadTextTitle}>
                            Upload Stamp
                          </p>
                          <p className={createInvoiceStyles.uploadTextSubtitle}>
                            PNG with transparency
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(
                              e.target.files && e.target.files[0],
                              "stamp"
                            )
                          }
                          className="sr-only"
                        />
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Signature */}
              <div>
                <label className={createInvoiceStyles.label}>
                  Digital Signature
                </label>
                <div className={createInvoiceStyles.uploadSmallArea}>
                  {invoice.signatureDataUrl ? (
                    <div className={createInvoiceStyles.imagePreviewContainer}>
                      <div className={createInvoiceStyles.signaturePreview}>
                        <img
                          src={invoice.signatureDataUrl}
                          alt="signature"
                          className="object-contain w-full h-full"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            console.warn(
                              "[CreateInvoice] failed to load signature preview:",
                              invoice.signatureDataUrl
                            );
                          }}
                        />
                      </div>
                      <div className={createInvoiceStyles.buttonGroup}>
                        <label className={createInvoiceStyles.changeButton}>
                          <UploadIcon className="w-4 h-4" /> Change
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageUpload(
                                e.target.files && e.target.files[0],
                                "signature"
                              )
                            }
                            className="sr-only"
                          />
                        </label>
                        <button
                          type="button" onClick={() => removeImage("signature")}
                          className={createInvoiceStyles.removeButton}
                        >
                          <DeleteIcon className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <div
                        className={`${createInvoiceStyles.imagePreviewContainer} ${createInvoiceStyles.hoverScale}`}
                      >
                        <div
                          className={
                            createInvoiceStyles.uploadSmallIconContainer
                          }
                        >
                          <UploadIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className={createInvoiceStyles.uploadTextTitle}>
                            Upload Signature
                          </p>
                          <p className={createInvoiceStyles.uploadTextSubtitle}>
                            PNG with transparency
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(
                              e.target.files && e.target.files[0],
                              "signature"
                            )
                          }
                          className="sr-only"
                        />
                      </div>
                    </label>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label
                      className={createInvoiceStyles.label}
                      htmlFor="ci-signature-name"
                    >
                      Signature Owner Name
                    </label>
                    <input
                      id="ci-signature-name"
                      autoComplete="name"
                      placeholder="John Doe"
                      value={invoice.signatureName || ""}
                      onChange={(e) =>
                        updateInvoiceField("signatureName", e.target.value)
                      }
                      className={`${createInvoiceStyles.inputSmall} ${createInvoiceCustomStyles.inputPlaceholder}`}
                    />
                  </div>
                  <div>
                    <label
                      className={createInvoiceStyles.label}
                      htmlFor="ci-signature-title"
                    >
                      Signature Title / Designation
                    </label>
                    <input
                      id="ci-signature-title"
                      autoComplete="organization-title"
                      placeholder="Director / CEO"
                      value={invoice.signatureTitle || ""}
                      onChange={(e) =>
                        updateInvoiceField("signatureTitle", e.target.value)
                      }
                      className={`${createInvoiceStyles.inputSmall} ${createInvoiceCustomStyles.inputPlaceholder}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
