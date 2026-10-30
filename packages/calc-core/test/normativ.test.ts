// A normatív adatállomány és a követelménymátrix épsége.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { NORMATIV_FAJLOK, NormativAdatHiba, alapertek, tabla, type TablaHivatkozas } from '../src/index.js';

const GYOKER = join(import.meta.dirname, '..', '..', '..');
const ADAT = join(GYOKER, 'data', 'normativ');

describe('data/normativ', () => {
  it('minden JSON-fájl szerepel a betöltőben (src/normativ/fajlok.ts)', () => {
    const lemezen = readdirSync(ADAT, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .flatMap((d) => readdirSync(join(ADAT, d.name)).filter((f) => f.endsWith('.json')).map((f) => `${d.name}/${f.slice(0, -5)}`))
      .sort();
    expect(Object.keys(NORMATIV_FAJLOK).sort()).toEqual(lemezen);
  });

  it('minden táblázatban van forrás, hatályosság és megjegyzés, és az azonosítók fájlon belül egyediek', () => {
    for (const [fajl, tartalom] of Object.entries(NORMATIV_FAJLOK)) {
      const idk = tartalom.tablazatok.map((t) => t.id);
      expect(new Set(idk).size, fajl).toBe(idk.length);
      for (const t of tartalom.tablazatok) {
        const hol = `${fajl}#${t.id}`;
        expect(t.forras?.dokumentum, hol).toBeTruthy();
        expect(t.forras?.hely, hol).toBeTruthy();
        expect(t.hatalyos_tol, hol).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(typeof t.megjegyzes, hol).toBe('string');
        expect(Array.isArray(t.sorok) && t.sorok.length > 0, hol).toBe(true);
      }
    }
  });

  it('hiányzó táblázat vagy kulcs NormativAdatHiba', () => {
    expect(() => tabla('modszer/hotechnika#nincs_ilyen' as TablaHivatkozas)).toThrow(NormativAdatHiba);
    expect(() => alapertek('modszer/hotechnika#alapertekek_4', 'nincs_ilyen')).toThrow(NormativAdatHiba);
  });
});

describe('docs/KOVETELMENYMATRIX.md', () => {
  const matrix = readFileSync(join(GYOKER, 'docs', 'KOVETELMENYMATRIX.md'), 'utf8');

  it('minden adathivatkozás létező táblázatra mutat (a `*` végű családhivatkozás legalább egyre)', () => {
    const hivatkozasok = [...matrix.matchAll(/((?:modszer|rendelet)\/[A-Za-z0-9_]+)\.json(?:#([A-Za-z0-9_]+\*?))?/g)];
    expect(hivatkozasok.length).toBeGreaterThan(300);
    for (const [teljes, fajl, id] of hivatkozasok) {
      const tartalom = NORMATIV_FAJLOK[fajl as keyof typeof NORMATIV_FAJLOK];
      expect(tartalom, teljes).toBeDefined();
      if (!id) continue;
      const talalt = id.endsWith('*')
        ? tartalom!.tablazatok.some((t) => t.id.startsWith(id.slice(0, -1)))
        : tartalom!.tablazatok.some((t) => t.id === id);
      expect(talalt, teljes).toBe(true);
    }
  });

  it('a mátrix-azonosítók egyediek', () => {
    const idk = [...matrix.matchAll(/^\| ([A-Z]{2,4}-\d{3}) \|/gm)].map((m) => m[1]);
    // 808 sor a 9/2023 rendelet és módszer szerint (M1–M6), 41 sor az MSZ EN 12831-1 szerint (M7).
    expect(idk.length).toBe(808 + 41);
    expect(new Set(idk).size).toBe(idk.length);
  });
});
