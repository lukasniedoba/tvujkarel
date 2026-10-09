# Referenční vizuál Tvůj Karel

Schválený vizuální směr: **Organic Editorial**, světlý a tmavý režim.
Schváleno 7. 10. 2026. Funkční rozsah a obsah webu určuje [zadání webu](../../TvujKarel_zadani_webu.md).

Úprava 9. 10. 2026 podle zpětné vazby: cenové údaje jsou pouze v sekci Ceník; osobní medailonek nahradil blok o značce **Tvůj Karel**.

## Světlý režim

Krémové pozadí, lesní zelená, terakotové ruční poznámky a teplé fotografie techniky.
Ikona měsíce vpravo v hlavičce představuje přepnutí do tmavého režimu.

![Referenční vizuál světlého režimu](reference/light-mode.png)

## Tmavý režim

Hluboké zelené pozadí, teplý světlý text a šalvějové hlavní tlačítko.
Ikona slunce vpravo v hlavičce představuje přepnutí do světlého režimu.

![Referenční vizuál tmavého režimu](reference/dark-mode.png)

## Další sekce

Doplněno 9. 10. 2026: zbývající sekce hlavní stránky ve stejném vizuálním směru. [Celý přehled s náhledy](sections.md) a [prompty pro generování](section-prompts.md).

| Sekce | Světlý režim | Tmavý režim |
| --- | --- | --- |
| Jak to funguje | [PNG](reference/sections/how-it-works-light.png) | [PNG](reference/sections/how-it-works-dark.png) |
| Ceník | [PNG](reference/sections/pricing-light.png) | [PNG](reference/sections/pricing-dark.png) |
| Časté otázky | [PNG](reference/sections/faq-light.png) | [PNG](reference/sections/faq-dark.png) |
| Kontakt a formulář | [PNG](reference/sections/contact-light.png) | [PNG](reference/sections/contact-dark.png) |
| Patička | [PNG](reference/sections/footer-light.png) | [PNG](reference/sections/footer-dark.png) |

## Pokyny pro implementaci

- Zachovat rozložení, typografii, organické výřezy fotografií a přátelský tón vybraného návrhu.
- Oba režimy mají stejné rozložení, obsah a fotografie; mění se barvy rozhraní a ikona přepínače.
- Úvod věnovat službě a hlavním akcím **Zavolat / Popsat problém**. Hodinovou sazbu, minimální cenu, výjezd, DPH a podmínky účtování zobrazit v sekci **Ceník**, dostupné z hlavičky.
- Osobní představení nahradit blokem **Technika v klidu. Bez zbytečných starostí.** o značce Tvůj Karel. Navigace používá **O značce** a **Služby**; nadpis služeb je **S čím pomůže Tvůj Karel**.
- Texty formulovat za značku, bez osobního medailonku či portrétu. Jméno skutečného poskytovatele zůstává v identifikačních údajích podle zadání.
- Služby zobrazovat jako přehledné položky na společné ploše, bez samostatných velkých karet.
- Typografický směr: Fraunces pro výrazné nadpisy a Manrope pro běžný text a ovládací prvky.
- První verze webu obsahuje češtinu, angličtinu a ruštinu včetně přepínače **Čeština / English / Русский**. České texty v referenčních obrázcích jsou výchozí verzí; rozložení musí pojmout delší překlady v obou režimech.
- U použitých fontů a řezů ověřit českou diakritiku i cyrilici; pro ruštinu případně zvolit odpovídající font, který zachová typografický styl návrhu.
- Při implementaci ověřit kontrast, ovládání klávesnicí a mobilní rozložení v obou režimech.

PNG soubory jsou návrhy vytvořené pomocí vestavěného ImageGen; [zadání úpravy úvodní reference](revision-prompts.md) je uložené pro dohledatelnost. Slouží jako vizuální reference; veřejné texty a rozsah služeb mají odpovídat zadání webu. Úvod a jednotlivé další sekce skládat jako jeden web. Jazykový přepínač, překlady a mobilní rozložení doplnit podle zadání.
