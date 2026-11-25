# demo-wcag-audyt – audyt dostępności WCAG 2.1 AA

> **DEMO / portfolio (2026).** Narzędzie i przykładowe raporty przygotowane przez Isvero Studio na **własnych serwisach demonstracyjnych** z fikcyjnymi danymi. Nie są to audyty wykonane dla klientów ani referencje.

**Demo na żywo:** https://demo-audyt.isverostudio.com (noindex)

Repozytorium pokazuje, jak prowadzę audyt dostępności stron i aplikacji podmiotów publicznych zgodnie z WCAG 2.1 AA (ustawa z 4 kwietnia 2019 r. o dostępności cyfrowej, norma EN 301 549):

1. **Część automatyczna** (`audyt/audyt.mjs`) – powtarzalny test każdej strony z listy, uruchamiany lokalnie albo w GitHub Actions.
2. **Ocena ręczna** – [lista kontrolna 50 kryteriów](checklista/WCAG21AA.md) z opisem, co i jak sprawdzić.
3. **Raport po polsku** (`audyt/raport.mjs`) – HTML (sam spełnia WCAG 2.1 AA) i Markdown, z wynikiem dla każdego kryterium sukcesu.
4. **Test po poprawkach** – ten sam test po naprawie, porównanie „przed” i „po”.

## Co sprawdza test automatyczny

| Kryterium | Jak |
|---|---|
| reguły axe-core dla WCAG 2.0/2.1 A i AA | każda strona w widoku 1280 px i 320 px (emulacja telefonu), opisy reguł po polsku |
| 1.4.10 Dopasowanie do ekranu | brak przewijania w poziomie przy 320 px |
| 1.4.4 Zmiana rozmiaru tekstu | układ przy szerokości 640 px (powiększenie 200%) |
| 1.4.12 Odstępy w tekście | wstrzyknięcie odstępów z kryterium i wyszukanie uciętej treści |
| 2.4.1 Pominięcie bloków | czy pierwszy element fokusu to działający link „Przejdź do treści” |
| 2.4.7 Widoczny fokus | przejście klawiszem Tab i porównanie stylu elementu z fokusem i bez |
| 2.1.2 Bez pułapki na klawiaturę | czy fokus nie utyka na jednym elemencie |
| 1.2.x Multimedia | wykrycie wideo/audio – gdy brak, kryteria oznaczane „nie dotyczy” |
| Lighthouse (opcjonalnie) | wydajność, dostępność, dobre praktyki, SEO dla strony głównej (profil telefonu) |

Pozostałe kryteria raport oznacza jako „do oceny ręcznej” albo „potwierdzić ręcznie”. Test automatyczny nie zastępuje audytora – wykrywa tylko część problemów.

## Wyniki na demach portfolio (25.11.2026)

Badane serwisy demonstracyjne (osobne repozytoria): WordPress (serwis gminy, BIP, szkoły i biblioteki), ASP.NET Core + MS SQL (rejestr pism), Next.js (portal e-usług) i Next.js + Stripe (sklep). Razem 24 strony, każda w dwóch szerokościach ekranu.

| Serwis | Przed poprawkami | Po poprawkach | Lighthouse dostępność / wydajność |
|---|---|---|---|
| WordPress – serwis gminy | 0 naruszeń | 0 naruszeń | 100 / 100 |
| ASP.NET Core – rejestr pism | 4 naruszenia (strona 404 bez `<title>` i `lang`) | 0 naruszeń | 100 / 100 |
| Next.js – portal e-usług | 0 naruszeń | 0 naruszeń | 100 / 99 |
| Next.js – sklep | 0 naruszeń | 0 naruszeń | 100 / 99 |

Raporty: [`raporty/2026-11-25-dema-przed-poprawkami`](raporty/2026-11-25-dema-przed-poprawkami/podsumowanie.md) i [`raporty/2026-11-25-dema-po-poprawkach`](raporty/2026-11-25-dema-po-poprawkach/podsumowanie.md). Poprawka w rejestrze pism: strona błędu z pełnym układem dla odpowiedzi 404 (poza `/api`) i dwa nowe testy integracyjne.

## Uruchomienie

Wymagania: Node.js 20+.

```bash
npm ci
npx playwright install --with-deps chromium

# 1. lista serwisów i stron – zob. konfiguracje/przyklad.json
npm run audyt -- konfiguracje/dema-serwer.json raporty/2026-12-01-dema --lighthouse
# 2. raport HTML + Markdown (opcjonalnie z ocenami ręcznymi)
npm run raport -- raporty/2026-12-01-dema [oceny-reczne.json]
# 3. strona główna z listą raportów i lista kontrolna
npm run checklista
# testy narzędzia (strona z celowymi błędami i strona poprawna)
npm test
```

Oceny ręczne można dołączyć jako plik JSON: `{ "<nazwa serwisu>": { "1.3.2": { "wynik": "zgodne", "uwagi": "…" } } }` – raport połączy je z wynikami automatycznymi.

## GitHub Actions

- `ci.yml` – testy narzędzia, generowanie raportów, budowa obrazu.
- `audyt.yml` – audyt wdrożonych dem co poniedziałek oraz na żądanie (`workflow_dispatch` z wyborem konfiguracji). Raport trafia do artefaktu przebiegu i podsumowania zadania.
- `deploy.yml` – wdrożenie strony z raportami jako osobnej aplikacji Coolify (nginx, statyczne pliki; wymaga sekretu `COOLIFY_TOKEN`).

## Struktura

```
audyt/        audyt.mjs (testy), raport.mjs (HTML + MD), checklista.mjs, wcag.mjs (50 kryteriów), styl.css
konfiguracje/ listy serwisów i stron do badania
checklista/   WCAG21AA.md – lista kontrolna audytu ręcznego
szablony/     raport-audytu.md – struktura raportu końcowego
raporty/      wygenerowane raporty (serwowane przez nginx)
tests/        testy narzędzia na stronach z błędami i bez
www/          konfiguracja nginx (nagłówki bezpieczeństwa, noindex)
```

## Licencja

MIT – zob. [LICENSE](LICENSE).
