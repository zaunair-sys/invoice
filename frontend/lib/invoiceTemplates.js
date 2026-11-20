export const DEFAULT_INVOICE_TEMPLATE = "classic";

export const INVOICE_TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    description: "Clean indigo accents and a balanced layout.",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Gradient banner with a bold document header.",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Light borders and understated typography.",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Dark navy header with a premium finish.",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Warm ivory tones with serif typography.",
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Teal accent bar with a cool blue palette.",
  },
  {
    id: "monochrome",
    name: "Monochrome",
    description: "High-contrast black borders and uppercase type.",
  },
  {
    id: "vibrant",
    name: "Vibrant",
    description: "Pink-to-violet gradient with bold totals.",
  },
];

export function normalizeInvoiceTemplate(value) {
  const match = INVOICE_TEMPLATES.find(
    (template) => template.id === String(value || "").toLowerCase()
  );
  return match ? match.id : DEFAULT_INVOICE_TEMPLATE;
}

export function getInvoiceTemplate(value) {
  return (
    INVOICE_TEMPLATES.find(
      (template) => template.id === normalizeInvoiceTemplate(value)
    ) || INVOICE_TEMPLATES[0]
  );
}
