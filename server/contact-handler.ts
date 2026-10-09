import { validateContact, type ContactPayload, type ContactResponse, type ContactResultCode } from '../src/lib/contact';
import type { ContactConfig } from './contact-config';
import { createRateLimiter, type RateLimiter } from './rate-limit';

export interface MailProvider { send(contact: ContactPayload): Promise<{ accepted: boolean }> }
export interface ContactRequest {
  method: string;
  headers: Record<string, string | undefined>;
  body: string | Uint8Array;
  clientAddress: string;
}
export interface ContactHttpResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}
/** Never attach request fields, IPs, provider errors or provider message IDs to log events. */
export interface ContactLogEvent { event: 'contact_result'; code: ContactResultCode; status: number }
export type ContactLogger = (event: ContactLogEvent) => void;

export function contactResponse(statusCode: number, body: ContactResponse, extraHeaders: Record<string, string> = {}): ContactHttpResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

export function createContactHandler(options: {
  config: ContactConfig;
  provider?: MailProvider;
  limiter?: RateLimiter;
  logger?: ContactLogger;
}) {
  const { config, provider } = options;
  const limiter = options.limiter || createRateLimiter({
    max: config.rateLimitMax,
    windowMs: config.rateLimitWindowMs,
    maxKeys: config.rateLimitMaxKeys,
  });
  return async (request: ContactRequest): Promise<ContactHttpResponse> => {
    const headers = Object.fromEntries(Object.entries(request.headers).map(([key, value]) => [key.toLowerCase(), value]));
    const respond = (status: number, code: ContactResultCode, fields?: ContactResponse['fields'], extraHeaders?: Record<string, string>) => {
      // Logging failure must not turn an accepted email into a retry and duplicate submission.
      try { options.logger?.({ event: 'contact_result', code, status }); } catch { /* no request data */ }
      return contactResponse(status, { ok: code === 'ACCEPTED', code, ...(fields ? { fields } : {}) }, extraHeaders);
    };
    if (request.method.toUpperCase() !== 'POST') return respond(405, 'METHOD_NOT_ALLOWED', undefined, { Allow: 'POST' });
    const origin = headers.origin;
    if (!origin || !config.allowedOrigins.includes(origin)) return respond(403, 'ORIGIN_NOT_ALLOWED');
    const mediaType = headers['content-type']?.split(';')[0]?.trim().toLowerCase();
    if (mediaType !== 'application/json') return respond(415, 'INVALID_REQUEST');
    const declaredLength = headers['content-length'];
    if (declaredLength && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > config.maxBodyBytes)) {
      return respond(413, 'PAYLOAD_TOO_LARGE');
    }
    const bytes = typeof request.body === 'string' ? new TextEncoder().encode(request.body) : request.body;
    if (bytes.byteLength > config.maxBodyBytes) return respond(413, 'PAYLOAD_TOO_LARGE');
    const allowance = limiter.check(request.clientAddress);
    if (!allowance.allowed) return respond(429, 'RATE_LIMITED', undefined, { 'Retry-After': String(allowance.retryAfterSeconds) });
    let input: unknown;
    try { input = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
    catch { return respond(400, 'INVALID_REQUEST'); }
    if (!input || typeof input !== 'object' || Array.isArray(input)) return respond(400, 'INVALID_REQUEST');
    const validation = validateContact(input);
    if (!validation.ok) return respond(400, 'VALIDATION_ERROR', validation.fields);
    if (config.mode === 'disabled') return respond(503, 'PREVIEW_DISABLED');
    if (!provider) return respond(503, 'DELIVERY_FAILED');
    try {
      const result = await provider.send(validation.data);
      if (!result.accepted) return respond(502, 'DELIVERY_FAILED');
      return respond(200, 'ACCEPTED');
    } catch {
      return respond(502, 'DELIVERY_FAILED');
    }
  };
}
