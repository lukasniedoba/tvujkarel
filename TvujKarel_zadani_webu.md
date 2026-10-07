# TvujKarel.cz — zadání webu pro programátora

Verze: 1.0  
Datum: 6. 10. 2026  
Jazyk webu: čeština  
Zadavatel a poskytovatel služby: Lukáš Niedoba, IČO 06838103

## 1. Cíl projektu

Vytvořit rychlý, přehledný a osobní web značky **Tvůj Karel** pro pomoc s počítači a technikou přímo u zákazníka v Praze. Cílovou skupinou jsou domácnosti a malé kanceláře, které potřebují konkrétní problém vyřešit a nechtějí studovat technické návody.

Návštěvník má během 20 sekund pochopit službu, najít cenu a zavolat nebo napsat. Primární konverze je telefonát; sekundární je zpráva nebo odeslání poptávkového formuláře.

MVP: jedna hlavní stránka, stránka ochrany osobních údajů, funkční kontaktní formulář a základní SEO. Bez zákaznických účtů, plateb, rezervací a administrace.

## 2. Značka a komunikace

- Doména: `tvujkarel.cz`; vlastnictví a dostupnost nejsou tímto dokumentem ověřeny.
- Zobrazovaný název: **Tvůj Karel**.
- Claim: **Když technika neposlouchá.**
- Hlavní vysvětlení služby: **Pomoc s počítačem a technikou přímo u vás v Praze.**
- Tón: lidský, klidný, srozumitelný; zákazníkovi vykat.
- Používat první osobu jednotného čísla. Nevyvolávat dojem call centra nebo týmu techniků.
- Karel je název značky. Skutečný poskytovatel se představuje jako Lukáš; nevytvářet fiktivní osobu Karla ani její reference.
- Neslibovat garantované vyřešení každého problému, okamžitý příjezd ani nepřetržitou dostupnost.

## 3. Rozsah služeb

| Oblast | Nabízený obsah |
| --- | --- |
| Počítače a notebooky | Nastavení nového PC, instalace a nastavení Windows a programů, aktualizace, uživatelské účty, řešení pomalého systému a softwarových problémů. |
| Wi-Fi a internet | Nastavení routeru, připojení zařízení, diagnostika slabého signálu, konfigurace mesh sítě. |
| Tiskárny a příslušenství | Instalace tiskárny, Wi-Fi tisk, skenování, připojení monitorů, webkamer a externích disků. |
| Data a zálohy | Přenos dostupných dat do nového počítače, automatické zálohování, OneDrive, Google Drive a organizace dokumentů. |
| E-mail a účty | Gmail, Outlook, synchronizace, nastavení účtů a zabezpečení. |
| Bezpečnost | Kontrola podezřelého chování, běžný malware, rozšíření prohlížeče, aktualizace a pomoc s rozpoznáním podvodných zpráv. |

Apple/macOS/iCloud a další chytrá zařízení přidat do veřejného obsahu pouze po potvrzení rozsahu zadavatelem. Implementace má umožnit zapnout tyto služby konfigurací.

**Fyzické opravy hardwaru se nenabízejí.** Neprezentovat pájení, výměny součástek, opravy mobilů ani profesionální obnovu dat z poškozených disků. V FAQ stručně vysvětlit, že při podezření na závadu hardwaru lze doporučit specializovaný servis.

## 4. Ceník a účtování

Ceny včetně DPH zobrazovat jako hlavní, dobře viditelné hodnoty. Ceny bez DPH uvést doplňkově. Výpočty vycházejí z dohodnuté sazby DPH 21 %.

| Položka | Včetně DPH | Bez DPH | Podmínky |
| --- | ---: | ---: | --- |
| Hodinová sazba | 1 452 Kč/h | 1 200 Kč/h | Pomoc na místě. |
| Krátký zásah do 30 minut | 726 Kč | 600 Kč | Pouze v blízkém okolí nebo po výslovné předchozí domluvě. |
| Každých dalších započatých 30 minut | 726 Kč | 600 Kč | Po úvodním účtovaném intervalu. |
| Doprava | Dle domluvy | Dle domluvy | V blízkém okolí zdarma; jinde se částka domluví před návštěvou. |

### Pravidla pro MVP

1. Běžný výjezd: minimální účtování jedna hodina, dále každá započatá půlhodina.
2. Předem domluvený krátký výjezd: minimální účtování půlhodina, dále každá započatá půlhodina.
3. Čas práce se počítá na místě; doprava se nepočítá do doby zásahu.
4. Doprava a případné další náklady se odsouhlasí předem. Žádné automatické zóny nebo skryté příplatky.
5. Cenu potřebných licencí či zařízení uvádět odděleně; nákup pouze po domluvě.

Příklady bez dopravy:

| Doba práce | Běžný výjezd s minimem 1 h | Předem domluvený krátký výjezd |
| --- | ---: | ---: |
| 20 minut | 1 452 Kč | 726 Kč |
| 45 minut | 1 452 Kč | 1 452 Kč |
| 60 minut | 1 452 Kč | 1 452 Kč |
| 80 minut | 2 178 Kč | 2 178 Kč |

Tato pravidla jsou implementační návrh sjednocující předchozí domluvu; zadavatel je potvrdí před spuštěním. Na webu nepoužívat samostatné „od 726 Kč“ bez vysvětlení podmínek krátkého zásahu.

## 5. Struktura a obsah hlavní stránky

Pořadí sekcí: hlavička → úvod → služby → postup → ceník → o mně → FAQ → kontakt → patička.

### 5.1 Hlavička

Textové logo Tvůj Karel, kotvy S čím pomohu / Jak to funguje / Ceník / O mně / Kontakt a výrazné tlačítko Zavolat. Na mobilu jednoduché přístupné menu.

### 5.2 Úvod

Nadpis H1: **Pomoc s počítačem a technikou přímo u vás v Praze**

Claim: **Když technika neposlouchá.**

Text:

> Nefunguje Wi-Fi, tiskárna nebo potřebujete nastavit nový notebook? Přijedu k vám domů nebo do kanceláře, pomohu s problémem a vše srozumitelně vysvětlím.

Primární tlačítko: **Zavolat**. Sekundární: **Popsat problém**, odkaz na formulář.

Cenový údaj: **1 452 Kč/h včetně DPH**; menší text „1 200 Kč bez DPH. Krátký zásah po domluvě za 726 Kč včetně DPH.“

Doplňkové body: Praha / Domácnosti i malé firmy / Cena a doprava domluvené předem.

### 5.3 S čím pomohu

Šest karet podle tabulky služeb. Každá obsahuje jednoduchou ikonu, název a nejvýše dvě krátké věty. Využít konkrétní problémy zákazníků, například „Tiskárna se nepřipojí k Wi-Fi“ nebo „Potřebuji přesunout fotografie do nového počítače“.

### 5.4 Jak to funguje

1. **Popíšete problém.** Zavoláte nebo napíšete, co nefunguje a kde v Praze jste.
2. **Domluvíme návštěvu.** Dohodneme termín, orientační rozsah práce a cenu dopravy.
3. **Přijedu a pomohu.** Problém prověřím, provedu domluvené nastavení a vysvětlím další postup.

### 5.5 Ceník

Zobrazit tabulku z oddílu 4, minimální účtování a podmínky krátkého zásahu. Tlačítko **Domluvit návštěvu** vede na kontakt. Neuvádět pevnou konečnou cenu složitějšího zásahu bez znalosti rozsahu.

### 5.6 O mně

Nadpis: **Za Tvým Karlem stojí Lukáš**

Návrh textu:

> Jmenuji se Lukáš Niedoba a pracuji jako programátor a IT specialista. Pod značkou Tvůj Karel pomáhám lidem a malým firmám v Praze s počítači a běžnou technikou. Záleží mi na tom, abyste rozuměli tomu, co dělám, a věděli předem, kolik bude pomoc stát.

Použít skutečnou fotografii zadavatele, pokud ji dodá. Jinak pracovat s typografií a ilustrací zařízení; žádná fotografie vydávaná za skutečného poskytovatele. Nevymýšlet roky praxe, certifikace ani počet zákazníků.

### 5.7 FAQ

- **Přijedete ke mně domů?** Ano, služba je určena pro domácnosti a malé kanceláře v Praze; konkrétní lokalitu a termín domluvíme předem.
- **Kolik zaplatím za krátkou návštěvu?** Běžný výjezd má minimum jednu hodinu. V blízkém okolí lze předem domluvit zásah do 30 minut za 726 Kč včetně DPH.
- **Je doprava v ceně?** V blízkém okolí zdarma, u ostatních výjezdů cenu sdělím před návštěvou.
- **Opravujete rozbité součástky?** Fyzické opravy hardwaru neposkytuji. Mohu pomoci určit další postup a doporučit servis.
- **Pomůžete i malé firmě?** Ano, s běžným nastavením počítačů, sítě, tiskáren, účtů a záloh.
- **Co když problém nepůjde vyřešit na místě?** Vysvětlím zjištění a doporučím další postup. Před návštěvou se domluvíme i na účtování diagnostiky.

### 5.8 Kontakt

Telefon jako klikatelné `tel:` číslo, e-mail jako `mailto:`, WhatsApp pouze pokud ho zadavatel potvrdí. Formulář podle oddílu 6. Uvést „Napište mi, co nefunguje. Ozvu se a domluvíme další postup.“ Bez neověřené garance času odpovědi.

### 5.9 Patička

Tvůj Karel — Lukáš Niedoba / IČO 06838103 / Plátce DPH / telefon / e-mail / sídlo a další identifikační údaje dodané zadavatelem. Odkaz na ochranu osobních údajů. DIČ nezískávat odhadem ani ho negenerovat z osobních údajů.

## 6. Kontaktní formulář

| Pole | Povinné | Požadavky |
| --- | --- | --- |
| Jméno | Ano | 2–100 znaků. |
| Telefon | Ano | Přijímat mezery a mezinárodní předvolbu; vyhnout se omezení pouze na česká čísla. |
| E-mail | Ne | Validace při vyplnění. |
| Kde v Praze jste | Ano | Část Prahy nebo orientační lokalita, 2–150 znaků; přesná adresa není potřeba. |
| S čím potřebujete pomoci | Ano | 10–3 000 znaků, víceřádkový vstup. |

Pod formulářem informační věta s odkazem: „Údaje použiji k vyřízení vašeho požadavku. Podrobnosti najdete v zásadách ochrany osobních údajů.“ Nevytvářet marketingový souhlas jako podmínku poptávky.

- Endpoint `POST /api/contact` nebo ekvivalent na zvoleném hostingu.
- Serverová validace všech vstupů; klientská validace pro pohodlí uživatele.
- Odeslat zprávu na nakonfigurovaný e-mail zadavatele přes transakční e-mailovou službu.
- Odesílatel je ověřená adresa domény; vyplněný e-mail uživatele lze použít jako Reply-To, nikoli jako From.
- Honeypot, omezení četnosti a maximální velikost požadavku; limity konfigurovat.
- Kontrolovat povolený origin, bezpečně zpracovat text a zabránit vkládání hlaviček e-mailu.
- Při odesílání zablokovat opakované kliknutí a ukázat stav.
- Úspěch zobrazit až po potvrzení přijetí e-mailovým poskytovatelem; netvrdit, že e-mail byl doručen do schránky.
- Úspěšná zpráva: „Děkuji, požadavek byl odeslán. Ozvu se a domluvíme další postup.“
- Při chybě zachovat vyplněná data, umožnit opakování a nabídnout telefon/e-mail.
- Žádné přílohy v MVP, žádné ukládání poptávek do databáze.
- Nelogovat celý obsah poptávek ani kontaktní údaje. Tajné klíče pouze na serveru.

## 7. Design a mobilní chování

Čistý, moderní a osobní styl. Světlé pozadí, tmavý dobře čitelný text a jeden výrazný akcent. Přátelskost vyjádřit typografií a jemnou ilustrací notebooku či Wi-Fi. Vyhnout se neonům, serverovým rackům a stock fotografiím operátorů.

- Mobile-first; ověřit šířky 360, 390, 768, 1 024 a 1 440 px.
- Přehledný obsah bez horizontálního posouvání.
- Na mobilu spodní panel **Zavolat / Napsat**; Napsat vede na formulář, případně na potvrzený WhatsApp.
- Panel nesmí překrývat obsah, formulář ani systémovou oblast telefonu; zohlednit safe-area.
- Výrazné ceny, dostatečné mezery a krátké odstavce.
- Viditelný focus, ovládání klávesnicí, správné labely a přístupné chybové zprávy.
- Kontrast na úrovni WCAG AA, dotykové cíle doporučeně alespoň 44 × 44 px.
- Respektovat `prefers-reduced-motion`; bez automatických carouselů a rušivých animací.
- Logo v SVG nebo jako kvalitní textový logotyp, ikony SVG.

## 8. Technologie a konfigurace

Preferovaný stack: **Astro + TypeScript**, staticky generovaná hlavní stránka, běžné CSS nebo Tailwind podle preference implementátora. WordPress nepoužívat. Formulář řešit malým serverless endpointem; nehydratovat celý web kvůli formuláři.

Hosting připravit jako přenositelný statický build. Výchozí návrh pro AWS: S3 + CloudFront pro web, API Gateway + Lambda pro formulář a SES pro e-mail. Finální hosting potvrdit se zadavatelem; nevytvářet placenou infrastrukturu automaticky.

Centrálně konfigurovat:

- název značky a canonical URL;
- telefon pro zobrazení a normalizovaný `tel:` odkaz;
- e-mail, případně WhatsApp;
- identifikační údaje, oblast působnosti a dostupnost;
- ceny, DPH, podmínky dopravy a minimální účtování;
- zapnutí Apple služeb a analytiky.

Serverové proměnné: příjemce poptávek, ověřený odesílatel, povolený origin a přístup k e-mailové službě. Dodat `.env.example` bez tajných hodnot. Použít podporované verze závislostí v době implementace a uložit lockfile.

## 9. SEO a výkon

Title: **Tvůj Karel | Pomoc s počítačem a technikou v Praze**

Meta description:

> Pomoc s počítačem, Wi-Fi a tiskárnou přímo u vás v Praze. Nastavení zařízení, přenos dat a zálohy. Hodinová sazba 1 452 Kč včetně DPH.

- Jedno H1, logická hierarchie nadpisů, `lang="cs"`.
- Canonical URL, Open Graph, favicon, sitemap a robots.txt.
- Strukturovaná data ProfessionalService/LocalBusiness pouze se skutečnými dodanými údaji; nevymýšlet adresu provozovny, otevírací dobu ani hodnocení.
- Přirozeně používat „pomoc s počítačem Praha“, „IT pomoc domů“, „nastavení Wi-Fi Praha“ a „instalace tiskárny Praha“.
- HTTPS, jednotná varianta domény a přesměrování ostatních variant.
- Náhledová prostředí neindexovat; při produkčním spuštění indexaci povolit.
- Obrázky WebP/AVIF, explicitní rozměry; hlavní obrázek nenačítat líně, ostatní podle potřeby.
- Fonty ideálně systémové nebo lokálně hostované; minimum klientského JavaScriptu.
- Cíl Lighthouse na produkčním buildu: Performance, Accessibility, Best Practices a SEO alespoň 95. Výsledky doložit; nejde o garanci reálné rychlosti na každém zařízení.

Google Business Profile je samostatný následný krok zadavatele; není součástí naprogramování webu.

## 10. Soukromí a měření

MVP bez marketingových trackerů a bez analytiky ve výchozím nastavení. Vytvořit stránku ochrany osobních údajů s údaji správce, účelem zpracování poptávek, používanými poskytovateli, dobou uchování a kontaktem. Konkrétní znění a nastavení uchování potvrdit se zadavatelem před spuštěním.

Pokud web nepoužívá cookies ani obdobné sledování, nevytvářet prázdnou cookie lištu nebo zbytečnou samostatnou stránku cookies. Při pozdějším zapnutí analytiky posoudit skutečné nastavení a odpovídajícím způsobem doplnit informování a případný souhlas.

Volitelně připravit vypnutou integraci Umami/Plausible. Události: kliknutí na telefon, kliknutí na WhatsApp a úspěšné odeslání formuláře. Nikdy neposílat do analytiky telefon, e-mail ani text poptávky. Nekvalifikovat tato doporučení jako hotové právní posouzení.

## 11. Co není součástí MVP

Online rezervace termínů, platby, zákaznický portál, CRM, CMS, blog, firemní paušály, vzdálená podpora, automatická cenová kalkulačka a recenze. Skutečné recenze lze přidat později; v první verzi nezobrazovat smyšlené reference.

## 12. Údaje k doplnění před spuštěním

- Telefon, kontaktní e-mail a příjemce formuláře.
- Potvrzení WhatsApp a rozsahu Apple služeb.
- Sídlo, případné další požadované identifikační údaje a fakturační údaje.
- Konkrétní definice blízkého okolí; preferované části Prahy.
- Potvrzení pravidel minimálního účtování, dopravy a placené diagnostiky.
- Reálná dostupnost; bez vyplnění neuvádět otevírací dobu.
- Fotografie a souhlas s jejím použitím, nebo schválení verze bez portrétu.
- Přístup k doméně/DNS a finální hosting.
- Nastavení odesílací domény, e-mailové služby a uchování poptávek.
- Schválení veřejných textů a ochrany osobních údajů.

Chybějící údaje v náhledu označit jako konfigurační placeholdery. Produkční kontrola musí odmítnout nasazení s falešným telefonem, nefunkčním příjemcem formuláře nebo ukázkovými identifikačními údaji. Náhled může fungovat bez odesílání, ale musí to zřetelně uvést a nesmí zobrazovat falešný úspěch.

## 13. Akceptační kritéria

- [ ] Všechny sekce a schválené texty jsou implementované v češtině.
- [ ] Značka Tvůj Karel a skutečný poskytovatel Lukáš Niedoba jsou srozumitelně odlišeni.
- [ ] Ceny s DPH, minimální účtování, krátký zásah a doprava jsou konzistentní ve všech sekcích.
- [ ] Web nenabízí fyzické opravy ani nepotvrzené služby.
- [ ] Telefon, e-mail, případně WhatsApp a všechny navigační odkazy fungují.
- [ ] Mobilní panel nepřekrývá obsah a web nemá horizontální scroll.
- [ ] Formulář funguje s validními vstupy a prokazatelně předá zprávu nakonfigurované službě.
- [ ] Ověřené jsou nevalidní vstupy, selhání e-mailové služby, omezení četnosti a opakované kliknutí.
- [ ] Při chybě zůstávají data formuláře zachována; úspěch se nezobrazuje předčasně.
- [ ] Web lze používat klávesnicí, má viditelný focus a přístupné formulářové chyby.
- [ ] SEO metadata, sitemap, robots.txt a strukturovaná data odpovídají skutečným údajům.
- [ ] Produkční build a kontrola TypeScriptu projdou; tajné hodnoty nejsou v repozitáři ani klientském buildu.
- [ ] Doložené Lighthouse měření a kontrola aktuálního Chrome, Safari a mobilního Safari/Chrome.
- [ ] Před spuštěním jsou doplněné kontakty, schválené texty a ověřené odesílání formuláře.

## 14. Předání

Dodat zdrojový repozitář, lockfile, `.env.example`, produkční build nebo reprodukovatelný postup sestavení a stručné README s příkazy pro instalaci, lokální spuštění, kontrolu a build. README má vysvětlit změnu cen, kontaktů a služeb, konfiguraci formuláře a nasazení na zvolený hosting.

Součástí předání je seznam použitých externích služeb a jejich případných provozních nákladů, výsledky ověření a seznam zbývajících údajů či omezení. Zadání samotné neautorizuje registraci domény, placené služby ani zveřejnění webu.
