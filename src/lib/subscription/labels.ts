import type { PlanCode } from "@/lib/backend/types";

export const PLAN_LABELS: Record<PlanCode, string> = {
  basic: "Basic",
  pro: "Pro",
  enterprise: "Enterprise",
};

// Badge colours per tier, from the Figma tokens: Basic is neutral, Pro the
// primary plum, Enterprise the deeper brand plum.
export const PLAN_BADGE: Record<PlanCode, string> = {
  basic: "bg-neutral-soft text-neutral ring-neutral/20",
  pro: "bg-primary-soft text-primary ring-primary-border",
  enterprise: "bg-brand text-white ring-brand",
};

// Display names for the backend's feature codes; an unknown code (a feature
// added to the backend later) falls back to the code itself.
const FEATURE_LABELS: Record<string, string> = {
  customer_display: "Customer display",
  advanced_reports: "Advanced reports",
  report_export: "Report export",
  promotions: "Promotions & markdowns",
  loyalty: "Loyalty",
  sms_receipts: "SMS / e-receipts",
  api_access: "API access",
};

export function featureLabel(code: string): string {
  return FEATURE_LABELS[code] ?? code;
}

/** "1 branch", "5 branches", "unlimited branches" (a null limit). */
export function limitCount(limit: number | null, singular: string, pluralWord: string): string {
  if (limit === null) return `unlimited ${pluralWord}`;
  return `${limit} ${limit === 1 ? singular : pluralWord}`;
}

/** "unlimited" for a null limit. */
export function limitLabel(limit: number | null): string {
  return limit === null ? "unlimited" : String(limit);
}
