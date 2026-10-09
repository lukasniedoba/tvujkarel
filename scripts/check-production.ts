import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';
import { pathToFileURL } from 'node:url';
import { contactConfigFromEnv } from '../server/contact-config';
import { isEmailAddress } from '../src/lib/contact';

export type ProductionEnv = Record<string, string | undefined>;

// Deliberately report names and requirements, never configured contact values or secrets.
const placeholder =
  /(?:example|placeholder|change[\s_-]?me|\btodo\b|\btbd\b|dopln[ií]|uk[aá]zk|fiktiv|sample|your[\s_-]|xxx|nevypln|pending|nenastaven|unknown|not[\s_-]?(?:provided|configured)|localhost)/iu;
const invalidDomain =
  /(?:^|\.)(?:example\.(?:com|org|net)|localhost)$|\.(?:example|invalid|test|local)$/iu;
const valueOf = (env: ProductionEnv, key: string) => (env[key] ?? '').trim();
const isRealText = (value: string, minimum = 2) =>
  value.length >= minimum &&
  !placeholder.test(value) &&
  !/^(?:n\/?a|none|null|undefined|-+|[?.]+)$/iu.test(value) &&
  !/[\u0000-\u001f\u007f]/u.test(value);

/** Validate launch configuration locally. This never calls SES, DNS, or any cloud API. */
export function validateProductionEnv(env: ProductionEnv): string[] {
  const errors: string[] = [];
  const requireText = (key: string, minimum = 2) => {
    const value = valueOf(env, key);
    if (!isRealText(value, minimum))
      errors.push(`${key}: vyplňte skutečný údaj bez ukázkových hodnot.`);
    return value;
  };
  const requireApproval = (key: string, meaning: string) => {
    if (env[key] !== 'true') errors.push(`${key}: chybí potvrzení — ${meaning}.`);
  };
  const checkEmail = (key: string) => {
    const email = requireText(key);
    const domain = email.split('@')[1] ?? '';
    if (
      email &&
      (!isEmailAddress(email) ||
        invalidDomain.test(domain) ||
        /^(?:test|example|placeholder|your[-_]?email)@/iu.test(email))
    ) {
      errors.push(`${key}: je nutná skutečná funkční e-mailová adresa.`);
    }
    return email;
  };

  if (env.PUBLIC_SITE_MODE !== 'production')
    errors.push('PUBLIC_SITE_MODE: produkční kontrola vyžaduje hodnotu production.');
  const canonical = requireText('PUBLIC_SITE_URL');
  let canonicalUrl: URL | undefined;
  try {
    canonicalUrl = new URL(canonical);
    if (
      canonicalUrl.protocol !== 'https:' ||
      canonicalUrl.username ||
      canonicalUrl.password ||
      canonicalUrl.port ||
      canonicalUrl.pathname !== '/' ||
      canonicalUrl.search ||
      canonicalUrl.hash ||
      invalidDomain.test(canonicalUrl.hostname) ||
      !canonicalUrl.hostname.includes('.') ||
      /^(?:\d{1,3}\.){3}\d{1,3}$/.test(canonicalUrl.hostname)
    )
      throw new Error('invalid');
  } catch {
    canonicalUrl = undefined;
    errors.push(
      'PUBLIC_SITE_URL: použijte veřejnou HTTPS doménu bez cesty, portu, parametrů a přihlašovacích údajů.',
    );
  }

  const phone = requireText('PUBLIC_PHONE', 7);
  const phoneTel = requireText('PUBLIC_PHONE_TEL', 8);
  const phoneDigits = phone.replace(/\D/g, '');
  const telDigits = phoneTel.replace(/\D/g, '');
  if (
    phone &&
    (!/^\+?[0-9\s().-]+$/.test(phone) || phoneDigits.length < 7 || phoneDigits.length > 15)
  ) {
    errors.push('PUBLIC_PHONE: uveďte platný zobrazovaný telefon s mezinárodní předvolbou.');
  }
  if (phoneTel && !/^\+[1-9]\d{6,14}$/.test(phoneTel)) {
    errors.push(
      'PUBLIC_PHONE_TEL: uveďte mezinárodní číslo ve tvaru +420… bez mezer a bez tel: prefixu.',
    );
  }
  if (phone && phoneTel && phoneDigits !== telDigits)
    errors.push('PUBLIC_PHONE a PUBLIC_PHONE_TEL: obě hodnoty musí označovat stejné číslo.');
  if (/(\d)\1{6,}$|123456789$|987654321$/.test(telDigits))
    errors.push('PUBLIC_PHONE_TEL: telefon vypadá jako ukázkové číslo.');
  checkEmail('PUBLIC_CONTACT_EMAIL');
  const office = requireText('PUBLIC_REGISTERED_OFFICE', 10);
  if (office && (!/\p{L}/u.test(office) || !/\d/.test(office)))
    errors.push('PUBLIC_REGISTERED_OFFICE: uveďte úplné skutečné sídlo.');
  requireText('PUBLIC_MAILBOX_PROVIDER');
  requireText('PUBLIC_INQUIRY_RETENTION');
  requireText('PUBLIC_LOG_RETENTION');
  requireApproval(
    'PUBLIC_PRIVACY_APPROVED',
    'údaje o soukromí, poskytovatelích a uchování byly schváleny ve všech jazycích',
  );
  requireApproval(
    'PUBLIC_CONTENT_APPROVED',
    'texty, překlady, diagnostika, rozsah služeb a práva k obrázkům byly schváleny',
  );
  requireApproval(
    'CONTACT_DETAILS_VERIFIED',
    'telefon, kontaktní e-mail a identifikační údaje byly skutečně ověřeny',
  );
  requireApproval(
    'CONTACT_DELIVERY_VERIFIED',
    'ověřený SES odesílatel a příjemce umožňují odesílání a příjem testovací zprávy byl potvrzen',
  );

  if (env.PUBLIC_ENABLE_WHATSAPP === 'true') {
    const whatsapp = requireText('PUBLIC_WHATSAPP_URL');
    try {
      const url = new URL(whatsapp);
      if (
        url.protocol !== 'https:' ||
        url.hostname !== 'wa.me' ||
        !/^\/[1-9]\d{6,14}$/.test(url.pathname) ||
        url.username ||
        url.password ||
        url.port ||
        url.search ||
        url.hash
      )
        throw new Error('invalid');
    } catch {
      errors.push(
        'PUBLIC_WHATSAPP_URL: potvrzený WhatsApp vyžaduje odkaz https://wa.me/mezinarodnicislo.',
      );
    }
  }

  checkEmail('CONTACT_SENDER');
  checkEmail('CONTACT_RECIPIENT');
  if (env.CONTACT_MODE !== 'ses')
    errors.push('CONTACT_MODE: produkce vyžaduje ses; disabled je určený pro lokální náhled.');
  if (valueOf(env, 'CONTACT_SES_REGION') !== 'eu-central-1')
    errors.push('CONTACT_SES_REGION: podle zadání použijte eu-central-1.');
  try {
    const contact = contactConfigFromEnv(env);
    if (canonicalUrl && !contact.allowedOrigins.includes(canonicalUrl.origin)) {
      errors.push(
        'CONTACT_ALLOWED_ORIGINS: musí obsahovat přesný origin PUBLIC_SITE_URL bez koncového lomítka.',
      );
    }
    if (
      contact.allowedOrigins.some((origin) => {
        const url = new URL(origin);
        return (
          url.protocol !== 'https:' ||
          invalidDomain.test(url.hostname) ||
          !url.hostname.includes('.') ||
          /^(?:\d{1,3}\.){3}\d{1,3}$/.test(url.hostname)
        );
      })
    )
      errors.push('CONTACT_ALLOWED_ORIGINS: produkce smí povolit pouze veřejné HTTPS origins.');
  } catch (error) {
    // contactConfigFromEnv errors contain only a constant setting name, not its value.
    errors.push(
      error instanceof Error ? error.message : 'Neplatná serverová konfigurace formuláře.',
    );
  }
  return errors;
}

/** Match Vite's file precedence; use explicit literal values, not variable interpolation. */
export function readProductionEnv(
  directory = process.cwd(),
  overrides: ProductionEnv = process.env,
): ProductionEnv {
  const env: ProductionEnv = {};
  for (const name of ['.env', '.env.local', '.env.production', '.env.production.local']) {
    const file = resolve(directory, name);
    if (existsSync(file)) Object.assign(env, parseEnv(readFileSync(file, 'utf8')));
  }
  return { ...env, ...overrides };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = validateProductionEnv(readProductionEnv());
  if (errors.length) {
    console.error(
      `Produkční konfigurace není připravena (${errors.length}):\n${errors.map((error) => `- ${error}`).join('\n')}`,
    );
    console.error('Lokální náhled zůstává dostupný. Tato kontrola nic neodesílá ani nenasazuje.');
    process.exitCode = 1;
  } else {
    console.log(
      'Produkční konfigurační kontrola prošla. Nebylo provedeno nasazení ani živý test SES, DNS nebo doručení.',
    );
  }
}
