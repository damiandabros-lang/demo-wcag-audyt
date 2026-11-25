#!/usr/bin/env node
// Audyt dostępności WCAG 2.1 AA – część automatyczna.
// Użycie: node audyt/audyt.mjs <konfiguracja.json> <katalog-wyników> [--lighthouse]
//
// Dla każdej strony z konfiguracji:
//  - axe-core (reguły wcag2a, wcag2aa, wcag21a, wcag21aa) w widoku 1280 px i 320 px,
//  - 1.4.10 dopasowanie do ekranu: brak przewijania w poziomie przy 320 px,
//  - 1.4.4 zmiana rozmiaru tekstu: widok 640 px (odpowiednik powiększenia 200% przy 1280 px),
//  - 1.4.12 odstępy w tekście: wstrzyknięcie odstępów z kryterium i szukanie uciętej treści,
//  - 2.4.1 link pomijający, 2.4.7 widoczny fokus, 2.1.2 pułapka klawiatury (przejście klawiszem Tab).
// Wynik: <katalog>/wyniki.json (raport HTML tworzy audyt/raport.mjs).
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { kryteriaReguly } from './wcag.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const axeSrc = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
const axeVersion = require('axe-core/package.json').version;
// Polskie opisy reguł axe-core.
const axePl = await readFile(require.resolve('axe-core/locales/pl.json'), 'utf8');

const [cfgPath, outDir] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const withLighthouse = process.argv.includes('--lighthouse');
if (!cfgPath || !outDir) {
  console.error('Użycie: node audyt/audyt.mjs <konfiguracja.json> <katalog-wyników> [--lighthouse]');
  process.exit(2);
}
const cfg = JSON.parse(await readFile(cfgPath, 'utf8'));
const TAB_LIMIT = cfg.limitTab ?? 40;
const WIDOKI = {
  desktop: { viewport: { width: 1280, height: 900 } },
  mobile: { viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true },
  zoom200: { viewport: { width: 640, height: 900 } },
};

const log = (m) => console.log('[audyt] ' + m);

async function otworz(page, url) {
  const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  // Aplikacje strumieniujące metadane (np. Next.js) – poczekaj na tytuł.
  await page.waitForFunction(() => document.title.trim().length > 0, null, { timeout: 5000 }).catch(() => {});
  return res?.status() ?? 0;
}

async function axe(page) {
  await page.addScriptTag({ content: axeSrc });
  // eslint-disable-next-line no-undef
  await page.evaluate((loc) => axe.configure({ locale: JSON.parse(loc) }), axePl);
  const r = await page.evaluate(async () =>
    // eslint-disable-next-line no-undef
    axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, resultTypes: ['violations', 'incomplete'] }),
  );
  const mapuj = (v) => ({
    id: v.id,
    opis: v.help,
    wplyw: v.impact,
    kryteria: kryteriaReguly(v.tags),
    pomoc: v.helpUrl,
    liczba: v.nodes.length,
    wezly: v.nodes.slice(0, 5).map((n) => ({ selektor: n.target.join(' '), html: n.html.slice(0, 300), podsumowanie: (n.failureSummary || '').slice(0, 400) })),
  });
  return { naruszenia: r.violations.map(mapuj), doSprawdzenia: r.incomplete.map(mapuj).map(({ wezly, ...x }) => x) };
}

// Porównujemy z zadaną szerokością widoku, a nie z window.innerWidth: w emulacji telefonu
// przeglądarka poszerza widok układu do szerokości treści i przewijanie byłoby niewidoczne.
const przewijaPoziomo = (page) => page.evaluate((w) => document.documentElement.scrollWidth > w + 1, page.viewportSize().width);

async function odstepyWTekscie(page) {
  await page.addStyleTag({
    content: '*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}',
  });
  await page.waitForTimeout(100);
  return page.evaluate((w) => {
    const uciete = [];
    for (const el of document.querySelectorAll('body *')) {
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden') continue;
      if (!el.textContent.trim() || el.children.length > 3) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue; // elementy tylko dla czytników ekranu
      const ukryty = (o) => o === 'hidden' || o === 'clip';
      if ((ukryty(s.overflowX) && el.scrollWidth > el.clientWidth + 2) || (ukryty(s.overflowY) && el.scrollHeight > el.clientHeight + 2)) {
        uciete.push((el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '')).slice(0, 120));
      }
    }
    return { uciete: uciete.slice(0, 10), liczba: uciete.length, przewijaniePoziome: document.documentElement.scrollWidth > w + 1 };
  }, page.viewportSize().width);
}

async function klawiatura(page) {
  const kroki = [];
  let poprzedni = null;
  let powtorzenia = 0;
  let pulapka = false;
  for (let i = 0; i < TAB_LIMIT; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const opis = (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + ' ' + (el.getAttribute('aria-label') || el.textContent || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 50)).trim();
      const styl = (e) => {
        const s = getComputedStyle(e);
        return [s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 ? s.outlineStyle + s.outlineWidth + s.outlineColor : '', s.boxShadow, s.backgroundColor, s.color, s.borderColor, s.textDecorationLine].join('|');
      };
      const zFokusem = styl(el);
      const s = getComputedStyle(el);
      const maObrys = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
      el.blur();
      const bezFokusu = styl(el);
      el.focus();
      const href = el.tagName === 'A' ? el.getAttribute('href') || '' : '';
      const cel = href.startsWith('#') && href.length > 1 ? !!document.getElementById(decodeURIComponent(href.slice(1))) : null;
      return { opis, widoczny: maObrys || zFokusem !== bezFokusu, href, celIstnieje: cel };
    });
    if (!info) {
      kroki.push(null);
      continue;
    }
    if (poprzedni && info.opis === poprzedni) {
      powtorzenia++;
      if (powtorzenia >= 3) {
        pulapka = true;
        break;
      }
    } else powtorzenia = 0;
    poprzedni = info.opis;
    kroki.push(info);
  }
  const pierwszy = kroki.find(Boolean);
  const bezFokusu = kroki.filter((k) => k && !k.widoczny).map((k) => k.opis);
  return {
    przejsc: kroki.filter(Boolean).length,
    linkPomijajacy: !!(pierwszy && pierwszy.href.startsWith('#') && pierwszy.celIstnieje),
    pierwszyElement: pierwszy?.opis ?? null,
    bezWidocznegoFokusu: [...new Set(bezFokusu)].slice(0, 10),
    pulapka,
  };
}

async function multimedia(page) {
  return page.evaluate(() => document.querySelectorAll('video, audio, iframe[src*="youtube"], iframe[src*="vimeo"]').length);
}

async function lighthouse(url) {
  let lh;
  try {
    lh = (await import('lighthouse')).default;
  } catch {
    log('Lighthouse niedostępny (npm i lighthouse) – pomijam');
    return null;
  }
  const chromeLauncher = await import('chrome-launcher');
  const chrome = await chromeLauncher.launch({ chromePath: process.env.CHROME_PATH || chromium.executablePath(), chromeFlags: ['--headless=new', '--no-sandbox'] });
  try {
    const r = await lh(url, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] });
    return Object.fromEntries(Object.entries(r.lhr.categories).map(([k, v]) => [k, Math.round((v.score ?? 0) * 100)]));
  } finally {
    await chrome.kill();
  }
}

const przegladarka = await chromium.launch();
const wyniki = {
  nazwa: cfg.nazwa,
  data: new Date().toISOString(),
  narzedzia: { 'axe-core': axeVersion, playwright: require('playwright/package.json').version, przegladarka: przegladarka.version() },
  serwisy: [],
};

for (const serwis of cfg.serwisy) {
  log(`${serwis.nazwa} – ${serwis.url}`);
  const wynikSerwisu = { nazwa: serwis.nazwa, url: serwis.url, technologia: serwis.technologia || '', strony: [], multimedia: 0, lighthouse: null };
  const ctx = Object.fromEntries(await Promise.all(Object.entries(WIDOKI).map(async ([k, o]) => [k, await przegladarka.newContext({ ...o, locale: 'pl-PL' })])));
  for (const sciezka of serwis.strony) {
    const url = new URL(sciezka, serwis.url).toString();
    const s = { sciezka, url };
    try {
      const pd = await ctx.desktop.newPage();
      s.status = await otworz(pd, url);
      s.tytul = await pd.title();
      wynikSerwisu.multimedia += await multimedia(pd);
      s.axeDesktop = await axe(pd);
      s.klawiatura = await klawiatura(pd);
      await pd.close();

      const pm = await ctx.mobile.newPage();
      await otworz(pm, url);
      s.axeMobile = await axe(pm);
      s.reflow320 = !(await przewijaPoziomo(pm));
      await pm.close();

      const pz = await ctx.zoom200.newPage();
      await otworz(pz, url);
      s.zoom200 = !(await przewijaPoziomo(pz));
      await pz.close();

      const po = await ctx.desktop.newPage();
      await otworz(po, url);
      s.odstepy = await odstepyWTekscie(po);
      await po.close();
      const n = s.axeDesktop.naruszenia.length + s.axeMobile.naruszenia.length;
      log(`  ${sciezka}  HTTP ${s.status}  axe: ${n}  reflow: ${s.reflow320 ? 'OK' : 'BŁĄD'}  fokus bez wyróżnienia: ${s.klawiatura.bezWidocznegoFokusu.length}`);
    } catch (e) {
      s.blad = String(e.message || e).slice(0, 300);
      log(`  ${sciezka}  BŁĄD: ${s.blad}`);
    }
    wynikSerwisu.strony.push(s);
  }
  await Promise.all(Object.values(ctx).map((c) => c.close()));
  if (withLighthouse) {
    wynikSerwisu.lighthouse = await lighthouse(new URL(serwis.strony[0], serwis.url).toString()).catch((e) => ({ blad: String(e.message || e) }));
    log(`  Lighthouse (mobile): ${JSON.stringify(wynikSerwisu.lighthouse)}`);
  }
  wyniki.serwisy.push(wynikSerwisu);
}
await przegladarka.close();
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, 'wyniki.json'), JSON.stringify(wyniki, null, 2));
log(`zapisano ${path.join(outDir, 'wyniki.json')}`);
