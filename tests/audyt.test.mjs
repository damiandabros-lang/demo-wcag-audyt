import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { KRYTERIA, kryteriaReguly, kryteriumZTagu } from '../audyt/wcag.mjs';

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..');

test('lista zawiera 50 kryteriów WCAG 2.1 A i AA', () => {
  assert.equal(KRYTERIA.length, 50);
  assert.equal(new Set(KRYTERIA.map((k) => k.id)).size, 50);
  assert.equal(KRYTERIA.filter((k) => k.poziom === 'A').length, 30);
});

test('tagi axe zamieniane są na numery kryteriów', () => {
  assert.equal(kryteriumZTagu('wcag143'), '1.4.3');
  assert.equal(kryteriumZTagu('wcag1410'), '1.4.10');
  assert.equal(kryteriumZTagu('wcag2aa'), null);
  assert.deepEqual(kryteriaReguly(['wcag2a', 'wcag111', 'section508']), ['1.1.1']);
});

test('audyt wykrywa problemy na złej stronie i nie zgłasza ich na dobrej', { timeout: 120000 }, async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), 'audyt-'));
  const base = pathToFileURL(path.join(root, 'tests', 'strony') + '/').toString();
  const cfg = path.join(tmp, 'cfg.json');
  await writeFile(cfg, JSON.stringify({ nazwa: 'Test', serwisy: [{ nazwa: 'Strony testowe', url: base, strony: ['zla.html', 'dobra.html'] }] }));
  await run(process.execPath, [path.join(root, 'audyt', 'audyt.mjs'), cfg, tmp]);
  const w = JSON.parse(await readFile(path.join(tmp, 'wyniki.json'), 'utf8'));
  const [zla, dobra] = w.serwisy[0].strony;
  const reguly = zla.axeDesktop.naruszenia.map((v) => v.id);
  for (const r of ['html-has-lang', 'document-title', 'image-alt', 'color-contrast']) assert.ok(reguly.includes(r), `brak reguły ${r}`);
  assert.equal(zla.reflow320, false, '1.4.10 – powinno wykryć przewijanie w poziomie');
  assert.ok(zla.odstepy.liczba > 0, '1.4.12 – powinno wykryć uciętą treść');
  assert.equal(zla.klawiatura.linkPomijajacy, false);
  assert.ok(zla.klawiatura.bezWidocznegoFokusu.length > 0, '2.4.7 – powinno wykryć brak fokusu');

  assert.deepEqual(dobra.axeDesktop.naruszenia.map((v) => v.id), []);
  assert.equal(dobra.reflow320, true);
  assert.equal(dobra.odstepy.liczba, 0);
  assert.equal(dobra.klawiatura.linkPomijajacy, true);
  assert.deepEqual(dobra.klawiatura.bezWidocznegoFokusu, []);

  await run(process.execPath, [path.join(root, 'audyt', 'raport.mjs'), tmp]);
  const html = await readFile(path.join(tmp, 'index.html'), 'utf8');
  assert.match(html, /<html lang="pl">/);
  assert.match(html, /DEMO/);
  assert.match(html, /Niezgodne/);
});
