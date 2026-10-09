# Lighthouse — místní statický build

Měření: 9. října 2026 v 20:19:59 SELČ. Lighthouse 13.5.0; Node v24.15.0.

Testovaný origin: `http://127.0.0.1:4322`. Každá kombinace jazyka a profilu má jeden samostatný běh na statickém výstupu Astra. Mobilní profil používá výchozí simulované omezení Lighthouse; desktop odpovídá jeho desktopovému presetu. Přesné metriky, nastavení a SHA-256 testovaných HTML jsou v sousedním JSON.

**Náhled zůstává neindexovaný.** Audit nemění HTML, meta robots, robots.txt ani aplikační konfiguraci. Nižší skóre SEO může být očekávaným důsledkem tohoto režimu. Cíl 95 pro produkční SEO vyžaduje nové měření po schváleném zapnutí indexace. Lokální měření neověřuje CDN, skutečný mobilní hardware, Safari ani reálné provozní podmínky.

| Jazyk | Profil  | Performance | Accessibility | Best Practices | SEO |   FCP |   LCP |  TBT |   CLS |
| ----- | ------- | ----------: | ------------: | -------------: | --: | ----: | ----: | ---: | ----: |
| cs    | mobile  |          96 |           100 |            100 |  69 | 1.8 s | 2.5 s | 0 ms |     0 |
| en    | mobile  |          96 |           100 |            100 |  69 | 1.8 s | 2.5 s | 0 ms |     0 |
| ru    | mobile  |          96 |           100 |            100 |  69 | 1.7 s | 2.7 s | 0 ms |     0 |
| cs    | desktop |         100 |           100 |            100 |  69 | 0.4 s | 0.6 s | 0 ms | 0.001 |

Cíl alespoň 95 pro Performance, Accessibility a Best Practices: **splněn ve všech 4 bězích**.

## Nálezy

### cs / mobile

- `first-contentful-paint`: First Contentful Paint — 1.8 s.
- `largest-contentful-paint`: Largest Contentful Paint — 2.5 s.
- `is-crawlable`: Page is blocked from indexing.
- `image-delivery-insight`: Improve image delivery — Est savings of 140 KiB.
  - Prvek: `section#o-znacce > div.container > div.about-visual > img`.
  - Prvek: `ol.steps > li > div.step-photo > img`.
  - Prvek: `div.container > div.hero-visual > picture.hero-picture > img.hero-image`.
  - Prvek: `ol.steps > li > div.step-photo > img`.
  - Prvek: `ol.steps > li > div.step-photo > img`.
  - Prvek: `div.container > div.services-grid > article.service > img`.
  - Prvek: `div.container > div.services-grid > article.service > img`.
  - Prvek: `div.container > div.services-grid > article.service > img`.
- `network-dependency-tree-insight`: Network dependency tree.

### en / mobile

- `first-contentful-paint`: First Contentful Paint — 1.8 s.
- `largest-contentful-paint`: Largest Contentful Paint — 2.5 s.
- `is-crawlable`: Page is blocked from indexing.
- `image-delivery-insight`: Improve image delivery — Est savings of 140 KiB.
  - Prvek: `section#o-znacce > div.container > div.about-visual > img`.
  - Prvek: `ol.steps > li > div.step-photo > img`.
  - Prvek: `div.container > div.hero-visual > picture.hero-picture > img.hero-image`.
  - Prvek: `ol.steps > li > div.step-photo > img`.
  - Prvek: `ol.steps > li > div.step-photo > img`.
  - Prvek: `div.container > div.services-grid > article.service > img`.
  - Prvek: `div.container > div.services-grid > article.service > img`.
  - Prvek: `div.container > div.services-grid > article.service > img`.
- `network-dependency-tree-insight`: Network dependency tree.

### ru / mobile

- `first-contentful-paint`: First Contentful Paint — 1.7 s.
- `largest-contentful-paint`: Largest Contentful Paint — 2.7 s.
- `is-crawlable`: Page is blocked from indexing.
- `image-delivery-insight`: Improve image delivery — Est savings of 140 KiB.
  - Prvek: `section#o-znacce > div.container > div.about-visual > img`.
  - Prvek: `ol.steps > li > div.step-photo > img`.
  - Prvek: `div.container > div.hero-visual > picture.hero-picture > img.hero-image`.
  - Prvek: `ol.steps > li > div.step-photo > img`.
  - Prvek: `ol.steps > li > div.step-photo > img`.
  - Prvek: `div.container > div.services-grid > article.service > img`.
  - Prvek: `div.container > div.services-grid > article.service > img`.
  - Prvek: `div.container > div.services-grid > article.service > img`.
- `network-dependency-tree-insight`: Network dependency tree.

### cs / desktop

- `largest-contentful-paint`: Largest Contentful Paint — 0.6 s.
- `is-crawlable`: Page is blocked from indexing.
- `image-delivery-insight`: Improve image delivery — Est savings of 97 KiB.
  - Prvek: `div.container > div.hero-visual > div.printer-inset > img`.
  - Prvek: `ol.steps > li > div.step-photo > img`.
  - Prvek: `ol.steps > li > div.step-photo > img`.
  - Prvek: `ol.steps > li > div.step-photo > img`.
  - Prvek: `div.container > div.services-grid > article.service > img`.
  - Prvek: `div.container > div.services-grid > article.service > img`.
  - Prvek: `div.container > div.services-grid > article.service > img`.
  - Prvek: `div.container > div.services-grid > article.service > img`.
- `network-dependency-tree-insight`: Network dependency tree.

## Opakování

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4322
# V druhém terminálu:
node scripts/audit-lighthouse.mjs --url http://127.0.0.1:4322 --desktop-locales cs
```

Během měření omezte souběžné zátěžové testy. Skóre výkonu se může mezi běhy lišit; výsledky jsou laboratorní měření, nikoli garance rychlosti. Žádný formulář nebyl v tomto auditu odeslán.
