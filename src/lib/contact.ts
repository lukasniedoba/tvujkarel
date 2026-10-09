/** Shared by the browser and API: lengths count Unicode code points, not UTF-16 units. */
export const CONTACT_LIMITS = {
  name: { min: 2, max: 100 },
  phone: { min: 7, max: 40 },
  email: { min: 0, max: 254 },
  location: { min: 2, max: 150 },
  message: { min: 10, max: 3_000 },
} as const;

export const CONTACT_FIELDS = [
  'locale',
  'name',
  'phone',
  'email',
  'location',
  'message',
  'website',
] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];
export type ContactLocale = 'cs' | 'en' | 'ru';
export type ValidationCode =
  'REQUIRED' | 'TOO_SHORT' | 'TOO_LONG' | 'INVALID_FORMAT' | 'UNSUPPORTED_LOCALE';
export type ContactResultCode =
  | 'ACCEPTED'
  | 'VALIDATION_ERROR'
  | 'PREVIEW_DISABLED'
  | 'RATE_LIMITED'
  | 'INVALID_REQUEST'
  | 'PAYLOAD_TOO_LARGE'
  | 'METHOD_NOT_ALLOWED'
  | 'ORIGIN_NOT_ALLOWED'
  | 'DELIVERY_FAILED';

export interface ContactPayload {
  locale: ContactLocale;
  name: string;
  phone: string;
  email: string;
  location: string;
  message: string;
  website: string;
}

export interface ContactResponse {
  ok: boolean;
  code: ContactResultCode;
  fields?: Partial<Record<ContactField, ValidationCode>>;
}

export type ContactValidation =
  | { ok: true; data: ContactPayload }
  | { ok: false; fields: Partial<Record<ContactField, ValidationCode>> };

export function characterCount(value: string): number {
  return Array.from(value).length;
}

// Reject lone surrogates rather than replacing them during UTF-8 encoding.
const invalidUnicode = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u;
const singleLineControls = /[\u0000-\u001F\u007F-\u009F]/u;
const messageControls = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/u;

export function isEmailAddress(value: string): boolean {
  // SES does not support SMTPUTF8 local parts; IDN domains can be supplied in ASCII punycode.
  return (
    characterCount(value) <= CONTACT_LIMITS.email.max &&
    /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(
      value,
    ) &&
    !value.startsWith('.') &&
    !value.includes('..') &&
    !value.includes('.@') &&
    value.split('@')[0]!.length <= 64
  );
}

export function validateContact(input: unknown): ContactValidation {
  const fields: Partial<Record<ContactField, ValidationCode>> = {};
  const record =
    input && typeof input === 'object' && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  const data = {} as ContactPayload;

  for (const field of CONTACT_FIELDS) {
    const raw = record[field];
    const optional = field === 'email' || field === 'website';
    if (raw === undefined && optional) {
      data[field] = '';
      continue;
    }
    if (typeof raw !== 'string') {
      fields[field] = raw === undefined || raw === null ? 'REQUIRED' : 'INVALID_FORMAT';
      continue;
    }
    // Preserve the complete free-text request in the email, including line breaks.
    const value = field === 'message' ? raw : raw.trim();
    if (field === 'locale') {
      if (value !== 'cs' && value !== 'en' && value !== 'ru') fields.locale = 'UNSUPPORTED_LOCALE';
      else data.locale = value;
      continue;
    }
    data[field] = value;
    if (
      invalidUnicode.test(raw) ||
      (field === 'message' ? messageControls : singleLineControls).test(raw)
    ) {
      fields[field] = 'INVALID_FORMAT';
      continue;
    }
    if (field === 'website') {
      if (value) fields.website = 'INVALID_FORMAT';
      continue;
    }
    if (!value.trim()) {
      if (!optional) fields[field] = 'REQUIRED';
      continue;
    }
    const length = characterCount(value);
    if (length < CONTACT_LIMITS[field].min) fields[field] = 'TOO_SHORT';
    else if (length > CONTACT_LIMITS[field].max) fields[field] = 'TOO_LONG';
    else if (field === 'email' && !isEmailAddress(value)) fields.email = 'INVALID_FORMAT';
    else if (field === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (!/^\+?[0-9\s().-]+$/.test(value) || digits.length < 7 || digits.length > 15) {
        fields.phone = 'INVALID_FORMAT';
      }
    }
  }
  return Object.keys(fields).length ? { ok: false, fields } : { ok: true, data };
}
