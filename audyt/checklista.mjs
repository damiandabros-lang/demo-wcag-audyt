#!/usr/bin/env node
// Tworzy listę kontrolną audytu ręcznego (Markdown + HTML) oraz stronę główną z listą raportów.
// Użycie: node audyt/checklista.mjs
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { KRYTERIA } from './wcag.mjs';

const JAK = {
  '1.1.1': 'Każdy obraz informacyjny ma trafny tekst alternatywny, dekoracyjny – pusty alt. Ikony-przyciski mają nazwę dostępną. CAPTCHA ma alternatywę.',
  '1.2.1': 'Nagrania tylko audio mają transkrypcję, a tylko wideo – opis tekstowy lub ścieżkę audio.',
  '1.2.2': 'Filmy z dźwiękiem mają napisy (z opisem dźwięków), zsynchronizowane i poprawne.',
  '1.2.3': 'Filmy mają audiodeskrypcję albo pełną alternatywę tekstową.',
  '1.2.4': 'Transmisje na żywo (np. sesje rady) mają napisy na żywo.',
  '1.2.5': 'Nagrane filmy mają audiodeskrypcję, gdy obraz niesie informacje niedostępne w dźwięku.',
  '1.3.1': 'Nagłówki, listy, tabele (th, scope, caption), etykiety pól i grupy (fieldset/legend) są w kodzie, nie tylko wizualnie.',
  '1.3.2': 'Kolejność czytania w czytniku ekranu (NVDA/VoiceOver) zgadza się z sensem treści.',
  '1.3.3': 'Instrukcje nie opierają się wyłącznie na kształcie, położeniu, kolorze ani dźwięku („kliknij zielony przycisk po prawej”).',
  '1.3.4': 'Serwis działa w orientacji pionowej i poziomej na telefonie.',
  '1.3.5': 'Pola danych osobowych mają poprawny atrybut autocomplete (name, email, tel, address-line1…).',
  '1.4.1': 'Kolor nie jest jedynym nośnikiem informacji (linki w tekście podkreślone, błędy opisane słowami).',
  '1.4.2': 'Dźwięk odtwarzany automatycznie dłużej niż 3 s można zatrzymać lub wyciszyć.',
  '1.4.3': 'Kontrast tekstu co najmniej 4,5:1 (duży tekst 3:1), także na zdjęciach, w stanach hover i w trybie kontrastu.',
  '1.4.4': 'Powiększenie przeglądarki do 200% nie ucina treści ani funkcji.',
  '1.4.5': 'Tekst jest tekstem, nie grafiką (wyjątek: logo). Plakaty i ogłoszenia jako obrazy mają pełną treść obok.',
  '1.4.10': 'Przy szerokości 320 px (powiększenie 400%) nie ma przewijania w dwóch kierunkach; tabele danych mogą się przewijać.',
  '1.4.11': 'Granice pól, ikony i stany fokusu mają kontrast co najmniej 3:1 z tłem.',
  '1.4.12': 'Zwiększenie interlinii, odstępów liter, słów i akapitów nie ucina ani nie nakłada tekstu.',
  '1.4.13': 'Podpowiedzi i menu wysuwane po najechaniu lub fokusie można zamknąć klawiszem Esc, najechać na nie i nie znikają same.',
  '2.1.1': 'Wszystkie funkcje (menu, formularze, mapy, galerie, kalendarze) działają z samej klawiatury.',
  '2.1.2': 'Z każdego elementu (okna modalne, odtwarzacze, osadzone mapy) da się wyjść klawiaturą.',
  '2.1.4': 'Skróty jednoklawiszowe można wyłączyć, zmienić lub działają tylko przy fokusie.',
  '2.2.1': 'Limity czasu (np. wylogowanie, sesja formularza) można wyłączyć, wydłużyć lub ostrzega się o nich.',
  '2.2.2': 'Karuzele, animacje i przewijane paski aktualności można zatrzymać.',
  '2.3.1': 'Brak treści migających częściej niż 3 razy na sekundę.',
  '2.4.1': 'Jest link „Przejdź do treści” oraz punkty orientacyjne (header, nav, main, footer).',
  '2.4.2': 'Każda strona ma unikalny, opisowy tytuł (strona – sekcja – instytucja).',
  '2.4.3': 'Kolejność fokusu jest logiczna; po otwarciu okna modalnego fokus trafia do okna i wraca po zamknięciu.',
  '2.4.4': 'Cel każdego linku wynika z jego treści lub kontekstu (bez samych „więcej”, „kliknij tutaj”). Linki do plików podają format i rozmiar.',
  '2.4.5': 'Do stron można dotrzeć co najmniej dwiema drogami: menu, wyszukiwarka, mapa strony.',
  '2.4.6': 'Nagłówki i etykiety opisują treść i cel.',
  '2.4.7': 'Fokus klawiatury jest zawsze wyraźnie widoczny.',
  '2.5.1': 'Funkcje wymagające gestów wielopunktowych lub ścieżki (przesunięcie mapy) mają alternatywę z jednym dotknięciem (przyciski).',
  '2.5.2': 'Akcja wykonuje się po zwolnieniu, nie po naciśnięciu; można ją anulować.',
  '2.5.3': 'Nazwa dostępna przycisku zawiera jego widoczny tekst (sterowanie głosem).',
  '2.5.4': 'Funkcje uruchamiane ruchem urządzenia mają alternatywę i można je wyłączyć.',
  '3.1.1': 'Atrybut lang strony jest poprawny (pl).',
  '3.1.2': 'Fragmenty w innym języku (np. wersja angielska, cytaty) mają własny atrybut lang.',
  '3.2.1': 'Fokus na elemencie nie powoduje nieoczekiwanej zmiany kontekstu.',
  '3.2.2': 'Zmiana wartości pola (np. lista wyboru) nie przenosi na inną stronę bez ostrzeżenia.',
  '3.2.3': 'Nawigacja jest w tym samym miejscu i kolejności na wszystkich stronach.',
  '3.2.4': 'Te same funkcje mają te same nazwy i ikony w całym serwisie.',
  '3.3.1': 'Błędy w formularzach są opisane tekstem i wskazują pole; fokus trafia do podsumowania błędów.',
  '3.3.2': 'Każde pole ma widoczną etykietę; wymagane pola i format danych są opisane.',
  '3.3.3': 'Komunikat błędu podpowiada, jak go poprawić (np. „PESEL ma 11 cyfr”).',
  '3.3.4': 'Przed wysłaniem wniosku lub płatności można sprawdzić i poprawić dane albo cofnąć operację.',
  '4.1.1': 'Kod HTML nie ma zduplikowanych identyfikatorów ani błędów zagnieżdżenia wpływających na technologie wspomagające.',
  '4.1.2': 'Kontrolki własne (menu rozwijane, zakładki, przełączniki) mają poprawną rolę, nazwę i stan (aria-expanded, aria-pressed).',
  '4.1.3': 'Komunikaty o stanie (dodano do koszyka, wysłano formularz, wyniki wyszukiwania) są ogłaszane przez aria-live/role=status bez przenoszenia fokusu.',
};
const METODA = { auto: 'automat (axe) + przegląd', czesciowo: 'automat częściowo + ręcznie', recznie: 'ręcznie' };

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Markdown
const md = [
  '# Lista kontrolna audytu dostępności – WCAG 2.1 AA',
  '',
  'Wszystkie 50 kryteriów sukcesu poziomu A i AA, wymaganych ustawą z 4 kwietnia 2019 r. o dostępności cyfrowej stron internetowych i aplikacji mobilnych podmiotów publicznych (norma EN 301 549).',
  '',
  'Kolumna „Metoda” mówi, co da się sprawdzić automatycznie (`npm run audyt`), a co wymaga oceny audytora. Narzędzia ręczne: sama klawiatura, NVDA + Firefox/Chrome, VoiceOver (macOS, iOS), TalkBack, Colour Contrast Analyser, powiększenie przeglądarki 200% i 400%.',
  '',
  '| Kryterium | Poziom | Metoda | Co sprawdzamy | Wynik | Uwagi |',
  '|---|---|---|---|---|---|',
  ...KRYTERIA.map((k) => `| ${k.id} ${k.nazwa} | ${k.poziom} | ${METODA[k.metoda]} | ${JAK[k.id]} | ☐ | |`),
  '',
].join('\n');
await writeFile(path.join(root, 'checklista', 'WCAG21AA.md'), md);

// Lista raportów
const katalogi = [];
for (const d of (await readdir(path.join(root, 'raporty'))).sort().reverse()) {
  const p = path.join(root, 'raporty', d);
  if ((await stat(p)).isDirectory()) {
    try {
      const w = JSON.parse(await readFile(path.join(p, 'wyniki.json'), 'utf8'));
      katalogi.push({ d, nazwa: w.nazwa, data: w.data, serwisy: w.serwisy.length, strony: w.serwisy.reduce((n, s) => n + s.strony.length, 0) });
    } catch {
      /* katalog bez wyników */
    }
  }
}

const css = await readFile(path.join(root, 'audyt', 'styl.css'), 'utf8');
const szkielet = (tytul, tresc) => `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="Audyt dostępności WCAG 2.1 AA – metodyka, lista kontrolna i przykładowe raporty (DEMO, 2026).">
<title>${esc(tytul)} – audyt WCAG (DEMO)</title>
<style>${css}</style>
</head>
<body>
<a class="skip" href="#tresc">Przejdź do treści</a>
<div class="demo" role="note"><strong>DEMO</strong> – narzędzie i przykładowe raporty Isvero Studio z 2026 r., wykonane na własnych serwisach demonstracyjnych. Nie są to audyty wykonane dla klientów.</div>
<header class="top"><nav aria-label="Główna"><a href="./">Raporty</a> · <a href="checklista.html">Lista kontrolna</a></nav></header>
<main id="tresc" tabindex="-1">
${tresc}
</main>
<footer><p>Isvero Studio · <code>demo-wcag-audyt</code> (2026) · licencja MIT</p></footer>
</body>
</html>
`;

await writeFile(
  path.join(root, 'raporty', 'index.html'),
  szkielet(
    'Audyt dostępności WCAG 2.1 AA',
    `<h1>Audyt dostępności WCAG 2.1 AA</h1>
<p>Narzędzie do automatycznej części audytu dostępności stron i aplikacji internetowych oraz lista kontrolna do oceny ręcznej. Raporty są generowane w języku polskim i odwołują się do kryteriów sukcesu WCAG 2.1 wymaganych od podmiotów publicznych.</p>
<h2>Jak wygląda audyt</h2>
<ol>
<li><strong>Test automatyczny</strong> – axe-core na każdej stronie w dwóch szerokościach ekranu, dopasowanie do ekranu 320 px, powiększenie 200%, odstępy w tekście, przejście klawiaturą (link pomijający, widoczny fokus, pułapki), Lighthouse.</li>
<li><strong>Ocena ręczna</strong> – wszystkie 50 kryteriów sukcesu WCAG 2.1 na poziomach A i AA według <a href="checklista.html">listy kontrolnej</a> i metodyki WCAG-EM (test automatyczny wspiera tylko część z nich): sama klawiatura, czytniki ekranu NVDA i VoiceOver, kontrast elementów nietekstowych, formularze i komunikaty o błędach, treść dokumentów.</li>
<li><strong>Raport i zalecenia</strong> – lista niezgodności z priorytetem, wskazaniem miejsca i sposobem naprawy; projekt deklaracji dostępności.</li>
<li><strong>Test po poprawkach</strong> – ponowny audyt zmienionych stron; test automatyczny może działać przy każdej zmianie w serwisie (GitHub Actions).</li>
</ol>
<h2>Przykładowe raporty</h2>
<p class="uwaga">Raporty „przed poprawkami” i „po poprawkach” z 25 listopada 2026 obejmują lokalne wersje czterech aplikacji: samorządu (WordPress), rejestru pism, e-urzędu i sklepu. Biblioteka Drupal oraz ta strona z raportami nie należały do tamtej próby. To zapis konkretnego badania, a nie aktualna ocena wszystkich publicznych wdrożeń.</p>
${katalogi.length ? `<ul>${katalogi.map((k) => `<li><a href="${esc(k.d)}/">${esc(k.nazwa)}</a> – ${esc(new Date(k.data).toLocaleDateString('pl-PL', { timeZone: 'Europe/Warsaw', dateStyle: 'long' }))}, liczba serwisów: ${k.serwisy}, liczba stron: ${k.strony}</li>`).join('')}</ul>` : '<p>Brak raportów.</p>'}`,
  ),
);

await writeFile(
  path.join(root, 'raporty', 'checklista.html'),
  szkielet(
    'Lista kontrolna WCAG 2.1 AA',
    `<h1>Lista kontrolna audytu – WCAG 2.1 AA</h1>
<p>Wszystkie 50 kryteriów sukcesu poziomu A i AA. Kolumna „Metoda” wskazuje, co sprawdza test automatyczny, a co wymaga oceny audytora.</p>
<div class="table-wrap" tabindex="0" role="region" aria-label="Lista kontrolna WCAG 2.1 AA"><table><caption class="meta">50 kryteriów sukcesu WCAG 2.1, poziom A i AA</caption>
<thead><tr><th scope="col">Kryterium</th><th scope="col">Poziom</th><th scope="col">Metoda</th><th scope="col">Co sprawdzamy</th></tr></thead>
<tbody>${KRYTERIA.map((k) => `<tr><th scope="row">${k.id} ${esc(k.nazwa)}</th><td>${k.poziom}</td><td>${METODA[k.metoda]}</td><td>${esc(JAK[k.id])}</td></tr>`).join('')}</tbody></table></div>`,
  ),
);
console.log(`[checklista] checklista/WCAG21AA.md, raporty/index.html, raporty/checklista.html (${katalogi.length} raportów)`);
