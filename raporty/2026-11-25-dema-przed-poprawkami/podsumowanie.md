# Audyt dostępności dem portfolio Isvero Studio – przed poprawkami

> **DEMO** – przykładowy raport z 2026 r. na własnych serwisach demonstracyjnych Isvero Studio. Nie jest to audyt wykonany dla klienta.

Data badania: 25 listopada 2026 16:01 · WCAG 2.1 AA · axe-core 4.10.2

| Serwis | Technologia | Strony | Naruszenia axe | Niezgodne | Ostrzeżenia | Do oceny ręcznej | Lighthouse (dostępność / wydajność) |
|---|---|---|---|---|---|---|---|
| Serwis gminy, BIP, szkoły i biblioteki | WordPress 7 + MariaDB | 10 | 0 | 0 | 0 | 19 | 100 / 100 |
| Elektroniczny rejestr pism (kancelaria) | ASP.NET Core 8 + MS SQL Server | 4 | 4 | 2 | 2 | 19 | 100 / 100 |
| Portal e-usług urzędu | Next.js 15 + TypeScript | 6 | 0 | 0 | 0 | 19 | 100 / 99 |
| Sklep internetowy z płatnościami | Next.js 15 + Stripe (tryb testowy) | 4 | 0 | 0 | 0 | 19 | 100 / 99 |

## Elektroniczny rejestr pism (kancelaria)

- **2.1.1 Klawiatura** (Ostrzeżenie):
  - `/strona-ktorej-nie-ma`: Klawisz Tab nie przenosi fokusu na żaden element
- **2.4.1 Możliwość pominięcia bloków** (Ostrzeżenie):
  - `/strona-ktorej-nie-ma`: Pierwszy element fokusu nie jest linkiem pomijającym (sprawdzić punkty orientacyjne i nagłówki)
- **2.4.2 Tytuł strony** (Niezgodne):
  - `/strona-ktorej-nie-ma`: Dokumenty muszą mieć element <title> pomagający w nawigacji. (1280 px, 1 el.)
  - `/strona-ktorej-nie-ma`: Dokumenty muszą mieć element <title> pomagający w nawigacji. (320 px, 1 el.)
- **3.1.1 Język strony** (Niezgodne):
  - `/strona-ktorej-nie-ma`: Element <html> musi mieć atrybut lang. (1280 px, 1 el.)
  - `/strona-ktorej-nie-ma`: Element <html> musi mieć atrybut lang. (320 px, 1 el.)

Pełny raport: `index.html` w tym katalogu. Surowe dane: `wyniki.json`.
