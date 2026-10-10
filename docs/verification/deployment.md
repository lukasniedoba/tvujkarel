# Nasazení náhledu

Ověřeno 2026-10-10T16:53:29.656Z přes veřejné rekurzivní DNS (Cloudflare/Google), s plným ověřením HTTPS certifikátu. Veřejná URL: [tvujkarel.cz](https://tvujkarel.cz).

- Hosting účet: 541855874226; stack TvujKarelHosting: UPDATE_COMPLETE.
- DNS účet: 890192513455; stack TvujKarelDns: CREATE_COMPLETE.
- CloudFront: E1E93PUWVCJ4ZL, dr0yt09z2gh0y.cloudfront.net, Deployed.
- S3: tvujkarelhosting-website32962d0b-bn3azma5kc57, privátní OAC origin, verzování a šifrování.
- ACM: apex + www, ISSUED v us-east-1.
- Náhled: noindex/nofollow; CONTACT_MODE=disabled; Lambda nemá SES oprávnění.
- AWS Budget: 5 USD/měsíc, upozornění při 80 % a 100 %; nejde o tvrdý strop.
- SNS odběr provozních alarmů: potvrzený a ověřený přes AWS API. API 5xx alarm má pro náhled vypnuté akce, protože validní náhledový formulář záměrně vrací 503.
- Log retention: 14 dní pro Lambda, API i deployment helper.
- Lokální kontroly: 25 testů prošlo; Astro check bez chyb, warnings a hints; build a CDK synth prošly.
- Stažená LIVE CloudFront funkce má shodný SHA-256 se zdrojem `infra/edge.js`: `36162ac72bd61195d278ea16489f65fec355361f78ed36c45cc2b0fd5f63550f`. Rozdíl Unicode v přísném CloudFormation diffu je artefakt načtené šablony; živý kód i ruská 404 zachovávají cyrilici.
- Původní deployment používal tehdy necommitnuté lokální změny nad Git HEAD 58ab01d. Zachovaný release manifest dokumentuje tento stav v okamžiku deploye. První běh CI není součástí tohoto dokladu.
- GitHub environment `production` je po výslovném schválení uživatelem nastavený a zpětně ověřený přes API 10. 10. 2026 v 19:03 CEST: pouze větev `main`, povinný reviewer `lukasniedoba`, secrets `CONTACT_ORIGIN_TOKEN` a `ALERT_EMAIL`, variables `CERTIFICATE_ARN` a `MONTHLY_BUDGET_USD=5`. Hodnoty secrets se při ověřování nezobrazovaly. Workflow je součástí zdrojů a první CI běh zatím neproběhl.
- Rollback assembly: /Users/lukasniedoba/projects/tvujkarelcz/.deployment/releases/2026-10-10T16-46-45.158Z/cdk.out. Postup návratu je připravený; živý návrat na předchozí release se neprováděl.

## Živé kontroly

23 kontrol. HTML všech šesti obsahových stránek má shodný SHA-256 s lokálním buildem. Formulářové testy používají syntetická data, vrací PREVIEW_DISABLED a nic neodesílají. Přímý API požadavek bez origin tokenu je odmítnutý.

| Metoda | URL/cesta                               | HTTP |
| ------ | --------------------------------------- | ---- |
| GET    | /?ref=deploy&v=%D0%B0                   | 308  |
| GET    | https://www.tvujkarel.cz/en/?ref=deploy | 308  |
| GET    | http://tvujkarel.cz/cs/                 | 301  |
| GET    | /cs                                     | 308  |
| GET    | /cs/                                    | 200  |
| GET    | /cs/privacy/                            | 200  |
| GET    | /cs/missing                             | 404  |
| GET    | /en                                     | 308  |
| GET    | /en/                                    | 200  |
| GET    | /en/privacy/                            | 200  |
| GET    | /en/missing                             | 404  |
| GET    | /ru                                     | 308  |
| GET    | /ru/                                    | 200  |
| GET    | /ru/privacy/                            | 200  |
| GET    | /ru/missing                             | 404  |
| GET    | /de/                                    | 404  |
| GET    | /images/missing.webp                    | 404  |
| HEAD   | /ru/missing                             | 404  |
| GET    | /robots.txt                             | 200  |
| GET    | /sitemap.xml                            | 200  |
| POST   | /api/contact                            | 503  |
| POST   | /api/contact                            | 503  |
| POST   | direct API                              | 403  |

## DNS migrace

Přímý náhled [dr0yt09z2gh0y.cloudfront.net/cs/](https://dr0yt09z2gh0y.cloudfront.net/cs/) byl následně ověřený přes HTTPS s odpovědí 200. `dig` již vracel CloudFront adresy přes lokální resolver i Cloudflare/Google, zatímco systémové překládání názvu používané `curl` ještě vracelo chybu rozlišení domény. Rozdíl potvrzuje, že cache jednotlivých resolverů mohou dobíhat různě.

Nová zóna je autoritativní a veřejný resolver Cloudflare vrací novou distribuci. Lokální resolver během ověřování držel původní NS delegaci a negativní cache. Pro přechod jsou proto stejná čtyři A/AAAA aliasová webová DNS záznamy i ve staré zóně; jejich změna `C01944112Q2FYOI5XFVKT` má stav `INSYNC`. Stará zóna se neodstraňovala a její NS zůstávají zachované. Již uložené negativní odpovědi musí v jednotlivých resolverech doběhnout. Úklid původní zóny je možný nejdříve 12. 10. 2026 po 18:15 CEST a po novém ověření delegace.

## Zbývající spuštění

Plná indexovaná produkce vyžaduje skutečné kontakty, sídlo, poskytovatele schránky, pravidla uchování, schválení textů/překladů/obrázků a ověřené SES doručení. Náhledová kontrola nenahrazuje test odesílání ani soukromí.
