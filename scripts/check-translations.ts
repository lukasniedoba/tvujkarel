import assert from 'node:assert/strict';
import { dictionaries, locales } from '../src/i18n/index';

/** Fail every build on missing keys, empty visible copy or drift in translated structure. */
function inspect(value: unknown, path: string, output: Map<string, string>): void {
  if (typeof value === 'string') {
    if (path !== 'form.fields.website.placeholder') assert.ok(value.trim(), `Empty translation: ${path}`);
    output.set(path, 'string');
    return;
  }
  if (Array.isArray(value)) {
    output.set(path, `array:${value.length}`);
    value.forEach((entry, index) => inspect(entry, `${path}[${index}]`, output));
    return;
  }
  assert.ok(value && typeof value === 'object', `Unexpected translation value: ${path}`);
  for (const [key, nested] of Object.entries(value)) inspect(nested, path ? `${path}.${key}` : key, output);
}

const source = new Map<string, string>();
inspect(dictionaries.cs, '', source);
for (const locale of locales) {
  const translated = new Map<string, string>();
  inspect(dictionaries[locale], '', translated);
  assert.deepEqual([...translated].sort(), [...source].sort(), `Translation keys or structure differ for ${locale}`);
  assert.deepEqual(dictionaries[locale].services.items.map(({ id }) => id), dictionaries.cs.services.items.map(({ id }) => id), `Service IDs differ for ${locale}`);
}

console.log(`Translations complete: ${locales.join(', ')} (${source.size} keys and structure checks per language).`);
