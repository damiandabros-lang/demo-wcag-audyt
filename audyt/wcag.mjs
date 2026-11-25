// Kryteria sukcesu WCAG 2.1 poziom A i AA (50) – nazwy wg polskiego tłumaczenia W3C.
// metoda: "auto" – w dużej mierze wykrywane automatycznie, "czesciowo" – automat wykrywa część problemów,
//         "recznie" – wymaga oceny człowieka.
export const KRYTERIA = [
  ['1.1.1', 'A', 'Treść nietekstowa', 'czesciowo'],
  ['1.2.1', 'A', 'Tylko audio lub tylko wideo (nagranie)', 'recznie'],
  ['1.2.2', 'A', 'Napisy rozszerzone (nagranie)', 'recznie'],
  ['1.2.3', 'A', 'Audiodeskrypcja lub alternatywa tekstowa dla mediów (nagranie)', 'recznie'],
  ['1.2.4', 'AA', 'Napisy rozszerzone (na żywo)', 'recznie'],
  ['1.2.5', 'AA', 'Audiodeskrypcja (nagranie)', 'recznie'],
  ['1.3.1', 'A', 'Informacje i relacje', 'czesciowo'],
  ['1.3.2', 'A', 'Zrozumiała kolejność', 'recznie'],
  ['1.3.3', 'A', 'Właściwości zmysłowe', 'recznie'],
  ['1.3.4', 'AA', 'Orientacja', 'czesciowo'],
  ['1.3.5', 'AA', 'Określenie pożądanej wartości', 'czesciowo'],
  ['1.4.1', 'A', 'Użycie koloru', 'czesciowo'],
  ['1.4.2', 'A', 'Kontrola odtwarzania dźwięku', 'czesciowo'],
  ['1.4.3', 'AA', 'Kontrast (minimum)', 'auto'],
  ['1.4.4', 'AA', 'Zmiana rozmiaru tekstu', 'czesciowo'],
  ['1.4.5', 'AA', 'Obrazy tekstu', 'recznie'],
  ['1.4.10', 'AA', 'Dopasowanie do ekranu', 'czesciowo'],
  ['1.4.11', 'AA', 'Kontrast elementów nietekstowych', 'recznie'],
  ['1.4.12', 'AA', 'Odstępy w tekście', 'czesciowo'],
  ['1.4.13', 'AA', 'Treści spod kursora lub fokusu', 'recznie'],
  ['2.1.1', 'A', 'Klawiatura', 'czesciowo'],
  ['2.1.2', 'A', 'Bez pułapki na klawiaturę', 'czesciowo'],
  ['2.1.4', 'A', 'Jednoznakowe skróty klawiaturowe', 'recznie'],
  ['2.2.1', 'A', 'Dostosowanie czasu', 'czesciowo'],
  ['2.2.2', 'A', 'Pauza, zatrzymanie, ukrycie', 'czesciowo'],
  ['2.3.1', 'A', 'Trzy błyski lub wartości poniżej progu', 'recznie'],
  ['2.4.1', 'A', 'Możliwość pominięcia bloków', 'czesciowo'],
  ['2.4.2', 'A', 'Tytuł strony', 'auto'],
  ['2.4.3', 'A', 'Kolejność fokusu', 'czesciowo'],
  ['2.4.4', 'A', 'Cel linku (w kontekście)', 'czesciowo'],
  ['2.4.5', 'AA', 'Wiele dróg', 'recznie'],
  ['2.4.6', 'AA', 'Nagłówki i etykiety', 'recznie'],
  ['2.4.7', 'AA', 'Widoczny fokus', 'czesciowo'],
  ['2.5.1', 'A', 'Gesty dotykowe', 'recznie'],
  ['2.5.2', 'A', 'Rezygnacja ze wskazania', 'recznie'],
  ['2.5.3', 'A', 'Etykieta w nazwie', 'czesciowo'],
  ['2.5.4', 'A', 'Aktywowanie ruchem', 'recznie'],
  ['3.1.1', 'A', 'Język strony', 'auto'],
  ['3.1.2', 'AA', 'Język części', 'czesciowo'],
  ['3.2.1', 'A', 'Po otrzymaniu fokusu', 'recznie'],
  ['3.2.2', 'A', 'Podczas wprowadzania danych', 'recznie'],
  ['3.2.3', 'AA', 'Spójna nawigacja', 'recznie'],
  ['3.2.4', 'AA', 'Spójna identyfikacja', 'recznie'],
  ['3.3.1', 'A', 'Identyfikacja błędu', 'recznie'],
  ['3.3.2', 'A', 'Etykiety lub instrukcje', 'czesciowo'],
  ['3.3.3', 'AA', 'Sugestie korekty błędów', 'recznie'],
  ['3.3.4', 'AA', 'Zapobieganie błędom (prawnym, finansowym, w danych)', 'recznie'],
  ['4.1.1', 'A', 'Poprawność kodu', 'czesciowo'],
  ['4.1.2', 'A', 'Nazwa, rola, wartość', 'czesciowo'],
  ['4.1.3', 'AA', 'Komunikaty o stanie', 'czesciowo'],
].map(([id, poziom, nazwa, metoda]) => ({ id, poziom, nazwa, metoda }));

export const PO_ID = Object.fromEntries(KRYTERIA.map((k) => [k.id, k]));

/** Zamienia tag axe-core (np. "wcag1410") na numer kryterium ("1.4.10"). */
export function kryteriumZTagu(tag) {
  const m = /^wcag(\d)(\d)(\d{1,2})$/.exec(tag);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : null;
}

/** Kryteria WCAG przypisane do reguły axe (na podstawie jej tagów). */
export function kryteriaReguly(tags = []) {
  return [...new Set(tags.map(kryteriumZTagu).filter((id) => id && PO_ID[id]))];
}

export const WPLYW = { critical: 'krytyczny', serious: 'poważny', moderate: 'umiarkowany', minor: 'drobny' };
