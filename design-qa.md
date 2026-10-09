# Vizuální QA — Tvůj Karel

Kontrola lokální implementace dne 9. října 2026. Funkční rozsah a texty určuje `TvujKarel_zadani_webu.md`; vizuální směr určují `docs/design/README.md`, `docs/design/sections.md` a uvedené PNG. Nasazení není součástí této kontroly.

**Findings**

Po druhém nezávislém vizuálním porovnání nezůstává žádný otevřený P0/P1/P2 nález. Oba následující P2 nálezy jsou opravené a uzavřené.

- **[P2, opraveno] Světlé podklady ikon v tmavém režimu.** V `docs/design/reference/dark-mode.png` mají všechny položky služeb tlumené zelené podklady. První `docs/verification/desktop-dark.png` zachytil šest kontrastních krémových podkladů. Ty vytvářejí jiný vizuální důraz než reference. Oprava: v tmavém režimu zelené podklady a odpovídající zelený podklad obrázku routeru. Použit `public/images/service-wifi-dark.webp` (256 × 256, 6 772 B), editace stejného routeru pouze se změnou pozadí. Nové `docs/verification/services-dark.png` bylo otevřeno společně s tmavou referencí: všech šest podkladů je tlumeně zelených, bez světlého routerového disku. Nález uzavřen.
- **[P2, opraveno] Poznámka u kontaktu překrývá detailní fotografii.** V první `docs/verification/contact-desktop.png` dolní řádky „Začíná to jednou zprávou.“ zasahují do tmavé fotografie Prahy. V `docs/design/reference/sections/contact-light.png` je poznámka na čisté světlé ploše a je čitelná. Oprava: podklad `var(--bg)` s drobným vnitřním odsazením nebo přesun celé poznámky nad fotografii. Nová verze `docs/verification/contact-desktop.png` byla otevřena společně s referencí: celá poznámka má souvislý krémový podklad a všechny tři řádky jsou čitelné. Nález uzavřen.

**Srovnávací evidence a normalizace**

- Hlavní reference: `docs/design/reference/light-mode.png` a `dark-mode.png`, obě **1189 × 1323 px**.
- Desktopová implementace: `docs/verification/desktop-light.png` a `desktop-dark.png`, obě **1189 × 1323 px**; CSS viewport **1189 × 1323**, DPR **1**. Reference a implementace byly otevřeny společně v jednom porovnávacím vstupu. Žádná hustotní korekce není potřeba.
- Nové cílené důkazy druhé iterace: `docs/verification/services-dark.png` a obnovené `contact-desktop.png`, **1189 × 1323 px**, stejné CSS rozměry a DPR 1. `desktop-dark.png` byl také obnoven. Původní verze stejnojmenných souborů byly nahrazeny; první nálezy zůstávají popsané v historii této kontroly.
- Celá stránka: `docs/verification/full-light.png`, **1189 × 5904 px**, finální browserový screenshot stejné české světlé stránky z lokálního statického buildu dokončeného ve 20:21:08 dne 9. října 2026. Byl obnoven po obou vizuálních opravách a znovu otevřen společně s hlavní referencí i aktualizovaným desktopovým screenshotem. Detail kontaktu byl z aktuálního celku dodatečně zkontrolován v původním měřítku (x=0, y=4308, w=1189, h=1070) společně s kontaktní referencí; čitelná poznámka je součástí finálního celku. Celkový zmenšený náhled sloužil pouze k hodnocení pořadí a rytmu sekcí. Detaily byly následně čteny ve výřezech v původním měřítku, nikoli ze zmenšeného dlouhého náhledu.
- Detail ceníku: `docs/design/reference/sections/pricing-light.png` (**1442 × 1091**) společně s `docs/verification/pricing-desktop.png` (**1189 × 1323**).
- Detail kontaktu: `docs/design/reference/sections/contact-light.png` (**1442 × 1091**) společně s `docs/verification/contact-desktop.png` (**1189 × 1323**).
- Postup: `docs/design/reference/sections/how-it-works-light.png` (**1612 × 976**) společně s výřezem první verze celého screenshotu (1189 × 5879), x=0, y=1534, w=1189, h=815.
- FAQ: `docs/design/reference/sections/faq-light.png` (**1529 × 1029**) společně s výřezem první verze celého screenshotu (1189 × 5879), x=0, y=3450, w=1189, h=833. První odpověď je v obou stavech otevřená.
- Patička: `docs/design/reference/sections/footer-light.png` (**1897 × 829**) společně s výřezem první verze celého screenshotu (1189 × 5879), x=0, y=5353, w=1189, h=526.
- Mobilní implementace: `docs/verification/mobile-ru-light.png` a `mobile-ru-dark.png`, obě **390 × 844 px**, CSS viewport **390 × 844**, DPR **1**. Otevřeny ve stejném porovnávacím vstupu s příslušnou hlavní referencí. Mobilní mockup neexistuje; kontroluje se proto zachování vizuálního směru a responzivní použitelnost, nikoli shoda desktopových souřadnic.
- Mobilní kontakt a formulář: `docs/verification/mobile-ru-contact-dark.png` a `mobile-ru-form-dark.png`, **390 × 844 px**, CSS **390 × 844**, DPR **1**. Otevřeny společně s `docs/design/reference/sections/contact-dark.png` (**1442 × 1091**). Kontrola potvrzuje čitelné cyrilické popisky, jednoznačné oddělení kontaktu a formuláře, jednosloupcová pole uvnitř viewportu a dostupný spodní kontaktní panel. Snímek zachycuje průběžnou pozici scrollu, nikoli celý formulář nebo otevřenou softwarovou klávesnici.
- Samostatné sekční mockupy mají různé rozměry a typografické měřítko. Podle `docs/design/sections.md` se při skládání používá jednotný kontejner a typografická škála hlavního návrhu. Přirozené rozměry samostatných PNG proto nejsou požadavkem na přesnou CSS výšku, velikost nadpisů ani počet viditelných sekcí.

**Pět povinných ploch věrnosti**

1. **Fonty a typografie:** Fraunces/Manrope zachovávají kontrast výrazných serifových nadpisů a klidného bezserifového textu; Caveat odpovídá ručním poznámkám. Hlavní nadpis má na kontrolovaném desktopu tři řádky, blok o značce dva. Česká diakritika je čistá. Ruský mobilní nadpis používá stylově odpovídající Lora, cyrilice se vykresluje bez zjevného náhradního řezu. V zachycených stavech není ořez ani kolize textu. Navigace, doprovodný text a podrobnosti formuláře jsou o něco kompaktnější než rasterizované předlohy; odpovídá to společné typografické škále, delším textům ze zadání a přidaným funkcím.
2. **Rozestupy a rytmus:** Pořadí všech osmi hlavních oblastí souhlasí. Hero zachovává levou textovou polovinu, pravou fotografii a překrývající se tiskárnu; následuje nízký horizontální blok o značce. Služby jsou na společné ploše bez velkých karet. Postup má tři obrazové sloupce, ceník otevřenou tabulku, FAQ dva sloupce a formulář oddělený jemnou svislou linkou. Na mobilu zůstávají ovládací prvky i jazykový přepínač uvnitř viewportu. Povinné rozšíření hlavičky o jazykové odkazy a tlačítko Zavolat zvyšuje její výšku; nejde o nechtěný posun obsahu.
3. **Barvy a vizuální tokeny:** Světlý režim drží krémovou, tmavě zelenou, teplou terakotu a jemné dělicí linky. Tmavý režim zachovává hlubokou zelenou, teplý světlý text a šalvějová CTA. Fotografie se přepnutím režimu nemění. Krémové podklady ikon služeb z první kontroly byly nahrazeny tlumenou zelenou — ověřeno novým společným porovnáním s referencí. Rozdíl v intenzitě papírové textury původních generovaných mockupů je přijatelný.
4. **Obrazový materiál:** Nově generované fotografie dodržují stejný námět, přirozené teplé světlo, pracovní stůl, notebook, rostliny a pražské prostředí. Neobsahují portrét, smyšleného Karla ani přidaná firemní loga. Organické výřezy, tiskárnový detail, fotografie postupu a šest rastrových ilustrací jsou zachovány. Na kontrolovaných snímcích není patrný rozpad komprese ani hrubé škálování. Poznámka u kontaktu je po opravě čitelná na klidném podkladu; menší službové ilustrace jsou P3 níže.
5. **Text a obsah:** Hlavní sdělení, nabídka služeb, pořadí kroků a šest FAQ zachovávají zadání. Hlavní ceny 1 452 / 390 / 690 Kč, doplňkové ceny bez DPH a příklad 1 116 / 1 842 Kč odpovídají zadání. Úvod neobsahuje ceníkové částky. Delší úplné podmínky pod tabulkou mají přednost před zkráceným mockupem. Formulář obsahuje pět očekávaných polí, nepovinný e-mail, nápovědy, soukromí a jasné upozornění na lokální náhled. Chybějící produkční kontakty jsou přiznané konfigurační placeholdery, nikoli vydávané za funkční kontakty. Významová úplnost všech překladů není odvozována pouze ze screenshotů.

**Historie porovnání**

1. Před nezávislou kontrolou hlavní implementace opravila čtyřřádkové hero a příliš vysoký blok o značce. Dostupné desktopové snímky již zachycují třířádkové hero a přibližně 250px blok o značce. Původní stav zde není vydáván za nezávisle znovu ověřenou iteraci.
2. První nezávislé porovnání uvedených zdrojů a browserových screenshotů nalezlo dva P2 rozdíly: tmavé podklady ikon a poznámku v kontaktní fotografii. Nálezy byly předány hlavní implementaci a první výsledek byl zablokovaný.
3. Druhé nezávislé porovnání otevřelo tmavou referenci společně s novým `services-dark.png` a kontaktní referenci společně s novým `contact-desktop.png`. Oprava podkladů ikon i čitelnosti poznámky je viditelně potvrzena; oba P2 nálezy uzavřeny. Dodatečné mobilní kontaktní snímky byly porovnány s tmavou kontaktní referencí. Nové P0/P1/P2 rozdíly nenalezeny. Výsledek vizuální kontroly je passed.
4. Závěrečné obnovení evidence: aktuální `desktop-light.png` (1189 × 1323) a `full-light.png` (1189 × 5904) z finálního statického buildu byly znovu vizuálně přečteny. Finální detail kontaktu potvrzuje opravu přímo v celostránkovém screenshotu. Nové substantivní rozdíly nenalezeny.

**Závěrečné funkční kontroly hlavní implementace**

Následující výsledky poskytla hlavní implementace ze skutečného závěrečného běhu; jde o oddělenou testovací evidenci, nikoli testy znovu spuštěné tímto nezávislým vizuálním review. Rozsah testů byl ověřen v `tests/e2e/site.spec.ts`, `tests/contact.test.ts`, `tests/contact-adapters.test.ts` a `tests/routing.test.ts`.

- **200 E2E testů prošlo** proti statickému náhledu na portu 4322, prohlížeče **Chromium a WebKit**. Kontroly zahrnují jazyky a kotvy, oba režimy, přetečení na stanovených šířkách, přístupnost, klávesnicové menu a FAQ, uvolnění mobilního panelu při focusu pole, lokalizovanou validaci, čekání na přijetí požadavku, blokování dvojího odeslání, Unicode a locale, chyby/retry/zachování dat a HTTP směrování.
- **23 unit/API/routing testů prošlo**, včetně validace, bezpečně vypnutého náhledu, adaptérů, přijetí od poskytovatele a skutečného lokálního směrování.
- Projektová kontrola: **0 errors, 0 warnings, 0 hints**.
- Závěrečná kontrola konzole v in-app browseru hlavní implementací: **error/warn logs = []**.
- WebKit v automatickém běhu neznamená ověření skutečného mobilního Safari ani klávesnice konkrétního iPhonu.

**Open Questions / hranice evidence**

- Mobilní mockup nebyl dodán. Mobilní rozložení se posuzuje jako adaptace; z mobilního hero nelze tvrdit, že byl vizuálně ověřen celý formulář nebo konec stránky.
- Mobilní kontakt a většina formulářových polí byly dodatečně vizuálně ověřeny. Konec formuláře, aktivní softwarová klávesnice a skutečný iOS viewport nejsou v těchto statických snímcích zachyceny; jejich použitelnost nelze odvodit z jedné průběžné pozice scrollu.
- Interakce, focus, formulářové stavy, širší breakpointy a konzolové chyby byly ověřeny hlavní implementací v prohlížeči a automatických testech; skutečné závěrečné výsledky jsou odděleně zaznamenány výše. Tento nezávislý vizuální report je nevydává za vlastní znovu provedené úkony.
- Není ověřen živý telefonát, produkční doručení přes SES, nasazení, doména ani skutečný Safari/iOS hardware. To nejsou tvrzené výsledky tohoto lokálního vizuálního QA.

**Implementation Checklist**

- [x] Nasadit tlumené zelené podklady služeb v tmavém režimu a variantu routeru; znovu zachytit a společně s referencí porovnat.
- [x] Umístit kontaktní poznámku na klidný podklad; znovu zachytit a společně s referencí porovnat.
- [x] Vizuálně ověřit mobilní kontaktní formulář a spodní panel v browserových screenshotech; otevřená softwarová klávesnice zůstává explicitní hranicí této evidence.
- [x] Porovnat celou stránku a čitelné detaily ceníku, postupu, FAQ, kontaktu a patičky.
- [x] Explicitně projít typografii, prostorový rytmus, barvy, obrazy a texty.

**Follow-up Polish**

- **[P3] Velikost ilustrací služeb:** kolem šířky 1189 px mají obrázky přibližně 85 px, zatímco hlavní reference dává ilustracím přibližně 120–130 px. Současná volba ponechává prostor delšímu skutečnému textu a zůstává čitelná. Případné zvýšení na 96–104 px lze posoudit při další vizuální iteraci; není potřeba vracet zkrácený obsah mockupu.
- **[P3] Ruční poznámky:** implementace nepřenáší všechny drobné podtržené poznámky a šipky z generovaných předloh. Tón a ruční písmo jsou zachované; chybějící čistě dekorativní tahy nejsou funkčním ani kompozičním blokátorem.

final result: passed
