# Lokální ověření

Ověřeno 9. října 2026 nad statickým buildem dokončeným v 20:21:08 (Europe/Prague), dostupným na `http://127.0.0.1:4322`. Reprodukční příkazy jsou v kořenovém README.

| Kontrola                                                     | Výsledek                                                  |
| ------------------------------------------------------------ | --------------------------------------------------------- |
| `npm run check`                                              | 0 chyb, 0 varování, 0 hints                               |
| `npm run check:translations`                                 | CS/EN/RU: 240 klíčů a kontrola struktury                  |
| `npm test`                                                   | 23 testů prošlo                                           |
| `npm run build`                                              | Statický build prošel, 10 HTML stránek + robots a sitemap |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:4322 npm run test:e2e` | 200 testů prošlo v Chromiu a WebKitu za 21,6 s            |
| Vizuální porovnání                                           | `design-qa.md`: passed, oba nalezené P2 problémy opravené |
| Konzole lokálního náhledu v Codex browseru                   | Žádné zaznamenané chyby ani varování                      |

Testy API pokrývají validaci a zachování původního UTF-8 textu, velikost požadavku, honeypot, zakázané hlavičkové znaky, origin, omezení četnosti, odpovědi poskytovatele, absenci osobních údajů v logování, Lambda adaptér i skutečný lokální vývojový a náhledový server. Routování ověřuje HTTP 308, lokalizované HTTP 404, HEAD a API na stejné doméně.

Prohlížečové testy pokrývají hlavní stránku i soukromí ve všech třech jazycích, obou barevných režimech a šířkách 360, 390, 768, 1024 a 1440 px. Ověřují metadata, jazykové odkazy, horizontální přetečení, obrázky, automatizovanou přístupnost axe, ovládání klávesnicí, FAQ, mobilní navigaci a spodní kontaktní panel. Kontroly formuláře zahrnují nevalidní vstupy, zpožděné přijetí, zamčení polí a duplicitního odeslání, serverovou validaci, chyby poskytovatele, 429, síťovou chybu a zachování údajů. Formulář bez JavaScriptu upozorní na jeho potřebu a osobní údaje neposílá v URL.

Úspěch formuláře je testován kontrolovanou náhradou transportu; reálný náhledový endpoint vrací `PREVIEW_DISABLED`. Do SES ani skutečné e-mailové schránky nebyla odeslána zpráva. Přímý produkční build s chybějící konfigurací je záměrně odmítnutý.

Výkon a podmínky jeho měření zachycuje [Lighthouse report](lighthouse.md). Automatizovaný WebKit není ověření konkrétního Safari ani skutečného iPhonu. DNS, AWS, živé doručení a nasazení jsou podle pokynu zadavatele odložené.
