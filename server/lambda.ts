import { contactConfigFromEnv, type ContactConfig } from './contact-config';
import {
  contactResponse,
  createContactHandler,
  type ContactHttpResponse,
  type ContactLogger,
  type MailProvider,
} from './contact-handler';
import { createSesProvider } from './ses-provider';

export interface HttpApiEvent {
  rawPath?: string;
  headers?: Record<string, string | undefined>;
  body?: string | null;
  isBase64Encoded?: boolean;
  requestContext?: { http?: { method?: string; sourceIp?: string } };
}

/** API Gateway HTTP API v2 entry point; the source address comes from its trusted context. */
export function createLambdaHandler(options: {
  config: ContactConfig;
  provider?: MailProvider;
  logger?: ContactLogger;
}) {
  const handleContact = createContactHandler(options);
  return async (event: HttpApiEvent): Promise<ContactHttpResponse> => {
    if (event.rawPath !== '/api/contact')
      return contactResponse(404, { ok: false, code: 'INVALID_REQUEST' });
    const rawBody = event.body || '';
    // Bound decoding allocation before constructing a Buffer for API Gateway's base64 payload.
    if (event.isBase64Encoded && rawBody.length > Math.ceil(options.config.maxBodyBytes / 3) * 4) {
      return contactResponse(413, { ok: false, code: 'PAYLOAD_TOO_LARGE' });
    }
    if (
      event.isBase64Encoded &&
      (rawBody.length % 4 !== 0 ||
        !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(rawBody))
    ) {
      return contactResponse(400, { ok: false, code: 'INVALID_REQUEST' });
    }
    return handleContact({
      method: event.requestContext?.http?.method || '',
      headers: event.headers || {},
      body: event.isBase64Encoded ? Buffer.from(rawBody, 'base64') : rawBody,
      clientAddress: event.requestContext?.http?.sourceIp || 'unknown',
    });
  };
}

const config = contactConfigFromEnv(process.env);
export const handler = createLambdaHandler({
  config,
  ...(config.mode === 'ses' ? { provider: createSesProvider(config) } : {}),
  logger: (event) => console.info(JSON.stringify(event)),
});
