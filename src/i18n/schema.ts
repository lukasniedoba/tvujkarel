export const locales = ['cs', 'en', 'ru'] as const;
export type Locale = (typeof locales)[number];
export type Page = 'home' | 'privacy' | 'notFound';
export type ServiceId = 'computers' | 'wifi' | 'printers' | 'data' | 'accounts' | 'security' | 'apple';
export type ContactField = 'name' | 'phone' | 'email' | 'location' | 'message' | 'website';
export type ApiCode = 'ACCEPTED' | 'VALIDATION_ERROR' | 'PREVIEW_DISABLED' | 'RATE_LIMITED' | 'INVALID_REQUEST' | 'PAYLOAD_TOO_LARGE' | 'METHOD_NOT_ALLOWED' | 'ORIGIN_NOT_ALLOWED' | 'DELIVERY_FAILED' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
export type FieldErrorCode = 'REQUIRED' | 'TOO_SHORT' | 'TOO_LONG' | 'INVALID_FORMAT' | 'UNSUPPORTED_LOCALE';

export interface Dictionary {
  languageName: string;
  nav: { services: string; process: string; pricing: string; about: string; contact: string; call: string; write: string; home: string };
  a11y: { skipToContent: string; navigation: string; openMenu: string; closeMenu: string; languageSwitcher: string; currentLanguage: string; themeLight: string; themeDark: string; themeToggle: string; mobileContact: string; externalLink: string; logo: string };
  hero: { eyebrow: string; title: string; claim: string; description: string; primaryCta: string; secondaryCta: string; badges: string[]; imageAlt: string; handwritten: string };
  about: { eyebrow: string; title: string; description: string; imageAlt: string; note: string };
  services: { eyebrow: string; title: string; intro: string; items: Array<{ id: ServiceId; title: string; description: string }>; note: string };
  process: { eyebrow: string; title: string; steps: Array<{ title: string; description: string }> };
  pricing: { eyebrow: string; title: string; intro: string; service: string; price: string; conditions: string; hourlyTitle: string; hourlyDescription: string; prague6Title: string; prague6Description: string; otherPragueTitle: string; otherPragueDescription: string; perHour: string; perVisit: string; includingVat: string; excludingVat: string; billingNotice: string; minimumNotice: string; exampleLabel: string; example: string; rules: string[]; cta: string };
  faq: { eyebrow: string; title: string; intro: string; items: Array<{ question: string; answer: string; pricingLink?: string }> };
  contact: { eyebrow: string; title: string; description: string; phoneLabel: string; emailLabel: string; whatsappLabel: string; areaLabel: string; area: string; availabilityLabel: string; phonePlaceholder: string; emailPlaceholder: string; previewNotice: string; formTitle: string; handwritten: string };
  form: { fields: Record<ContactField, { label: string; placeholder: string; hint: string }>; required: string; optional: string; submit: string; submitting: string; privacyBefore: string; privacyLink: string; privacyAfter: string; errorTitle: string; successTitle: string; retryHint: string; codes: Record<ApiCode, string>; fieldErrors: Record<FieldErrorCode, string>; fieldInvalid: Record<ContactField | 'locale', string> };
  footer: { tagline: string; provider: string; registrationNumber: string; vatPayer: string; registeredOffice: string; addressPlaceholder: string; privacy: string; copyright: string; backToTop: string; preview: string };
  privacy: { eyebrow: string; title: string; intro: string; draftNotice: string; sections: Array<{ title: string; paragraphs: string[] }>; backHome: string; seoTitle: string; seoDescription: string };
  notFound: { title: string; description: string; cta: string; seoTitle: string };
  seo: { title: string; description: string; socialImageAlt: string; serviceType: string; areaServed: string };
}
