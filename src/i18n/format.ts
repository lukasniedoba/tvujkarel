import type { Locale } from './schema';

const numberLocales: Record<Locale, string> = { cs: 'cs-CZ', en: 'en-GB', ru: 'ru-RU' };
export function formatPrice(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(numberLocales[locale], {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
