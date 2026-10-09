import { isEmailAddress } from '../src/lib/contact';

export interface ContactConfig {
  mode: 'disabled' | 'ses';
  allowedOrigins: string[];
  maxBodyBytes: number;
  rateLimitMax: number;
  rateLimitWindowMs: number;
  rateLimitMaxKeys: number;
  sender: string;
  recipient: string;
  sesRegion: string;
}

export const DEFAULT_CONTACT_CONFIG: ContactConfig = {
  mode: 'disabled',
  allowedOrigins: [],
  maxBodyBytes: 20_480,
  rateLimitMax: 5,
  rateLimitWindowMs: 600_000,
  rateLimitMaxKeys: 10_000,
  sender: '',
  recipient: '',
  sesRegion: 'eu-central-1',
};

function integer(env: Record<string, string | undefined>, name: string, fallback: number, maximum: number): number {
  const raw = env[name];
  if (!raw) return fallback;
  if (!/^\d+$/.test(raw)) throw new Error(`Invalid server configuration: ${name}`);
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) throw new Error(`Invalid server configuration: ${name}`);
  return value;
}

export function contactConfigFromEnv(env: Record<string, string | undefined>): ContactConfig {
  const mode = env.CONTACT_MODE || 'disabled';
  if (mode !== 'disabled' && mode !== 'ses') throw new Error('Invalid server configuration: CONTACT_MODE');
  const allowedOrigins = (env.CONTACT_ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
  for (const origin of allowedOrigins) {
    let parsed: URL;
    try { parsed = new URL(origin); } catch { throw new Error('Invalid server configuration: CONTACT_ALLOWED_ORIGINS'); }
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== origin || parsed.username || parsed.password) {
      throw new Error('Invalid server configuration: CONTACT_ALLOWED_ORIGINS');
    }
  }
  const config: ContactConfig = {
    mode,
    allowedOrigins,
    sender: env.CONTACT_SENDER || '',
    recipient: env.CONTACT_RECIPIENT || '',
    sesRegion: env.CONTACT_SES_REGION || DEFAULT_CONTACT_CONFIG.sesRegion,
    maxBodyBytes: integer(env, 'CONTACT_MAX_BODY_BYTES', DEFAULT_CONTACT_CONFIG.maxBodyBytes, 1_048_576),
    rateLimitMax: integer(env, 'CONTACT_RATE_LIMIT_MAX', DEFAULT_CONTACT_CONFIG.rateLimitMax, 1_000),
    rateLimitWindowMs: integer(env, 'CONTACT_RATE_LIMIT_WINDOW_MS', DEFAULT_CONTACT_CONFIG.rateLimitWindowMs, 86_400_000),
    rateLimitMaxKeys: integer(env, 'CONTACT_RATE_LIMIT_MAX_KEYS', DEFAULT_CONTACT_CONFIG.rateLimitMaxKeys, 100_000),
  };
  if (mode === 'ses') {
    if (!allowedOrigins.length) throw new Error('Missing server configuration: CONTACT_ALLOWED_ORIGINS');
    if (!isEmailAddress(config.sender)) throw new Error('Invalid server configuration: CONTACT_SENDER');
    if (!isEmailAddress(config.recipient)) throw new Error('Invalid server configuration: CONTACT_RECIPIENT');
    if (!/^[a-z]{2}-[a-z]+-\d$/.test(config.sesRegion)) throw new Error('Invalid server configuration: CONTACT_SES_REGION');
  }
  return config;
}
