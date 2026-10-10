# Tvůj Karel

Web služby pomoci s počítači a technikou v Praze: Astro + TypeScript, společné komponenty a české, anglické a ruské texty. Zadání je v [TvujKarel_zadani_webu.md](TvujKarel_zadani_webu.md), schválený vizuální směr a mockupy v [docs/design](docs/design/README.md).

Na [tvujkarel.cz](https://tvujkarel.cz) je nasazený **neindexovaný náhled na produkční infrastruktuře** s vypnutým odesíláním formuláře. HTTPS, všechny tři jazyky, přesměrování, 404 a formulář prošly 23 živými kontrolami; [doklad nasazení](docs/verification/deployment.md) uvádí skutečný stav. CDK stack, deploy skripty, CI přes OIDC a postup návratu jsou popsané v [dokumentaci nasazení](docs/deployment.md). Chybějící reálné kontakty a údaje správce zůstávají viditelně označené v náhledu; nejsou nahrazené smyšlenými údaji. Plné spuštění vyžaduje doplnění údajů, schválení obsahu a skutečné ověření doručení.

## Přístup do AWS

Projekt má dva AWS účty ve stejné AWS Organization jako Naraveya a používá společný IAM Identity Center (SSO). Samostatný preprod účet se pro tento projekt nepoužívá.

1. [Přihlaste se do AWS přes společný SSO portál](https://d-99674d1ef0.awsapps.com/start/) uživatelským jménem `niedoba.lukas_management`.
2. Vyberte požadovaný účet a otevřete jeho AWS Management Console.

| AWS účet         | ID účtu        | Účel                                                                  |
| ---------------- | -------------- | --------------------------------------------------------------------- |
| `tvujkarel-dns`  | `890192513455` | Registrace domény a autoritativní Route 53 DNS zóna                   |
| `tvujkarel-prod` | `541855874226` | Produkční hosting, CloudFront, API Gateway, Lambda, SES a certifikáty |

Pro AWS CLI jsou určené názvy profilů `administrator-tvujkarel-dns` a `administrator-tvujkarel-prod`. Před prvním použitím je nakonfigurujte pomocí `aws configure sso --profile <název-profilu>` se stávající SSO session `naraveya` v regionu `eu-central-1` a odpovídajícím účtem a permission setem.

Před každým nasazením ověřte identitu a porovnejte vrácené ID účtu s tabulkou výše:

```sh
aws sso login --profile administrator-tvujkarel-prod
aws sts get-caller-identity --profile administrator-tvujkarel-dns
aws sts get-caller-identity --profile administrator-tvujkarel-prod
```

Registrace `tvujkarel.cz` a veřejná Route 53 zóna byly 10. 10. 2026 přesunuty z účtu `005908799433` do `tvujkarel-dns` (`890192513455`). Nová zóna má ID `Z076204315B86GU4PJHXB` a nameservery `ns-1254.awsdns-28.org`, `ns-573.awsdns-07.net`, `ns-1810.awsdns-34.co.uk` a `ns-28.awsdns-03.com`; změna je potvrzená v AWS i registru CZ.NIC. Automatické prodlužování zůstalo zapnuté a expirace je 27. 4. 2027. Existující ověřovací CNAME pro ACM byl zachovaný; zóna nemá záznam směrující web na odstraněný S3 bucket.

Původní zóna `Z03694602CCTUWM9Z9KQA` zůstává dočasně v účtu `005908799433` kvůli DNS cache. Odstranit ji lze nejdříve 12. 10. 2026 po 18:15 CEST, po ověření delegace a shody potřebných záznamů v nové zóně. Pro resolvery s původní delegací jsou v obou zónách shodné A/AAAA webové aliasy na novou distribuci CloudFront. Nameservery a registrace se tímto deployem neměnily. Nový ACM certifikát pro apex i `www` je vydaný v produkčním účtu v `us-east-1`; jeho validační CNAME jsou v nové DNS zóně.

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

Limity velikosti požadavku a četnosti jsou konfigurovatelné. Lokální limiter udržuje pouze časově omezené osolené HMAC identifikátory v paměti procesu, nikoli obsah poptávek. Jeho stav není sdílený mezi instancemi; CDK přidává API Gateway throttle 2 req/s s burst 5. Formulář nemá přílohy, databázi ani automatické potvrzovací e-maily zákazníkovi. Přijetí zprávy službou SES a skutečné doručení do schránky jsou dvě různá ověření.

## Externí služby a nasazení

Lokální sestavení používá fonty dodané přes balíčky `@fontsource` a lokální grafické podklady. Web nemá zapnutou analytiku ani marketingové trackery.

CDK v `infra/app.ts` definuje privátní S3 s OAC, CloudFront, API Gateway, Lambdu, DNS aliasy, OIDC pro CI, uchování logů, provozní alarmy a AWS Budget. S3/API/Lambda jsou ve Frankfurtu; certifikát CloudFront v `us-east-1`. SES je v náhledu vypnuté a role nemá oprávnění odesílat. [Dokumentace nasazení](docs/deployment.md) obsahuje konkrétní stack, odhad nákladů, příkazy, bezpečnostní hranice a rollback. Provozní rozpočet musí být schválený před vytvářením účtovaných prostředků; AWS Budget pouze upozorňuje a není tvrdý strop.

Před zapnutím plné produkce je dále třeba ověřit SES doménu a příjemce, DKIM a soulad SPF/DMARC se skutečnou schránkou, nastavit reálné uchování a schválit veřejné texty. Náhled už má ověřené skutečné HTTP přesměrování, 404, všechny jazykové URL a vypnutý formulář přes CloudFront. Živé odeslání musí odděleně ověřit přijetí v SES a doručení zprávy včetně cyrilice.

Nasazení uchovává cloud assembly s konkrétním statickým buildem a Lambda balíčkem v ignorovaném `.deployment/releases/`. Opětovný deploy předchozí assembly obnoví celek a invaliduje CloudFront. GitHub environment `production`, pravidla schvalování, secrets a variables jsou nastavené a ověřené. CI workflow je součástí repozitáře a spouští se manuálně přes GitHub Actions; první běh zatím neproběhl. Rollback není označený za živě ověřený, dokud nebyl skutečně provedený.

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

Lokálně byl ověřen i produkční validátor: výchozí náhledovou konfiguraci odmítl, úplnou syntetickou konfiguraci přijal a neplatné varianty odmítl. Přímý build s produkčním režimem a chybějícími údaji rovněž skončil očekávanou chybou. Tyto kontroly neprovedly síťové volání ani odeslání zprávy. Živé SES, doručení e-mailů a CloudFront nebyly v rámci lokálního zadání ověřovány. Samostatný přesun registrace a DNS je popsaný v sekci Přístup do AWS; nová zóna i záznam ACM mají stav `INSYNC` a odpovědi NS/CNAME byly ověřené přes Route 53 `test-dns-answer`. Produkční Lighthouse a skutečné Safari / mobilní prohlížeče vyžadují samostatné měření; automatizovaný WebKit a simulace rozměrů je nenahrazují.
