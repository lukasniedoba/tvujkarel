import { prices, siteConfig } from '../config/site';
import { formatPrice } from './format';
import type { Dictionary } from './schema';

const money = (amount: number) => formatPrice(amount, 'cs');

export const cs: Dictionary = {
  languageName: 'Čeština',
  nav: {
    services: 'Služby',
    process: 'Jak to funguje',
    pricing: 'Ceník',
    about: 'O značce',
    contact: 'Kontakt',
    call: 'Zavolat',
    write: 'Napsat',
    home: 'Úvod',
  },
  a11y: {
    skipToContent: 'Přejít na obsah',
    navigation: 'Hlavní navigace',
    openMenu: 'Otevřít menu',
    closeMenu: 'Zavřít menu',
    languageSwitcher: 'Jazyk webu',
    currentLanguage: 'Aktuální jazyk',
    themeLight: 'Přepnout na světlý režim',
    themeDark: 'Přepnout na tmavý režim',
    themeToggle: 'Změnit barevný režim',
    mobileContact: 'Rychlý kontakt',
    externalLink: 'Otevře se v novém okně',
    logo: 'Tvůj Karel — úvodní stránka',
  },
  hero: {
    eyebrow: 'IT pomoc domů · Praha',
    title: 'Pomoc s počítačem a technikou přímo u vás v Praze',
    claim: 'Když technika neposlouchá.',
    description:
      'Nefunguje Wi-Fi, tiskárna nebo potřebujete nastavit nový notebook? Tvůj Karel pomůže s technikou u vás doma i v kanceláři. Srozumitelně a bez zbytečných starostí.',
    primaryCta: 'Zavolat',
    secondaryCta: 'Popsat problém',
    badges: ['Praha', 'Domácnosti i malé firmy', 'Srozumitelná cena před návštěvou'],
    imageAlt: 'Notebook, klávesnice a další technika na klidné domácí pracovní ploše',
    handwritten: 'Technika zase v pohodě.',
  },
  about: {
    eyebrow: 'O značce',
    title: 'Technika v klidu. Bez zbytečných starostí.',
    description:
      'Běžná technika by měla usnadňovat den. Tvůj Karel pomůže s nastavením, připojením i zálohami. Srozumitelně a bez zbytečných složitostí.',
    imageAlt: 'Detail notebooku a pracovního stolu s příslušenstvím',
    note: 'Lidsky. Srozumitelně. U vás.',
  },
  services: {
    eyebrow: 'S čím pomůže Tvůj Karel',
    title: 'S čím pomůže Tvůj Karel',
    intro:
      'Pomoc s počítačem v Praze, nastavení Wi-Fi i instalace tiskárny. Běžná technika pro domov a malou kancelář.',
    items: [
      {
        id: 'computers',
        title: 'Počítače a notebooky',
        description:
          'Nový notebook nebo pomalý počítač? Nastavení Windows a programů, aktualizace, uživatelské účty i řešení softwarových potíží.',
      },
      {
        id: 'wifi',
        title: 'Wi-Fi a internet',
        description:
          'Wi-Fi nedosáhne do vedlejšího pokoje? Nastavení routeru, připojení zařízení, prověření signálu a konfigurace mesh sítě.',
      },
      {
        id: 'printers',
        title: 'Tiskárny a příslušenství',
        description:
          'Tiskárna se nepřipojí k Wi-Fi? Pomoc s tiskem, skenováním, monitory, webkamerami a externími disky.',
      },
      {
        id: 'data',
        title: 'Data a zálohy',
        description:
          'Fotografie a dokumenty do nového počítače. Přenos dostupných dat, automatické zálohy, OneDrive a Google Drive.',
      },
      {
        id: 'accounts',
        title: 'E-mail a účty',
        description:
          'Pošta v počítači i telefonu tak, jak potřebujete. Gmail, Outlook, synchronizace, nastavení a zabezpečení účtů.',
      },
      {
        id: 'security',
        title: 'Bezpečnost',
        description:
          'Podezřelé chování nebo zpráva, které nevěříte? Kontrola běžného malwaru, rozšíření prohlížeče, aktualizace a pomoc s rozpoznáním podvodů.',
      },
      {
        id: 'apple',
        title: 'Apple a iCloud',
        description:
          'Pomoc s nastavením macOS a iCloudu v předem domluveném rozsahu. Konkrétní zařízení a požadavek ověříme před návštěvou.',
      },
    ],
    note: 'Fyzické opravy hardwaru ani profesionální obnova dat z poškozených disků nejsou součástí služby.',
  },
  process: {
    eyebrow: 'Od prvního zavolání k technice v klidu.',
    title: 'Jak to funguje',
    steps: [
      {
        title: 'Popíšete problém',
        description: 'Zavoláte nebo napíšete, co nefunguje a kde v Praze jste.',
      },
      {
        title: 'Domluvená návštěva',
        description:
          'Před návštěvou znáte termín, orientační rozsah práce, způsob účtování a cenu výjezdu podle adresy.',
      },
      {
        title: 'Pomoc na místě',
        description:
          'Prověření problému, domluvené nastavení a srozumitelné vysvětlení dalšího postupu.',
      },
    ],
  },
  pricing: {
    eyebrow: 'Jasně předem.',
    title: 'Ceník',
    intro: 'Srozumitelná cena před návštěvou.',
    service: 'Služba',
    price: 'Cena',
    conditions: 'Podmínky',
    hourlyTitle: 'Práce na místě',
    hourlyDescription: 'Nastavení, diagnostika a pomoc s technikou.',
    prague6Title: 'Výjezd · Praha 6',
    prague6Description: 'Podle městské části adresy zákazníka.',
    otherPragueTitle: 'Výjezd · ostatní Praha',
    otherPragueDescription: 'Do ostatních městských částí Prahy.',
    perHour: '/h',
    perVisit: 'jednou za návštěvu',
    includingVat: 'včetně DPH',
    excludingVat: 'bez DPH',
    billingNotice: `Účtování po každé započaté půlhodině (${money(prices.halfHour.gross)} včetně DPH).`,
    minimumNotice: `Minimální cena práce je ${money(prices.halfHour.gross)} včetně DPH (${money(prices.halfHour.net)} bez DPH) za ${prices.minimumMinutes} minut. Výjezd se účtuje samostatně.`,
    exampleLabel: 'Příklad návštěvy na Praze 6',
    example: `Návštěva na Praze 6 do 30 minut stojí celkem ${money(prices.halfHour.gross + prices.travelPrague6.gross)}, nad 30 minut a do hodiny ${money(prices.hourly.gross + prices.travelPrague6.gross)}, včetně výjezdu a DPH.`,
    rules: [
      'Čas práce se počítá na místě. Doprava se do doby zásahu nepočítá.',
      'Výjezd se účtuje jednou za návštěvu. Jeho cena se řídí městskou částí adresy, nikoli PSČ nebo poštovním označením. Zahrnuje cestu tam i zpět a běžné parkování.',
      'Před návštěvou znáte orientační rozsah práce, způsob účtování i cenu výjezdu. Účtování diagnostiky se domlouvá předem.',
      'Případné další náklady se odsouhlasí předem. Licence a zařízení se účtují odděleně a pořizují pouze po domluvě.',
    ],
    cta: 'Domluvit návštěvu',
  },
  faq: {
    eyebrow: 'Srozumitelně.',
    title: 'Časté otázky',
    intro: 'Nenašli jste odpověď?',
    items: [
      {
        question: 'Přijedete ke mně domů?',
        answer:
          'Ano, služba je určena pro domácnosti a malé kanceláře v Praze; konkrétní lokalitu a termín domluvíme předem.',
      },
      {
        question: 'Kolik zaplatím za krátkou návštěvu?',
        answer:
          'Práce se účtuje po započatých půlhodinách, minimálně 30 minut, a výjezd samostatně. Konkrétní částky a příklady celkové ceny najdete v ceníku.',
        pricingLink: 'Prohlédnout ceník',
      },
      {
        question: 'Je doprava v ceně?',
        answer:
          'Výjezd se účtuje samostatně podle městské části. Paušál zahrnuje cestu tam i zpět a běžné parkování; jeho cenu znáte před návštěvou.',
        pricingLink: 'Podrobnosti v ceníku',
      },
      {
        question: 'Opravujete rozbité součástky?',
        answer:
          'Fyzické opravy hardwaru nejsou součástí služby. Při podezření na závadu lze určit další postup a doporučit specializovaný servis.',
      },
      {
        question: 'Pomůžete i malé firmě?',
        answer: 'Ano, s běžným nastavením počítačů, sítě, tiskáren, účtů a záloh.',
      },
      {
        question: 'Co když problém nepůjde vyřešit na místě?',
        answer:
          'Součástí pomoci je srozumitelné vysvětlení zjištění a doporučení dalšího postupu. Účtování diagnostiky se domlouvá před návštěvou.',
      },
    ],
  },
  contact: {
    eyebrow: 'Kontakt',
    title: 'Kontakt',
    description: 'Popište, co nefunguje. Další postup domluvíme po telefonu nebo e-mailem.',
    phoneLabel: 'Zavolejte',
    emailLabel: 'Napište e-mail',
    whatsappLabel: 'Napsat na WhatsApp',
    areaLabel: 'Kde služba pomáhá',
    area: 'Praha · domácnosti a malé kanceláře',
    availabilityLabel: 'Dostupnost',
    phonePlaceholder: 'Telefon bude doplněn před spuštěním.',
    emailPlaceholder: 'E-mail bude doplněn před spuštěním.',
    previewNotice:
      'Lokální náhled: kontaktní údaje čekají na doplnění. Formulář nyní zprávy neodesílá.',
    formTitle: 'Popsat problém',
    handwritten: 'Začíná to jednou zprávou.',
  },
  form: {
    fields: {
      name: { label: 'Jméno', placeholder: 'Jak vás oslovit?', hint: '2 až 100 znaků.' },
      phone: {
        label: 'Telefon',
        placeholder: 'Vaše telefonní číslo',
        hint: 'Můžete použít mezinárodní předvolbu a mezery.',
      },
      email: {
        label: 'E-mail',
        placeholder: 'vas@email.cz',
        hint: 'Nepovinné. Pro odpověď e-mailem.',
      },
      location: {
        label: 'Kde v Praze jste',
        placeholder: 'Například Dejvice, Praha 6',
        hint: 'Stačí část Prahy nebo orientační lokalita. Přesná adresa není potřeba.',
      },
      message: {
        label: 'S čím potřebujete pomoci',
        placeholder: 'Co nefunguje a s jakým zařízením potřebujete pomoci?',
        hint: '10 až 3 000 znaků. Neposílejte hesla ani jiné citlivé údaje.',
      },
      website: { label: 'Webová stránka', placeholder: '', hint: 'Toto pole nevyplňujte.' },
    },
    required: 'Pole označená * jsou povinná.',
    optional: 'nepovinné',
    submit: 'Odeslat požadavek',
    submitting: 'Odesílání…',
    noScript:
      'Pro odeslání formuláře zapněte JavaScript. Případně použijte telefonní kontakt, pokud je uveden.',
    privacyBefore: 'Údaje slouží k vyřízení vašeho požadavku. Podrobnosti najdete v ',
    privacyLink: 'zásadách ochrany osobních údajů',
    privacyAfter: '.',
    errorTitle: 'Požadavek se nepodařilo odeslat',
    successTitle: 'Děkujeme za zprávu',
    retryHint:
      'Vyplněné údaje zůstaly zachované. Můžete zkusit odeslání znovu nebo využít telefon či e-mail, jsou-li uvedeny.',
    codes: {
      ACCEPTED: 'Požadavek byl odeslán. Další postup domluvíme po telefonu nebo e-mailem.',
      VALIDATION_ERROR: 'Zkontrolujte prosím označená pole a zkuste to znovu.',
      PREVIEW_DISABLED:
        'Toto je lokální náhled. Zpráva nebyla odeslána; odesílání bude dostupné po dokončení konfigurace.',
      RATE_LIMITED: 'Požadavků bylo příliš mnoho. Chvíli prosím počkejte a zkuste odeslání znovu.',
      INVALID_REQUEST: 'Požadavek se nepodařilo načíst. Obnovte stránku a zkuste to znovu.',
      PAYLOAD_TOO_LARGE: 'Zpráva je příliš velká. Zkraťte prosím text a zkuste to znovu.',
      METHOD_NOT_ALLOWED:
        'Tento způsob odeslání není podporován. Použijte prosím kontaktní formulář.',
      ORIGIN_NOT_ALLOWED:
        'Odesílání z této stránky není povoleno. Otevřete formulář na webu Tvůj Karel.',
      DELIVERY_FAILED:
        'E-mailová služba požadavek nepotvrdila. Zkuste to prosím znovu nebo využijte telefon či e-mail.',
      NETWORK_ERROR:
        'Připojení se přerušilo a výsledek odeslání se nepodařilo ověřit. Zkontrolujte připojení; před opakováním můžete využít telefon nebo e-mail.',
      UNKNOWN_ERROR:
        'Výsledek odeslání se nepodařilo ověřit. Můžete použít telefon nebo e-mail, případně odeslání zopakovat.',
    },
    fieldErrors: {
      REQUIRED: 'Vyplňte prosím toto pole.',
      TOO_SHORT: 'Text je příliš krátký.',
      TOO_LONG: 'Text je příliš dlouhý.',
      INVALID_FORMAT: 'Zkontrolujte prosím formát údaje.',
      UNSUPPORTED_LOCALE: 'Jazyk stránky není podporován. Obnovte prosím stránku.',
    },
    fieldInvalid: {
      name: 'Jméno musí mít 2 až 100 znaků.',
      phone: 'Zadejte platné telefonní číslo, případně s mezinárodní předvolbou.',
      email: 'Zadejte platnou e-mailovou adresu, nebo pole ponechte prázdné.',
      location: 'Lokalita musí mít 2 až 150 znaků.',
      message: 'Popis musí mít 10 až 3 000 znaků.',
      website: 'Toto pole musí zůstat prázdné.',
      locale: 'Nepodařilo se určit podporovaný jazyk stránky.',
    },
  },
  footer: {
    tagline: 'Pomoc s počítačem a technikou přímo u vás v Praze.',
    links: 'Odkazy',
    provider: 'Poskytovatel služby',
    registrationNumber: 'IČO',
    vatPayer: 'Plátce DPH',
    registeredOffice: 'Sídlo',
    addressPlaceholder: 'Sídlo bude doplněno před spuštěním.',
    privacy: 'Ochrana osobních údajů',
    copyright: 'Všechna práva vyhrazena.',
    backToTop: 'Zpět nahoru',
    preview: 'Lokální náhled · dosud nezveřejněno',
  },
  privacy: {
    eyebrow: 'Soukromí',
    title: 'Ochrana osobních údajů',
    intro: 'Jak se při kontaktování služby Tvůj Karel nakládá s vašimi údaji.',
    draftNotice:
      'Pracovní návrh pro lokální náhled. Před spuštěním je nutné doplnit sídlo a kontakty, potvrdit poskytovatele cílové e-mailové schránky, doby uchování a konečné znění těchto informací.',
    sections: [
      {
        title: 'Kdo je správcem údajů',
        paragraphs: [
          `Správcem je ${siteConfig.provider.name}, IČO ${siteConfig.provider.registrationNumber}, poskytovatel služby pod značkou Tvůj Karel.`,
          siteConfig.provider.registeredOffice
            ? `Sídlo: ${siteConfig.provider.registeredOffice}.`
            : 'Sídlo správce čeká na doplnění před spuštěním.',
          siteConfig.contact.email
            ? `Dotazy k osobním údajům lze poslat na ${siteConfig.contact.email}.`
            : 'Kontaktní e-mail pro dotazy k osobním údajům čeká na doplnění před spuštěním.',
        ],
      },
      {
        title: 'Jaké údaje a proč',
        paragraphs: [
          'Formulář obsahuje jméno, telefon, orientační lokalitu v Praze a popis požadavku, nepovinně e-mail. Zpracovává se také jazyk použité stránky. Přesná adresa není pro první kontakt potřeba.',
          'Údaje slouží k vyřízení poptávky, domluvení dalšího postupu a případné návštěvy. Nevkládejte do zprávy hesla ani jiné citlivé údaje. Vyřízení poptávky není podmíněno souhlasem s marketingem.',
          'Základem zpracování poptávky jsou kroky před uzavřením smlouvy na vaši žádost. Technická ochrana formuláře a provozu webu slouží k zajištění bezpečnosti a omezení zneužití.',
        ],
      },
      {
        title: 'Předání zprávy a poskytovatelé',
        paragraphs: [
          `${siteConfig.production ? 'Hosting a předání formuláře zajišťuje' : 'V připravované produkční konfiguraci zajišťuje hosting a předání formuláře'} Amazon Web Services (S3, CloudFront, API Gateway, Lambda a Amazon SES). Region backendu a SES je Frankfurt; CloudFront používá globální distribuční síť. Samotné umístění backendu není zárukou, že veškeré související zpracování probíhá pouze v EU.`,
          'Požadavek se předává e-mailem do schránky správce. Formulář neukládá poptávky do aplikační databáze a neposílá automatické potvrzení zákazníkovi. Potvrzení na webu znamená přijetí zprávy e-mailovým poskytovatelem, nikoli ověřené doručení do schránky.',
          siteConfig.privacy.mailboxProvider
            ? `Poskytovatel cílové e-mailové schránky: ${siteConfig.privacy.mailboxProvider}.`
            : 'Poskytovatel cílové e-mailové schránky a podmínky jeho zpracování údajů musí být doplněny před spuštěním.',
          siteConfig.production
            ? 'K předání e-mailových zpráv z formuláře se používá služba Amazon SES.'
            : 'Lokální náhled nemá odesílání e-mailů aktivní.',
        ],
      },
      {
        title: 'Doba uchování',
        paragraphs: [
          siteConfig.privacy.inquiryRetention
            ? `Uchování poptávek: ${siteConfig.privacy.inquiryRetention}.`
            : 'Konkrétní doba uchování poptávek v e-mailové schránce dosud nebyla potvrzena. Musí být stanovena a uvedena před spuštěním.',
          siteConfig.privacy.logRetention
            ? `Uchování technických logů: ${siteConfig.privacy.logRetention}.`
            : 'Doba uchování technických logů musí být potvrzena a nastavena před spuštěním.',
          'Aplikační logy formuláře nemají obsahovat text poptávky ani kontaktní údaje. Provozní ochrany mohou zpracovávat technické informace nezbytné pro vyřízení požadavku a omezení zneužití.',
        ],
      },
      {
        title: 'Vaše práva',
        paragraphs: [
          'Za podmínek právních předpisů můžete požádat o přístup k údajům, opravu, výmaz, omezení zpracování nebo přenositelnost a vznést námitku proti zpracování založenému na oprávněném zájmu. Žádost směřujte správci prostřednictvím zveřejněného kontaktu.',
          siteConfig.production
            ? 'Máte také právo podat stížnost u Úřadu pro ochranu osobních údajů.'
            : 'Máte také právo podat stížnost u Úřadu pro ochranu osobních údajů. Přesný postup vyřízení žádostí a finální informační text budou potvrzeny před spuštěním.',
        ],
      },
      {
        title: 'Cookies, nastavení a měření',
        paragraphs: [
          'V této verzi nejsou zapnuté marketingové trackery ani analytika. Jazyk určuje adresa stránky. Zvolený světlý nebo tmavý režim se může uložit v prohlížeči jako funkční nastavení vzhledu.',
          'Případné budoucí zapnutí analytiky vyžaduje posouzení konkrétního nastavení a aktualizaci informací. Kontaktní údaje ani text poptávky nesmějí být předávány do analytiky.',
        ],
      },
    ],
    backHome: 'Zpět na hlavní stránku',
    seoTitle: 'Ochrana osobních údajů | Tvůj Karel',
    seoDescription:
      'Informace o zpracování údajů při poptávce služby Tvůj Karel, poskytovatelích, uchování a vašich právech.',
  },
  notFound: {
    title: 'Tahle stránka se zatoulala.',
    description:
      'Adresa možná obsahuje překlep nebo stránka neexistuje. S technikou vám pomůže hlavní stránka.',
    cta: 'Zpět na hlavní stránku',
    seoTitle: 'Stránka nenalezena | Tvůj Karel',
  },
  seo: {
    title: 'Tvůj Karel | Pomoc s počítačem a technikou v Praze',
    description: `Pomoc s počítačem, Wi-Fi a tiskárnou přímo u vás v Praze. Nastavení zařízení, přenos dat a zálohy. Hodinová sazba ${money(prices.hourly.gross)} včetně DPH.`,
    socialImageAlt: 'Tvůj Karel — pomoc s počítačem a technikou přímo u vás v Praze',
    serviceType: 'Pomoc s počítačem a technikou na místě',
    areaServed: 'Praha',
  },
};
