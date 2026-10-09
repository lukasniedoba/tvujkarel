import { pageMap } from '../config/site';
import { cs } from './cs';
import { en } from './en';
import { ru } from './ru';
import { locales, type Dictionary, type Locale, type Page } from './schema';

export { locales } from './schema';
export type {
  Dictionary,
  Locale,
  Page,
  ContactField,
  ApiCode,
  FieldErrorCode,
  ServiceId,
} from './schema';
export { formatPrice } from './format';

export const dictionaries: Record<Locale, Dictionary> = { cs, en, ru };
export const languageNames: Record<Locale, string> = {
  cs: 'Čeština',
  en: 'English',
  ru: 'Русский',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && locales.some((locale) => locale === value);
}

export function getDictionary(locale: Locale): Dictionary {
  const dictionary = dictionaries[locale];
  if (!dictionary) throw new Error(`Missing dictionary for locale: ${locale}`);
  return dictionary;
}

export function pagePath(locale: Locale, page: Page = 'home'): string {
  return pageMap[page][locale];
}
