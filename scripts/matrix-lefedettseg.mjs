// A követelménymátrix tesztlefedettsége: mely mátrixsorokra hivatkozik legalább egy teszt neve.
// Hibát ad (kilépési kód 1), ha egy teszt nem létező mátrix-azonosítóra hivatkozik.
// Használat: node scripts/matrix-lefedettseg.mjs [--reszletes]
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const gyoker = join(import.meta.dirname, '..');
const matrix = readFileSync(join(gyoker, 'docs', 'KOVETELMENYMATRIX.md'), 'utf8');
const matrixIdk = new Set([...matrix.matchAll(/^\| ([A-Z]{2,4}-\d{3}) \|/gm)].map((m) => m[1]));

const tesztIdk = new Set();
for (const csomag of readdirSync(join(gyoker, 'packages'))) {
  const mappa = join(gyoker, 'packages', csomag, 'test');
  let fajlok = [];
  try {
    fajlok = readdirSync(mappa, { recursive: true }).filter((f) => String(f).endsWith('.test.ts'));
  } catch {
    continue;
  }
  for (const f of fajlok) {
    const szoveg = readFileSync(join(mappa, String(f)), 'utf8');
    for (const nev of szoveg.matchAll(/\bit\(\s*'([^']*)'/g)) {
      for (const id of nev[1].matchAll(/\b([A-Z]{2,4}-\d{3})\b/g)) tesztIdk.add(id[1]);
      // Tartomány: „HT-010 … HT-013”
      for (const t of nev[1].matchAll(/\b([A-Z]{2,4})-(\d{3})\s*…\s*\1-(\d{3})\b/g)) {
        for (let i = Number(t[2]); i <= Number(t[3]); i++) tesztIdk.add(`${t[1]}-${String(i).padStart(3, '0')}`);
      }
    }
  }
}

const ismeretlen = [...tesztIdk].filter((id) => !matrixIdk.has(id)).sort();
const elotagok = new Map();
for (const id of matrixIdk) {
  const e = id.split('-')[0];
  const x = elotagok.get(e) ?? { osszes: 0, lefedett: 0, hianyzik: [] };
  x.osszes++;
  if (tesztIdk.has(id)) x.lefedett++;
  else x.hianyzik.push(id);
  elotagok.set(e, x);
}

const lefedett = [...matrixIdk].filter((id) => tesztIdk.has(id)).length;
console.log(`Követelménymátrix: ${matrixIdk.size} sor, ebből teszttel lefedett: ${lefedett} (${((100 * lefedett) / matrixIdk.size).toFixed(1)}%)`);
for (const [e, x] of [...elotagok].sort()) {
  console.log(`  ${e.padEnd(4)} ${String(x.lefedett).padStart(3)} / ${String(x.osszes).padEnd(3)}${process.argv.includes('--reszletes') && x.hianyzik.length ? '  hiányzik: ' + x.hianyzik.join(', ') : ''}`);
}
if (ismeretlen.length) {
  console.error(`Nem létező mátrix-azonosítóra hivatkozó teszt: ${ismeretlen.join(', ')}`);
  process.exit(1);
}
