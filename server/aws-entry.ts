import { createHash, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import { handler as contactHandler, type HttpApiEvent } from './lambda';
import { contactResponse } from './contact-handler';

/** Accept forwarded client addresses only from our CloudFront origin. */
export function trustedCloudFrontEvent(event: HttpApiEvent, token: string): HttpApiEvent | null {
  const headers = Object.fromEntries(
    Object.entries(event.headers || {}).map(([key, value]) => [key.toLowerCase(), value]),
  );
  const supplied = headers['x-tvujkarel-origin'] || '';
  if (
    !token ||
    !timingSafeEqual(
      createHash('sha256').update(token).digest(),
      createHash('sha256').update(supplied).digest(),
    )
  )
    return null;
  const clientAddress = headers['x-tvujkarel-client-ip'] || '';
  if (!isIP(clientAddress)) return null;
  return {
    ...event,
    headers,
    requestContext: {
      ...event.requestContext,
      http: {
        ...event.requestContext?.http,
        sourceIp: clientAddress,
      },
    },
  };
}

export async function handler(event: HttpApiEvent) {
  const trusted = trustedCloudFrontEvent(event, process.env.CONTACT_ORIGIN_TOKEN || '');
  if (!trusted) return contactResponse(403, { ok: false, code: 'INVALID_REQUEST' });
  return contactHandler(trusted);
}
