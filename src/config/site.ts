/** Public configuration only. Server secrets must never be imported here. */
const publicEnv = (import.meta as ImportMeta & { env?: Record<string, string | boolean | undefined> }).env ?? {};
const optionalString = (value: string | boolean | undefined): string | null => typeof value === 'string' && value.trim() ? value.trim() : null;

export const prices = {
  currency: 'CZK',
  vatRate: 21,
  billingIntervalMinutes: 30,
  minimumMinutes: 30,
  hourly: { gross: 1452, net: 1200 },
  halfHour: { gross: 726, net: 600 },
  travelPrague6: { gross: 390, net: 322.31 },
  travelPragueOther: { gross: 690, net: 570.25 },
} as const;

export const siteConfig = {
  name: 'Tvůj Karel',
  canonicalUrl: optionalString(publicEnv.PUBLIC_SITE_URL) ?? 'https://tvujkarel.cz',
  locales: ['cs', 'en', 'ru'],
  defaultLocale: 'cs',
  production: publicEnv.PUBLIC_SITE_MODE === 'production',
  contact: {
    phone: optionalString(publicEnv.PUBLIC_PHONE),
    phoneHref: optionalString(publicEnv.PUBLIC_PHONE_TEL),
    email: optionalString(publicEnv.PUBLIC_CONTACT_EMAIL),
    whatsapp: optionalString(publicEnv.PUBLIC_WHATSAPP_URL),
    availability: optionalString(publicEnv.PUBLIC_AVAILABILITY),
  },
  provider: {
    name: 'Lukáš Niedoba',
    registrationNumber: '06838103',
    vatPayer: true,
    registeredOffice: optionalString(publicEnv.PUBLIC_REGISTERED_OFFICE),
    vatId: optionalString(publicEnv.PUBLIC_VAT_ID),
  },
  area: 'Praha',
  features: {
    apple: publicEnv.PUBLIC_ENABLE_APPLE === 'true',
    whatsapp: publicEnv.PUBLIC_ENABLE_WHATSAPP === 'true',
    analytics: false,
  },
  prices,
  privacy: {
    approved: publicEnv.PUBLIC_PRIVACY_APPROVED === 'true',
    mailboxProvider: optionalString(publicEnv.PUBLIC_MAILBOX_PROVIDER),
    inquiryRetention: optionalString(publicEnv.PUBLIC_INQUIRY_RETENTION),
    logRetention: optionalString(publicEnv.PUBLIC_LOG_RETENTION),
  },
} as const;

export const pageMap = {
  home: { cs: '/cs/', en: '/en/', ru: '/ru/' },
  privacy: { cs: '/cs/privacy/', en: '/en/privacy/', ru: '/ru/privacy/' },
  notFound: { cs: '/cs/404/', en: '/en/404/', ru: '/ru/404/' },
} as const;
