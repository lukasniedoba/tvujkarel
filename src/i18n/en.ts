import { prices, siteConfig } from '../config/site';
import { formatPrice } from './format';
import type { Dictionary } from './schema';

const money = (amount: number) => formatPrice(amount, 'en');

export const en: Dictionary = {
  languageName: 'English',
  nav: {
    services: 'Services',
    process: 'How it works',
    pricing: 'Prices',
    about: 'About',
    contact: 'Contact',
    call: 'Call',
    write: 'Write',
    home: 'Home',
  },
  a11y: {
    skipToContent: 'Skip to content',
    navigation: 'Main navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    languageSwitcher: 'Website language',
    currentLanguage: 'Current language',
    themeLight: 'Switch to light mode',
    themeDark: 'Switch to dark mode',
    themeToggle: 'Change colour mode',
    mobileContact: 'Quick contact',
    externalLink: 'Opens in a new window',
    logo: 'Tvůj Karel — home',
  },
  hero: {
    eyebrow: 'IT help at home · Prague',
    title: 'Computer and tech help at your home in Prague',
    claim: 'When technology won’t cooperate.',
    description:
      'Wi-Fi or printer not working? Need to set up a new laptop? Tvůj Karel helps with technology at your home or office. Clear explanations, without the worry.',
    primaryCta: 'Call',
    secondaryCta: 'Describe the problem',
    badges: ['Prague', 'Homes and small businesses', 'Clear pricing before the visit'],
    imageAlt: 'Laptop, keyboard and other technology on a calm home workspace',
    handwritten: 'Technology, at ease again.',
  },
  about: {
    eyebrow: 'About the brand',
    title: 'Technology made calm. Without the worry.',
    description:
      'Everyday technology should make your day easier. Tvůj Karel helps with setup, connections and backups. Clearly and without unnecessary complications.',
    imageAlt: 'Close-up of a laptop and a desk with accessories',
    note: 'Friendly. Clear. At your place.',
  },
  services: {
    eyebrow: 'How Tvůj Karel can help',
    title: 'How Tvůj Karel can help',
    intro:
      'Computer help in Prague, Wi-Fi setup and printer installation. Everyday technology for your home or small office.',
    items: [
      {
        id: 'computers',
        title: 'Computers and laptops',
        description:
          'A new laptop or a slow computer? Windows and software setup, updates, user accounts and help with software problems.',
      },
      {
        id: 'wifi',
        title: 'Wi-Fi and internet',
        description:
          'Wi-Fi won’t reach the next room? Router setup, device connections, signal checks and mesh network configuration.',
      },
      {
        id: 'printers',
        title: 'Printers and accessories',
        description:
          'Printer won’t connect to Wi-Fi? Help with printing, scanning, monitors, webcams and external drives.',
      },
      {
        id: 'data',
        title: 'Data and backups',
        description:
          'Move photos and documents to your new computer. Transfer accessible data, set up automatic backups, OneDrive and Google Drive.',
      },
      {
        id: 'accounts',
        title: 'Email and accounts',
        description:
          'Your email on your computer and phone, the way you need it. Gmail, Outlook, synchronisation, account setup and security.',
      },
      {
        id: 'security',
        title: 'Security',
        description:
          'Suspicious behaviour or a message you don’t trust? Checks for common malware, browser extensions, updates and help recognising scams.',
      },
      {
        id: 'apple',
        title: 'Apple and iCloud',
        description:
          'Help with macOS and iCloud setup within an agreed scope. Your device and requirements will be checked before the visit.',
      },
    ],
    note: 'Physical hardware repairs and professional data recovery from damaged drives are not included.',
  },
  process: {
    eyebrow: 'From the first call to peace of mind with your technology.',
    title: 'How it works',
    steps: [
      {
        title: 'Describe the problem',
        description: 'Call or write to explain what isn’t working and where in Prague you are.',
      },
      {
        title: 'Arrange a visit',
        description:
          'Before the visit, you know the appointment time, estimated scope of work, billing method and call-out fee for your address.',
      },
      {
        title: 'Help at your place',
        description:
          'A check of the problem, the agreed setup and a clear explanation of the next steps.',
      },
    ],
  },
  pricing: {
    eyebrow: 'Clear from the start.',
    title: 'Prices',
    intro: 'Clear pricing before the visit.',
    service: 'Service',
    price: 'Price',
    conditions: 'Conditions',
    hourlyTitle: 'On-site work',
    hourlyDescription: 'Setup, diagnostics and help with technology.',
    prague6Title: 'Call-out · Prague 6',
    prague6Description: 'Based on the municipal district of your address.',
    otherPragueTitle: 'Call-out · rest of Prague',
    otherPragueDescription: 'To all other Prague municipal districts.',
    perHour: '/hr',
    perVisit: 'once per visit',
    includingVat: 'including VAT',
    excludingVat: 'excluding VAT',
    billingNotice: `Charged for each started half-hour (${money(prices.halfHour.gross)} including VAT).`,
    minimumNotice: `The minimum labour charge is ${money(prices.halfHour.gross)} including VAT (${money(prices.halfHour.net)} excluding VAT) for ${prices.minimumMinutes} minutes. The call-out fee is charged separately.`,
    exampleLabel: 'Example visit in Prague 6',
    example: `A visit in Prague 6 costs ${money(prices.halfHour.gross + prices.travelPrague6.gross)} in total for up to 30 minutes, or ${money(prices.hourly.gross + prices.travelPrague6.gross)} for more than 30 minutes and up to one hour, including the call-out fee and VAT.`,
    rules: [
      'Working time is measured on site. Travel time is not counted as work.',
      'The call-out fee is charged once per visit. It depends on the municipal district of your address, not the postcode or postal designation, and includes the return journey and standard parking.',
      'You know the estimated scope of work, billing method and call-out fee before the visit. Charges for diagnostics are agreed in advance.',
      'Any additional costs require prior agreement. Licences and devices are priced separately and purchased only by agreement.',
    ],
    cta: 'Arrange a visit',
  },
  faq: {
    eyebrow: 'Simply explained.',
    title: 'Common questions',
    intro: 'Didn’t find your answer?',
    items: [
      {
        question: 'Will you come to my home?',
        answer:
          'Yes. The service is for homes and small offices in Prague; the location and appointment are agreed in advance.',
      },
      {
        question: 'How much does a short visit cost?',
        answer:
          'Work is charged in started half-hour intervals, with a minimum of 30 minutes. The call-out fee is separate. You can find exact amounts and total-price examples in the price list.',
        pricingLink: 'View prices',
      },
      {
        question: 'Is travel included?',
        answer:
          'A separate call-out fee applies according to the municipal district. It includes the return journey and standard parking; you know the fee before the visit.',
        pricingLink: 'See pricing details',
      },
      {
        question: 'Do you repair broken components?',
        answer:
          'Physical hardware repairs are not included. If a hardware fault is suspected, the next steps can be identified and a specialist repair service recommended.',
      },
      {
        question: 'Can you help a small business too?',
        answer: 'Yes, with everyday setup of computers, networks, printers, accounts and backups.',
      },
      {
        question: 'What if the problem cannot be solved on site?',
        answer:
          'The service includes a clear explanation of the findings and recommended next steps. Charges for diagnostics are agreed before the visit.',
      },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Contact',
    description: 'Describe what isn’t working. The next steps will be agreed by phone or email.',
    phoneLabel: 'Call',
    emailLabel: 'Send an email',
    whatsappLabel: 'Message on WhatsApp',
    areaLabel: 'Service area',
    area: 'Prague · homes and small offices',
    availabilityLabel: 'Availability',
    phonePlaceholder: 'The phone number will be added before launch.',
    emailPlaceholder: 'The email address will be added before launch.',
    previewNotice:
      'Local preview: contact details are still to be added. The form does not send messages yet.',
    formTitle: 'Describe the problem',
    handwritten: 'It starts with a message.',
  },
  form: {
    fields: {
      name: {
        label: 'Name',
        placeholder: 'How should we address you?',
        hint: '2 to 100 characters.',
      },
      phone: {
        label: 'Phone',
        placeholder: 'Your phone number',
        hint: 'International dialling codes and spaces are accepted.',
      },
      email: {
        label: 'Email',
        placeholder: 'you@example.com',
        hint: 'Optional. For a reply by email.',
      },
      location: {
        label: 'Where in Prague are you?',
        placeholder: 'For example Dejvice, Prague 6',
        hint: 'A district or approximate area is enough. No exact address is needed.',
      },
      message: {
        label: 'What do you need help with?',
        placeholder: 'What isn’t working, and which device do you need help with?',
        hint: '10 to 3,000 characters. Do not include passwords or other sensitive information.',
      },
      website: { label: 'Website', placeholder: '', hint: 'Leave this field empty.' },
    },
    required: 'Fields marked * are required.',
    optional: 'optional',
    submit: 'Send request',
    submitting: 'Sending…',
    noScript:
      'Enable JavaScript to send the form. Alternatively, use the phone contact if one is listed.',
    privacyBefore: 'Your details are used to handle your request. Learn more in the ',
    privacyLink: 'privacy notice',
    privacyAfter: '.',
    errorTitle: 'The request could not be sent',
    successTitle: 'Thank you for your message',
    retryHint:
      'Your entered details have been kept. You can try again or use the phone or email contact, if listed.',
    codes: {
      ACCEPTED: 'Your request has been sent. The next steps will be agreed by phone or email.',
      VALIDATION_ERROR: 'Please check the highlighted fields and try again.',
      PREVIEW_DISABLED:
        'This is a local preview. Your message was not sent; sending will be available once configuration is complete.',
      RATE_LIMITED: 'Too many requests have been made. Please wait a little and try again.',
      INVALID_REQUEST: 'The request could not be read. Refresh the page and try again.',
      PAYLOAD_TOO_LARGE: 'The message is too large. Please shorten it and try again.',
      METHOD_NOT_ALLOWED: 'This submission method is not supported. Please use the contact form.',
      ORIGIN_NOT_ALLOWED:
        'Submissions from this page are not allowed. Open the form on the Tvůj Karel website.',
      DELIVERY_FAILED:
        'The email service did not confirm your request. Please try again or use the phone or email contact.',
      NETWORK_ERROR:
        'The connection was interrupted and the sending result could not be verified. Check your connection; you can use phone or email before trying again.',
      UNKNOWN_ERROR:
        'The sending result could not be verified. You can use phone or email, or try submitting again.',
    },
    fieldErrors: {
      REQUIRED: 'Please fill in this field.',
      TOO_SHORT: 'The text is too short.',
      TOO_LONG: 'The text is too long.',
      INVALID_FORMAT: 'Please check the format.',
      UNSUPPORTED_LOCALE: 'This page language is not supported. Please refresh the page.',
    },
    fieldInvalid: {
      name: 'Your name must contain 2 to 100 characters.',
      phone: 'Enter a valid phone number, including an international dialling code if needed.',
      email: 'Enter a valid email address or leave this field empty.',
      location: 'The location must contain 2 to 150 characters.',
      message: 'The description must contain 10 to 3,000 characters.',
      website: 'This field must remain empty.',
      locale: 'A supported page language could not be determined.',
    },
  },
  footer: {
    tagline: 'Computer and tech help at your home in Prague.',
    links: 'Links',
    provider: 'Service provider',
    registrationNumber: 'Business ID',
    vatPayer: 'VAT registered',
    registeredOffice: 'Registered office',
    addressPlaceholder: 'The registered office address will be added before launch.',
    privacy: 'Privacy',
    copyright: 'All rights reserved.',
    backToTop: 'Back to top',
    preview: 'Local preview · not yet published',
  },
  privacy: {
    eyebrow: 'Privacy',
    title: 'Privacy notice',
    intro: 'How your information is handled when you contact Tvůj Karel.',
    draftNotice:
      'Working draft for local preview. The registered office and contact details, receiving mailbox provider, retention periods and final wording must be confirmed before launch.',
    sections: [
      {
        title: 'Who controls your data',
        paragraphs: [
          `The controller is ${siteConfig.provider.name}, business ID ${siteConfig.provider.registrationNumber}, providing services under the Tvůj Karel brand.`,
          siteConfig.provider.registeredOffice
            ? `Registered office: ${siteConfig.provider.registeredOffice}.`
            : 'The controller’s registered office address is to be added before launch.',
          siteConfig.contact.email
            ? `Privacy enquiries can be sent to ${siteConfig.contact.email}.`
            : 'A contact email for privacy enquiries is to be added before launch.',
        ],
      },
      {
        title: 'What is collected and why',
        paragraphs: [
          'The form contains your name, phone number, approximate location in Prague and a description of your request, with an optional email address. The page language is also processed. An exact address is not needed for the initial enquiry.',
          'The information is used to handle your enquiry, agree on next steps and arrange a possible visit. Do not include passwords or other sensitive information in your message. Marketing consent is not a condition of handling your enquiry.',
          'Enquiries are processed to take steps at your request before entering into a contract. Technical protections for the form and website serve to maintain security and limit misuse.',
        ],
      },
      {
        title: 'Message handling and providers',
        paragraphs: [
          `${siteConfig.production ? 'Amazon Web Services provides' : 'In the planned production setup, Amazon Web Services provides'} hosting and form transmission (S3, CloudFront, API Gateway, Lambda and Amazon SES). The backend and SES region is Frankfurt; CloudFront uses a global distribution network. The backend location alone does not guarantee that all related processing takes place solely in the EU.`,
          'The enquiry is forwarded by email to the controller’s mailbox. The form does not store enquiries in an application database and does not send automatic confirmation emails to customers. Confirmation on the website means acceptance by the email provider, not verified delivery to the mailbox.',
          siteConfig.privacy.mailboxProvider
            ? `Receiving mailbox provider: ${siteConfig.privacy.mailboxProvider}.`
            : 'The receiving mailbox provider and its data processing arrangements must be specified before launch.',
          siteConfig.production
            ? 'Amazon SES is used to transmit email messages from the form.'
            : 'Email sending is not active in the local preview.',
        ],
      },
      {
        title: 'Retention periods',
        paragraphs: [
          siteConfig.privacy.inquiryRetention
            ? `Enquiry retention: ${siteConfig.privacy.inquiryRetention}.`
            : 'A specific retention period for enquiries in the email mailbox has not yet been confirmed. It must be set and stated before launch.',
          siteConfig.privacy.logRetention
            ? `Technical log retention: ${siteConfig.privacy.logRetention}.`
            : 'The technical log retention period must be confirmed and configured before launch.',
          'Form application logs should not contain the enquiry text or contact details. Operational protections may process technical information needed to handle requests and limit misuse.',
        ],
      },
      {
        title: 'Your rights',
        paragraphs: [
          'Subject to applicable legal conditions, you can request access, correction, erasure, restriction or portability of your data and object to processing based on legitimate interests. Send your request to the controller using the published contact details.',
          siteConfig.production
            ? 'You also have the right to complain to the Czech Office for Personal Data Protection.'
            : 'You also have the right to complain to the Czech Office for Personal Data Protection. The exact request-handling procedure and final notice will be confirmed before launch.',
        ],
      },
      {
        title: 'Cookies, preferences and measurement',
        paragraphs: [
          'Marketing trackers and analytics are not enabled in this version. The page URL determines the language. Your choice of light or dark mode may be saved in your browser as a functional display preference.',
          'Enabling analytics in future requires an assessment of the actual setup and updated information. Contact details and enquiry text must never be sent to analytics.',
        ],
      },
    ],
    backHome: 'Back to the homepage',
    seoTitle: 'Privacy | Tvůj Karel',
    seoDescription:
      'How Tvůj Karel handles enquiry information, its providers, retention and your rights.',
  },
  notFound: {
    title: 'This page has wandered off.',
    description:
      'The address may contain a typo, or the page may not exist. Head to the homepage for help with your technology.',
    cta: 'Back to the homepage',
    seoTitle: 'Page not found | Tvůj Karel',
  },
  seo: {
    title: 'Tvůj Karel | Computer and tech help in Prague',
    description: `Help with computers, Wi-Fi and printers at your home in Prague. Device setup, data transfers and backups. Hourly rate ${money(prices.hourly.gross)} including VAT.`,
    socialImageAlt: 'Tvůj Karel — computer and tech help at your home in Prague',
    serviceType: 'On-site computer and technology help',
    areaServed: 'Prague',
  },
};
