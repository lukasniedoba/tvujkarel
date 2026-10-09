# Zadání úpravy referenčních vizuálů

Datum: 9. 10. 2026. Nástroj: vestavěný ImageGen. Úprava schváleného vizuálního směru podle zpětné vazby uživatele; nejde o nové varianty designu.

## Světlý režim

Výstup: `reference/light-mode.png`.

```text
Use case: text-localization, precise UI edit.
Asset type: approved Czech landing-page visual reference, LIGHT MODE.
Edit target: attached light-mode reference. Revise ONLY the specific text areas below, keeping the exact Organic Editorial design, cream paper grain, forest green serif headings and wordmark, terracotta hand-drawn notes, header placement, buttons, daylight laptop/router/printer photos, curved image masks, service illustrations, and section geometry. Preserve the same 1189 x 1323 px canvas and aspect ratio. Create a production-quality UI reference, with sharp readable Czech typography.

User feedback: the site is the BRAND "Tvůj Karel", not a personal portfolio of Lukáš. Prices belong in the dedicated Ceník section further down the page, outside this cropped reference.

Changes:
1. In the header replace "S čím pomohu" with "Služby" and replace "O mně" with "O značce". Keep "Jak to funguje", "Ceník", "Kontakt" and the moon toggle.
2. Keep the hero heading exactly "Pomoc s počítačem a technikou přímo u vás v Praze". Replace hero body with this exact text:
"Nefunguje Wi-Fi, tiskárna nebo potřebujete nastavit nový notebook? Tvůj Karel pomůže s technikou u vás doma i v kanceláři. Srozumitelně a bez zbytečných starostí."
3. REMOVE entirely the big "1 452 Kč/h včetně DPH" price and the whole small line about 1 200 Kč / 726 Kč. No monetary amount or VAT wording anywhere in this visible frame. Keep the two CTA buttons "Zavolat" and "Popsat problém". Move the small factual line upward to sit about 40 px below the buttons, leaving natural breathing room. Exact factual line: "Praha · Domácnosti i malé firmy · Srozumitelná cena před návštěvou". Keep hero photos and hero section bottom unchanged.
4. In the tinted middle banner, replace "Za Tvým Karlem stojí Lukáš" with this two-line heading in the same serif style, sized to fit the existing left column:
"Technika v klidu.
Bez zbytečných starostí."
Replace the entire personal introduction beneath it with:
"Běžná technika by měla usnadňovat den. Tvůj Karel pomůže s nastavením, připojením i zálohami. Srozumitelně a bez zbytečných složitostí."
Fit this within the SAME existing banner height and left column with readable spacing. Keep the closed laptop photo, books, greenery, warm lighting, and handwritten "Stejná technika. Klidnější den." note unchanged on the right.
5. Replace the lower service-section heading "S čím pomohu" with "S čím pomůže Tvůj Karel". Preserve all six existing service entries, images and descriptions.

Constraints: do not invent people, testimonials, team members, badges, metrics, extra cards or content; no founder name or "Jmenuji se" anywhere in this frame. Do not add a new pricing block into the crop. Change no photography, brand mark or palette. This is one light-mode screen, not a split comparison.
```

## Tmavý režim

Výstup: `reference/dark-mode.png`. První vstup je upravený světlý režim; druhý vstup je původní tmavá reference pro zachování barev.

```text
Use case: style-transfer, precise UI theme edit.
Asset type: approved Czech landing-page visual reference, DARK MODE.
Input 1 is the EDIT TARGET: the newly revised LIGHT screen, with brand-focused copy, no hero price and a new brand banner.
Input 2 is a COLOR REFERENCE ONLY: the older approved DARK screen. Do not copy any older pricing or founder text from input 2.

Create a single dark counterpart to input 1 at exactly 1189 x 1323 px with the same aspect ratio. Keep EVERY line of Czech copy, position, section height, text wrapping, photos and photo masks, device illustrations, header links, typography and spacing from input 1. Only change interface colors to match input 2 and replace the moon with the sun toggle in the upper-right. Match the Organic Editorial visual style faithfully. Deep forest background #13251E, subtle middle brand-band background #1D3228, warm ivory #F4EBDD headings and logo, readable body #D0D9CE, sage #B7D2B4 primary button with deep forest text and phone icon, sage outline on secondary button, apricot #E4A07B handwritten notes, muted moss #3B5142 pads behind six service illustrations. Photographs stay the SAME naturally lit daytime photographs with unchanged subjects, crops and exposure; do not turn them into night scenes.

Critical text/content invariants from input 1:
- Header: "Služby", "Jak to funguje", "Ceník", "O značce", "Kontakt".
- No monetary amounts, no hourly price, no "DPH" or short-visit pricing in this visible crop. Pricing exists offscreen in Ceník.
- Hero paragraph verbatim: "Nefunguje Wi-Fi, tiskárna nebo potřebujete nastavit nový notebook? Tvůj Karel pomůže s technikou u vás doma i v kanceláři. Srozumitelně a bez zbytečných starostí."
- CTA "Zavolat", "Popsat problém".
- Factual strip below CTA "Praha · Domácnosti i malé firmy · Srozumitelná cena před návštěvou".
- Middle two-line heading "Technika v klidu." / "Bez zbytečných starostí."
- Middle paragraph: "Běžná technika by měla usnadňovat den. Tvůj Karel pomůže s nastavením, připojením i zálohami. Srozumitelně a bez zbytečných složitostí."
- Services title "S čím pomůže Tvůj Karel", keep all existing six service names and descriptions.
- No Lukáš, no founder medallion, no "Jmenuji se", no invented people, testimonials, badges or extra features.
This is one dark-mode screen, not a split comparison.
```
