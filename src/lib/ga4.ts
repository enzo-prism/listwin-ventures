export const GA4_MEASUREMENT_ID = "G-5R6NTCMFK3";

export const CONTACT_FORM_ID = "contact_form";

export const generateLeadMethods = {
  form: "form",
  phone: "phone",
} as const;

export type GenerateLeadMethod =
  (typeof generateLeadMethods)[keyof typeof generateLeadMethods];

export type GenerateLeadParams = {
  form_id?: string;
  form_name?: string;
  lead_source?: string;
  location?: string;
  method?: GenerateLeadMethod;
  contact_method?: GenerateLeadMethod;
};

type GtagFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}

const ALLOWED_GENERATE_LEAD_KEYS = new Set<keyof GenerateLeadParams>([
  "form_id",
  "form_name",
  "lead_source",
  "location",
  "method",
  "contact_method",
]);

const SAFE_PARAM_VALUE = /^[A-Za-z0-9._-]{1,80}$/;

function isSafeLeadParamValue(value: unknown): value is string {
  return typeof value === "string" && SAFE_PARAM_VALUE.test(value);
}

export function sanitizeGenerateLeadParams(
  params: GenerateLeadParams,
): Record<string, string> {
  const sanitized: Record<string, string> = {};

  for (const key of ALLOWED_GENERATE_LEAD_KEYS) {
    const value = params[key];
    if (isSafeLeadParamValue(value)) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function locationFromPathname(pathname: string): string {
  if (pathname === "/") {
    return "home";
  }

  const slug = pathname
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);

  return SAFE_PARAM_VALUE.test(slug) ? slug : "unknown";
}

function getGtag(): GtagFunction | null {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return null;
  }

  return window.gtag;
}

export function trackGenerateLead(params: GenerateLeadParams): void {
  const sanitizedParams = sanitizeGenerateLeadParams(params);
  getGtag()?.("event", "generate_lead", sanitizedParams);
}

const FORM_LEAD_DEDUP_KEY = "lv_ga4_generate_lead_form";
const FORM_LEAD_DEDUP_TTL_MS = 10 * 60 * 1000;

function shouldRecordFormLead(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const previous = window.sessionStorage.getItem(FORM_LEAD_DEDUP_KEY);
    if (previous && Date.now() - Number(previous) < FORM_LEAD_DEDUP_TTL_MS) {
      return false;
    }

    window.sessionStorage.setItem(FORM_LEAD_DEDUP_KEY, String(Date.now()));
    return true;
  } catch {
    return true;
  }
}

export function contactFormLeadParams(): GenerateLeadParams {
  return {
    form_id: CONTACT_FORM_ID,
    form_name: CONTACT_FORM_ID,
    lead_source: "website_contact_form",
    location: "contact",
    method: generateLeadMethods.form,
    contact_method: generateLeadMethods.form,
  };
}

export function recordContactFormLead(): void {
  if (!shouldRecordFormLead()) {
    return;
  }

  trackGenerateLead(contactFormLeadParams());
}

export function phoneLeadParams(location: string): GenerateLeadParams {
  return {
    lead_source: "website_phone",
    location,
    method: generateLeadMethods.phone,
    contact_method: generateLeadMethods.phone,
  };
}
