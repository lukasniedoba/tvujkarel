# Tvůj Karel

Web služby pomoci s počítači a technikou v Praze: Astro + TypeScript, společné komponenty a české, anglické a ruské texty. Zadání je v [TvujKarel_zadani_webu.md](TvujKarel_zadani_webu.md), schválený vizuální směr a mockupy v [docs/design](docs/design/README.md).

Aktuální rozsah je **lokální implementace a ověřování**. Nasazení je na přání zadavatele odložené. Tato práce nevytváří AWS prostředky, nemění DNS a nezveřejňuje web. Chybějící reálné kontakty a údaje správce zůstávají viditelně označené v náhledu; nejsou nahrazené smyšlenými údaji.

## Lokální spuštění

Použijte Node.js 22.19 nebo novější a npm. Závislosti jsou zamčené v `package-lock.json`.

```sh
npm ci
cp .env.example .env
npm run dev
```

Výchozí adresa Astra je `http://localhost:4321`. Jazyk určuje URL: `/cs/`, `/en/` a `/ru/`; ochrana osobních údajů je vždy na `/<jazyk>/privacy/`. Odkazy mezi jazyky zachovávají typ stránky a kotvu hlavní stránky. Přesměrování a 404 na budoucím statickém hostingu bude nutné ověřit při nasazení.

`.env.example` má `PUBLIC_SITE_MODE=preview` a `CONTACT_MODE=disabled`. Náhled je neindexovaný a odesílání do SES je vypnuté. Validní formulář v tomto režimu vrací `503 PREVIEW_DISABLED` a ukáže lokalizované vysvětlení; nezobrazuje falešný úspěch. Konfigurační soubory `.env*` s reálnými údaji nepatří do Gitu.

## Kontroly a sestavení

```sh
npm run check
npm run check:translations
npm test
npm run build
npm run preview
```

`build` vytvoří statický výstup v `dist/` a před sestavením ověří úplnost překladů. `preview` slouží ke kontrole tohoto výstupu; kontaktní API je při lokálním vývoji i náhledu dostupné na stejné cestě `/api/contact` přes Vite integraci. Po změně konfigurace nebo obsahu náhled znovu sestavte.

Testy v prohlížeči:

```sh
npx playwright install chromium webkit
npm run test:e2e
```

Samostatná kontrola produkční konfigurace:

```sh
npm run check:production
```

S výchozím `.env.example` má tato kontrola **záměrně skončit chybou**. Vyžaduje produkční režim, skutečné kontakty a sídlo, poskytovatele schránky, schválená pravidla uchování, nakonfigurovaný SES transport, HTTPS origin a zaznamenaná potvrzení připravenosti. Sama nikdy nekontaktuje AWS ani neposílá e-mail. Umí odmítnout chybějící nebo běžné ukázkové hodnoty; skutečnou funkčnost telefonu, pravdivost identifikačních údajů ani doručení do schránky nelze ověřit pouhou kontrolou řetězců.

Kontrola čte `.env`, `.env.local`, `.env.production`, `.env.production.local` v tomto pořadí; proměnné procesu mají přednost. Uvádějte doslovné hodnoty bez interpolace dalších proměnných. Běžný preview build se dá vytvořit i s nevyplněnými údaji. Při `PUBLIC_SITE_MODE=production` se gate spouští automaticky i při přímém `astro build`; neúplná konfigurace sestavení zastaví.

## Obsah a konfigurace

- `src/config/site.ts`: značka, jazykové URL, společné ceny, poskytovatel, kontakty a přepínače služeb. Telefon pro zobrazení a `PUBLIC_PHONE_TEL` musí označovat stejné číslo; normalizovaná hodnota začíná `+` a neobsahuje prefix `tel:`.
- `src/i18n/`: české, anglické a ruské slovníky a jejich společná typovaná struktura. Změny významu provádějte ve všech jazycích. Chybějící překlad neřešte českým fallbackem pod cizojazyčnou URL.
- `public/images/`: sdílené fotografie vytvořené pomocí ImageGen pro tento vizuální směr, optimalizované do WebP/AVIF. Obrázky nejsou pod jazykovými prefixy. Responzivní velikosti obnoví `node scripts/optimize-images.mjs`. Před veřejným spuštěním musí být jejich použití schválené.
- `src/lib/contact.ts`: společné limity a validace formuláře; délky textu se počítají v Unicode code points, velikost požadavku v bajtech.
- `server/`: kontaktní handler, konfigurace, ochrana proti nadměrnému odesílání, lokální Vite integrace a adaptér Lambda pro API Gateway HTTP API v2.

Ceny se mění ve společné konfiguraci, nikoli nezávisle v překladech. Při změně sazeb ověřte i čisté ceny, půlhodinový interval, minimum, oba výjezdy a příklady celkových cen. Výjezd se řídí městskou částí, nikoli PSČ. WhatsApp a Apple služby zůstávají vypnuté, dokud je zadavatel nepotvrdí. DIČ se doplňuje pouze ze skutečně dodaného údaje. Bez vyplněné dostupnosti se nevymýšlí otevírací doba.

`PUBLIC_PRIVACY_APPROVED=true` zaznamenává schválení soukromí, poskytovatelů a uchování ve všech jazycích. `PUBLIC_CONTENT_APPROVED=true` zahrnuje texty, překlady, pravidla diagnostiky, rozsah služeb a práva k obrázkům. `CONTACT_DETAILS_VERIFIED=true` potvrzuje skutečné ověření kontaktů a identifikačních údajů. `CONTACT_DELIVERY_VERIFIED=true` zaznamenává ověření SES oprávnění a potvrzený příjem testovací zprávy v cílové schránce. Tyto hodnoty nepřepínejte jen proto, aby kontrola prošla.

## Kontaktní formulář

Výchozí lokální provoz nevyžaduje AWS účet ani přístupové klíče. Endpoint přijímá `POST /api/contact` s JSON poli `locale`, `name`, `phone`, `email`, `location`, `message` a honeypotem `website`. Jazyk musí být `cs`, `en` nebo `ru`; e-mail je nepovinný. Odpověď obsahuje stabilní `code`, případně chyby `fields`; klient ji přeloží podle stránky.

Serverová konfigurace je popsaná v `.env.example`. `CONTACT_MODE=ses` **zapíná reálné posílání**; pro současné lokální ověřování ponechte `disabled`. Při budoucím schváleném zapnutí je nutné nastavit `CONTACT_SENDER`, `CONTACT_RECIPIENT`, `CONTACT_ALLOWED_ORIGINS` a `CONTACT_SES_REGION`. Odesílatel musí být ověřený v SES; adresa zákazníka se používá pouze jako Reply-To. AWS přístup bude poskytovat IAM role, případně explicitně zvolený lokální AWS profil; žádné AWS klíče nepatří do veřejné konfigurace nebo klientského buildu.

Limity velikosti požadavku a četnosti jsou konfigurovatelné. Lokální limiter udržuje pouze časově omezené osolené HMAC identifikátory v paměti procesu, nikoli obsah poptávek. Jeho stav není sdílený mezi instancemi; budoucí produkční infrastruktura musí přidat omezení v API Gateway. Formulář nemá přílohy, databázi ani automatické potvrzovací e-maily zákazníkovi. Přijetí zprávy službou SES a skutečné doručení do schránky jsou dvě různá ověření.

## Externí služby a budoucí nasazení

Lokální sestavení používá fonty dodané přes balíčky `@fontsource` a lokální grafické podklady. Web nemá zapnutou analytiku ani marketingové trackery. Provozní konfigurace žádného nového externího účtu se nyní nevytváří.

Samostatná následná práce podle zadání zahrne CDK infrastrukturu (privátní S3 s OAC, CloudFront, API Gateway, Lambda, SES), HTTPS, DNS, OIDC pro CI, log retention, monitoring chyb a nákladů. Ve Frankfurtu mají být S3/API/Lambda/SES; certifikát CloudFront v `us-east-1`. Konkrétní AWS účet, DNS varianta, provozní rozpočet a první nasazení vyžadují domluvu před vytvářením prostředků. Aktuální odhad nákladů se před tím musí ověřit; tento README nepotvrzuje žádnou cenu služeb.

Před zveřejněním je dále třeba ověřit SES doménu a příjemce, DKIM a soulad SPF/DMARC se skutečnou schránkou, nastavit reálné uchování a schválit veřejné texty. Následuje kontrola skutečných HTTP přesměrování, 404, všech jazykových URL, SEO a formuláře přes CloudFront. Živé odeslání musí odděleně ověřit přijetí v SES a doručení zprávy včetně cyrilice.

Postup nasazení a návratu na předchozí verzi bude doplněn až s konkrétní infrastrukturou. Má uchovat předchozí statický build a verzi Lambdy, obnovit je jako celek a invalidovat změněné HTML i sitemapu. CDK, OIDC a cloudový rollback nyní nejsou vydávané za dokončené.

## Stav ověření

Doklady vizuální kontroly a její opravy jsou v [design-qa.md](design-qa.md), snímky v [docs/verification](docs/verification). Automatizované testy pokrývají Chromium i WebKit, všechny tři jazyky, světlý/tmavý režim, šířky 360/390/768/1024/1440 px, navigaci, přístupnost a stavy formuláře. Odeslání v úspěšných testech používá kontrolovaný testovací adaptér; žádná zpráva zákazníkovi ani skutečné schránce odeslaná nebyla.

[Lighthouse report](docs/verification/lighthouse.md) zaznamenává mobilní výkon 96 ve všech třech jazycích a desktop 100; Accessibility a Best Practices jsou 100. Náhled má záměrně `noindex`, proto SEO dosahuje 69. Reprodukce nad statickým buildem:

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4322
# V druhém terminálu:
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4322 npm run test:e2e
node scripts/audit-lighthouse.mjs --url http://127.0.0.1:4322 --desktop-locales cs
```

Lokálně byl ověřen i produkční validátor: výchozí náhledovou konfiguraci odmítl, úplnou syntetickou konfiguraci přijal a neplatné varianty odmítl. Přímý build s produkčním režimem a chybějícími údaji rovněž skončil očekávanou chybou. Tyto kontroly neprovedly síťové volání ani odeslání zprávy. Živé SES, doručení e-mailů, DNS, CloudFront a placené cloudové služby nebyly v rámci lokálního zadání ověřovány. Produkční Lighthouse a skutečné Safari / mobilní prohlížeče vyžadují samostatné měření; automatizovaný WebKit a simulace rozměrů je nenahrazují.
