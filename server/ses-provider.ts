import { SESv2Client, SendEmailCommand, type SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import type { ContactPayload } from '../src/lib/contact';
import type { ContactConfig } from './contact-config';
import type { MailProvider } from './contact-handler';

export function createSesMessage(
  config: Pick<ContactConfig, 'sender' | 'recipient'>,
  contact: ContactPayload,
): SendEmailCommandInput {
  return {
    FromEmailAddress: config.sender,
    Destination: { ToAddresses: [config.recipient] },
    ...(contact.email ? { ReplyToAddresses: [contact.email] } : {}),
    Content: {
      Simple: {
        Subject: { Data: 'Tvůj Karel — nová poptávka', Charset: 'UTF-8' },
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: [
              `Jazyk webu: ${contact.locale}`,
              `Jméno: ${contact.name}`,
              `Telefon: ${contact.phone}`,
              `E-mail: ${contact.email || 'neuveden'}`,
              `Lokalita: ${contact.location}`,
              '',
              'S čím potřebujete pomoci:',
              contact.message,
            ].join('\n'),
          },
        },
      },
    },
  };
}

export function createSesProvider(config: ContactConfig): MailProvider {
  // Credentials are supplied by Lambda's IAM role / explicitly selected local AWS profile.
  // Avoid automatic retries on a send whose outcome may be uncertain.
  const client = new SESv2Client({ region: config.sesRegion, maxAttempts: 1 });
  return {
    async send(contact) {
      const result = await client.send(new SendEmailCommand(createSesMessage(config, contact)), {
        abortSignal: AbortSignal.timeout(10_000),
      });
      return { accepted: typeof result.MessageId === 'string' && result.MessageId.length > 0 };
    },
  };
}
