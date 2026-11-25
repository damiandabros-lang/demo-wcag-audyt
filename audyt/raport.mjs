#!/usr/bin/env node
// Tworzy raport audytu (HTML + Markdown) z pliku wyniki.json.
// Użycie: node audyt/raport.mjs <katalog-wyników> [oceny-reczne.json]
// Oceny ręczne (opcjonalnie): { "<nazwa serwisu>": { "1.3.2": { "wynik": "zgodne", "uwagi": "..." } } }
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { KRYTERIA, WPLYW } from './wcag.mjs';

const [dir, ocenyPath] = process.argv.slice(2);
if (!dir) {
  console.error('Użycie: node audyt/raport.mjs <katalog-wyników> [oceny-reczne.json]');
  process.exit(2);
}
const w = JSON.parse(await readFile(path.join(dir, 'wyniki.json'), 'utf8'));
const oceny = ocenyPath ? JSON.parse(await readFile(ocenyPath, 'utf8')) : {};
// Polskie opisy reguł axe-core (także dla wyników zapisanych bez lokalizacji).
const require = createRequire(import.meta.url);
const axePl = JSON.parse(await readFile(require.resolve('axe-core/locales/pl.json'), 'utf8')).rules || {};
for (const s of w.serwisy) for (const p of s.strony) for (const a of [p.axeDesktop, p.axeMobile]) for (const v of a?.naruszenia || []) if (axePl[v.id]?.help) v.opis = axePl[v.id].help;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const dataPl = new Date(w.data).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw', dateStyle: 'long', timeStyle: 'short' });

export const STATUS = {
  niezgodne: { etykieta: 'Niezgodne', klasa: 'st-blad' },
  ostrzezenie: { etykieta: 'Ostrzeżenie', klasa: 'st-ostrz' },
  zgodne: { etykieta: 'Zgodne (ocena ręczna)', klasa: 'st-ok' },
  auto: { etykieta: 'Brak wykrytych problemów', klasa: 'st-ok' },
  czesciowo: { etykieta: 'Brak problemów w testach automatycznych – potwierdzić ręcznie', klasa: 'st-cz' },
  recznie: { etykieta: 'Do oceny ręcznej', klasa: 'st-r' },
  nd: { etykieta: 'Nie dotyczy', klasa: 'st-nd' },
};

/** Ocena kryteriów dla jednego serwisu. */
function ocenSerwis(s) {
  const problemy = Object.fromEntries(KRYTERIA.map((k) => [k.id, []]));
  const dodaj = (id, strona, opis, poziom = 'niezgodne') => problemy[id].push({ strona, opis, poziom });
  for (const p of s.strony) {
    if (p.blad) continue;
    for (const [widok, a] of [['1280 px', p.axeDesktop], ['320 px', p.axeMobile]]) {
      for (const v of a.naruszenia) for (const id of v.kryteria) dodaj(id, p.sciezka, `${v.opis} (${widok}, ${v.liczba} el.)`);
    }
    if (!p.reflow320) dodaj('1.4.10', p.sciezka, 'Przewijanie w poziomie przy szerokości 320 px');
    if (!p.zoom200) dodaj('1.4.4', p.sciezka, 'Przewijanie w poziomie przy powiększeniu 200% (640 px)');
    if (p.odstepy.liczba || p.odstepy.przewijaniePoziome) dodaj('1.4.12', p.sciezka, `Ucięta treść po zwiększeniu odstępów: ${p.odstepy.uciete.join(', ') || 'przewijanie w poziomie'}`);
    if (!p.klawiatura.linkPomijajacy) dodaj('2.4.1', p.sciezka, 'Pierwszy element fokusu nie jest linkiem pomijającym (sprawdzić punkty orientacyjne i nagłówki)', 'ostrzezenie');
    if (p.klawiatura.bezWidocznegoFokusu.length) dodaj('2.4.7', p.sciezka, `Brak widocznego fokusu: ${p.klawiatura.bezWidocznegoFokusu.join('; ')}`);
    if (p.klawiatura.pulapka) dodaj('2.1.2', p.sciezka, 'Fokus utknął na jednym elemencie (możliwa pułapka klawiatury)');
    if (p.klawiatura.przejsc === 0) dodaj('2.1.1', p.sciezka, 'Klawisz Tab nie przenosi fokusu na żaden element', 'ostrzezenie');
  }
  const r = oceny[s.nazwa] || {};
  return KRYTERIA.map((k) => {
    const lista = problemy[k.id];
    let status;
    if (lista.some((x) => x.poziom === 'niezgodne')) status = 'niezgodne';
    else if (r[k.id]?.wynik === 'niezgodne') status = 'niezgodne';
    else if (lista.length) status = 'ostrzezenie';
    else if (r[k.id]?.wynik === 'zgodne') status = 'zgodne';
    else if (r[k.id]?.wynik === 'nie dotyczy') status = 'nd';
    else if (k.id.startsWith('1.2.') && s.multimedia === 0) status = 'nd';
    else status = k.metoda;
    return { ...k, status, problemy: lista, uwagi: r[k.id]?.uwagi || (status === 'nd' && k.id.startsWith('1.2.') ? 'Brak multimediów na badanych stronach' : '') };
  });
}

const serwisy = w.serwisy.map((s) => {
  const kryteria = ocenSerwis(s);
  const licz = (st) => kryteria.filter((k) => k.status === st).length;
  const naruszeniaAxe = s.strony.reduce((n, p) => n + (p.blad ? 0 : p.axeDesktop.naruszenia.length + p.axeMobile.naruszenia.length), 0);
  return { ...s, kryteria, naruszeniaAxe, podsum: { niezgodne: licz('niezgodne'), ostrzezenie: licz('ostrzezenie'), auto: licz('auto') + licz('czesciowo') + licz('zgodne'), recznie: licz('recznie'), nd: licz('nd') } };
});

// ---------- HTML ----------
const css = await readFile(new URL('./styl.css', import.meta.url), 'utf8');

const tabela = (naglowki, wiersze, podpis) => `<div class="table-wrap" tabindex="0" role="region" aria-label="${esc(podpis)}"><table><caption class="meta">${esc(podpis)}</caption><thead><tr>${naglowki.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${wiersze.join('')}</tbody></table></div>`;
const st = (s) => `<span class="st ${STATUS[s].klasa}">${STATUS[s].etykieta}</span>`;
const id = (s, i) => `serwis-${i + 1}`;

const html = `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="Przykładowy raport audytu dostępności WCAG 2.1 AA (DEMO, 2026).">
<title>${esc(w.nazwa)} – raport WCAG 2.1 AA (DEMO)</title>
<style>${css}</style>
</head>
<body>
<a class="skip" href="#tresc">Przejdź do treści</a>
<div class="demo" role="note"><strong>DEMO</strong> – przykładowy raport z 2026 r. przygotowany przez Isvero Studio na własnych serwisach demonstracyjnych. Nie jest to audyt wykonany dla klienta.</div>
<header class="top">
<p class="meta"><a href="../">Wszystkie raporty</a></p>
<h1>${esc(w.nazwa)}</h1>
<p class="meta">Data badania: ${esc(dataPl)}. Standard: WCAG 2.1, poziom AA (wymagany ustawą z 4 kwietnia 2019 r. o dostępności cyfrowej). Narzędzia: axe-core ${esc(w.narzedzia['axe-core'])}, Playwright ${esc(w.narzedzia.playwright)}, Chromium ${esc(w.narzedzia.przegladarka)}${serwisy.some((s) => s.lighthouse) ? ', Lighthouse' : ''}.</p>
</header>
<main id="tresc" tabindex="-1">
<h2>Podsumowanie</h2>
<div class="uwaga"><p><strong>Zakres tego raportu:</strong> część automatyczna audytu. Testy automatyczne wykrywają tylko część problemów z dostępnością. Kryteria oznaczone „Do oceny ręcznej” lub „potwierdzić ręcznie” wymagają sprawdzenia przez audytora (klawiatura, czytnik ekranu NVDA/VoiceOver, ocena treści). Lista kontrolna: <a href="../checklista.html">WCAG 2.1 AA – lista kontrolna audytu</a>.</p></div>
<ul class="karty">
${serwisy.map((s, i) => `<li class="karta"><h3><a href="#${id(s, i)}">${esc(s.nazwa)}</a></h3><p class="meta">${esc(s.technologia)}</p><p>Zbadane strony: <strong>${s.strony.length}</strong> (2 szerokości ekranu)</p><p>Naruszenia wykryte przez axe: <strong>${s.naruszeniaAxe}</strong></p><p>Kryteria niezgodne: <strong>${s.podsum.niezgodne}</strong>, ostrzeżenia: <strong>${s.podsum.ostrzezenie}</strong></p>${s.lighthouse && !s.lighthouse.blad ? `<p>Lighthouse (telefon): dostępność <strong>${s.lighthouse.accessibility}</strong>, wydajność <strong>${s.lighthouse.performance}</strong></p>` : ''}</li>`).join('\n')}
</ul>
${tabela(['Serwis', 'Niezgodne', 'Ostrzeżenia', 'Bez wykrytych problemów', 'Do oceny ręcznej', 'Nie dotyczy'], serwisy.map((s, i) => `<tr><th scope="row"><a href="#${id(s, i)}">${esc(s.nazwa)}</a></th><td>${s.podsum.niezgodne}</td><td>${s.podsum.ostrzezenie}</td><td>${s.podsum.auto}</td><td>${s.podsum.recznie}</td><td>${s.podsum.nd}</td></tr>`), 'Liczba kryteriów sukcesu (z 50) w każdym stanie')}

<h2>Co sprawdzono automatycznie</h2>
<ul>
<li>Reguły axe-core dla WCAG 2.0 i 2.1 (A, AA) na każdej stronie, w widoku komputera (1280 px) i telefonu (320 px).</li>
<li>1.4.10 Dopasowanie do ekranu – brak przewijania w poziomie przy szerokości 320 px.</li>
<li>1.4.4 Zmiana rozmiaru tekstu – układ przy powiększeniu 200% (szerokość 640 px).</li>
<li>1.4.12 Odstępy w tekście – po ustawieniu odstępów z kryterium (interlinia 1,5, odstęp liter 0,12 em, słów 0,16 em, akapitów 2 em) szukamy uciętej treści.</li>
<li>2.4.1, 2.4.7, 2.1.2 – przejście klawiszem Tab przez ${esc(String(40))} pierwszych elementów: link pomijający, widoczność fokusu, pułapka klawiatury.</li>
</ul>

${serwisy.map((s, i) => `
<section aria-labelledby="${id(s, i)}">
<h2 id="${id(s, i)}">${esc(s.nazwa)}</h2>
<p class="meta">${esc(s.technologia)} · <a href="${esc(s.url)}">${esc(s.url)}</a></p>
${s.lighthouse && !s.lighthouse.blad ? `<p>Lighthouse, strona główna, profil telefonu: wydajność ${s.lighthouse.performance}, dostępność ${s.lighthouse.accessibility}, dobre praktyki ${s.lighthouse['best-practices']}, SEO ${s.lighthouse.seo}${s.lighthouse.seo < 90 ? ' (niższe SEO wynika z celowego zakazu indeksowania dema)' : ''}.</p>` : ''}
<h3>Kryteria sukcesu WCAG 2.1 AA</h3>
${tabela(['Kryterium', 'Poziom', 'Wynik', 'Szczegóły'], s.kryteria.map((k) => `<tr><th scope="row">${k.id} ${esc(k.nazwa)}</th><td>${k.poziom}</td><td>${st(k.status)}</td><td>${k.problemy.length ? `<ul>${k.problemy.slice(0, 6).map((p) => `<li><code>${esc(p.strona)}</code>: ${esc(p.opis)}</li>`).join('')}</ul>` : esc(k.uwagi)}</td></tr>`), `Wyniki dla kryteriów – ${s.nazwa}`)}
<h3>Zbadane strony</h3>
${tabela(['Strona', 'Tytuł', 'axe 1280 / 320 px', '320 px', '200%', 'Odstępy', 'Link pomijający', 'Fokus'], s.strony.map((p) => p.blad ? `<tr><th scope="row"><code>${esc(p.sciezka)}</code></th><td colspan="7">Błąd badania: ${esc(p.blad)}</td></tr>` : `<tr><th scope="row"><code>${esc(p.sciezka)}</code></th><td>${esc(p.tytul)}${p.status !== 200 ? ` (HTTP ${p.status})` : ''}</td><td>${p.axeDesktop.naruszenia.length} / ${p.axeMobile.naruszenia.length}</td><td>${p.reflow320 ? 'OK' : 'Błąd'}</td><td>${p.zoom200 ? 'OK' : 'Błąd'}</td><td>${p.odstepy.liczba || p.odstepy.przewijaniePoziome ? 'Błąd' : 'OK'}</td><td>${p.klawiatura.linkPomijajacy ? 'Tak' : 'Nie'}</td><td>${p.klawiatura.bezWidocznegoFokusu.length ? `${p.klawiatura.bezWidocznegoFokusu.length} bez wyróżnienia` : `OK (${p.klawiatura.przejsc} el.)`}</td></tr>`), `Zbadane strony – ${s.nazwa}`)}
${s.strony.filter((p) => !p.blad && (p.axeDesktop.naruszenia.length || p.axeMobile.naruszenia.length)).map((p) => `<details><summary>Naruszenia na stronie ${esc(p.sciezka)}</summary><ul>${[...p.axeDesktop.naruszenia, ...p.axeMobile.naruszenia].map((v) => `<li><strong>${esc(v.opis)}</strong> – wpływ: ${esc(WPLYW[v.wplyw] || v.wplyw)}; WCAG ${esc(v.kryteria.join(', '))}; <a href="${esc(v.pomoc)}">opis reguły ${esc(v.id)}</a><ul>${v.wezly.map((n) => `<li><code>${esc(n.selektor)}</code></li>`).join('')}</ul></li>`).join('')}</ul></details>`).join('')}
</section>`).join('\n')}

<h2>Zalecenia</h2>
<ol>
<li>Usunąć wszystkie naruszenia oznaczone jako „Niezgodne”, zaczynając od wpływu krytycznego i poważnego.</li>
<li>Przeprowadzić ocenę ręczną kryteriów oznaczonych „Do oceny ręcznej” (czytnik ekranu, sama klawiatura, treść i formularze).</li>
<li>Uzupełnić deklarację dostępności o wyniki audytu i datę ostatniego przeglądu.</li>
<li>Uruchamiać ten test automatyczny przy każdej zmianie serwisu (GitHub Actions – plik <code>.github/workflows/audyt.yml</code>).</li>
</ol>
</main>
<footer><p>Isvero Studio · raport DEMO (2026) wygenerowany narzędziem <code>demo-wcag-audyt</code>. Dane w badanych serwisach są fikcyjne.</p></footer>
</body>
</html>
`;
await writeFile(path.join(dir, 'index.html'), html);

// ---------- Markdown ----------
const md = [
  `# ${w.nazwa}`,
  '',
  '> **DEMO** – przykładowy raport z 2026 r. na własnych serwisach demonstracyjnych Isvero Studio. Nie jest to audyt wykonany dla klienta.',
  '',
  `Data badania: ${dataPl} · WCAG 2.1 AA · axe-core ${w.narzedzia['axe-core']}`,
  '',
  '| Serwis | Technologia | Strony | Naruszenia axe | Niezgodne | Ostrzeżenia | Do oceny ręcznej | Lighthouse (dostępność / wydajność) |',
  '|---|---|---|---|---|---|---|---|',
  ...serwisy.map((s) => `| ${s.nazwa} | ${s.technologia} | ${s.strony.length} | ${s.naruszeniaAxe} | ${s.podsum.niezgodne} | ${s.podsum.ostrzezenie} | ${s.podsum.recznie} | ${s.lighthouse && !s.lighthouse.blad ? `${s.lighthouse.accessibility} / ${s.lighthouse.performance}` : '–'} |`),
  '',
  ...serwisy.flatMap((s) => {
    const zle = s.kryteria.filter((k) => k.problemy.length);
    return zle.length ? [`## ${s.nazwa}`, '', ...zle.flatMap((k) => [`- **${k.id} ${k.nazwa}** (${STATUS[k.status].etykieta}):`, ...k.problemy.slice(0, 6).map((p) => `  - \`${p.strona}\`: ${p.opis}`)]), ''] : [];
  }),
  'Pełny raport: `index.html` w tym katalogu. Surowe dane: `wyniki.json`.',
  '',
].join('\n');
await writeFile(path.join(dir, 'podsumowanie.md'), md);
console.log(`[raport] ${path.join(dir, 'index.html')}, ${path.join(dir, 'podsumowanie.md')}`);
