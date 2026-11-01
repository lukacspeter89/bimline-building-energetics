// Alaprajz-alátét geometriája: elhelyezés, lépték két ponttal, igazítás falra, tervi feliratok.
import { describe, expect, it } from 'vitest';
import { cimkeABen, cimkekSzovegbol, igazitas, leptekezes, vilagba, type Alatet } from '../src/alatetGeo.js';

const alap: Alatet = { kep: '', w: 1000, h: 800, s: 0.01, fi: 0, x0: 0, y0: 8, atlatszo: 0.5, cimkek: [] };

describe('Alátét', () => {
  it('a kép bal felső sarka (x0, y0), a v tengely lefelé: (100, 200) px → (1, 6) m', () => {
    expect(vilagba(alap, 100, 200)).toEqual({ x: 1, y: 6 });
  });

  it('lépték két ponttal: 2 m-nek mért szakasz valójában 3 m → s × 1,5, az A pont helyben marad', () => {
    const A = vilagba(alap, 100, 100);
    const B = vilagba(alap, 300, 100);
    const u = leptekezes(alap, A, B, 3);
    expect(u.s).toBeCloseTo(0.015, 12);
    const A2 = vilagba(u, 100, 100);
    expect(A2.x).toBeCloseTo(A.x, 9);
    expect(A2.y).toBeCloseTo(A.y, 9);
    const B2 = vilagba(u, 300, 100);
    expect(Math.hypot(B2.x - A2.x, B2.y - A2.y)).toBeCloseTo(3, 9);
  });

  it('igazítás: 25°-os fal vízszintesre fordul; 80°-os függőlegesre; A helyben marad', () => {
    const A = { x: 1, y: 1 };
    const B = { x: 1 + Math.cos((25 * Math.PI) / 180), y: 1 + Math.sin((25 * Math.PI) / 180) };
    const u = igazitas(alap, A, B);
    expect(u.fi).toBeCloseTo(-25, 9);
    const v = igazitas(alap, A, { x: 1 + Math.cos((80 * Math.PI) / 180), y: 1 + Math.sin((80 * Math.PI) / 180) });
    expect(v.fi).toBeCloseTo(10, 9);
    // a kép egy pontja, amely A-ban volt, A-ban marad
    const s = { ...alap, x0: 1, y0: 1 };
    const w = igazitas(s, A, B);
    expect(vilagba(w, 0, 0).x).toBeCloseTo(1, 9);
  });

  it('tervi feliratok: „20,01” + „m2” a közeli számmal és névvel; burkolat kihagyva; a rajzolt kontúrba eső felirat', () => {
    const c = cimkekSzovegbol(
      [
        { str: '01/8/4', x: 500, y: 390 },
        { str: 'nappali', x: 500, y: 400 },
        { str: 'laminált', x: 500, y: 410 },
        { str: '20,01', x: 500, y: 420 },
        { str: 'm2', x: 520, y: 420 },
        { str: '3,52', x: 900, y: 100 },
      ],
      100,
    );
    expect(c).toEqual([{ u: 500, v: 420, A: 20.01, szam: '01/8/4', nev: 'nappali' }]);
    const a = { ...alap, cimkek: c };
    const hol = vilagba(a, 500, 420);
    const kontur = [{ x: hol.x - 1, y: hol.y - 1 }, { x: hol.x + 1, y: hol.y - 1 }, { x: hol.x + 1, y: hol.y + 1 }, { x: hol.x - 1, y: hol.y + 1 }];
    expect(cimkeABen(a, kontur)?.nev).toBe('nappali');
    expect(cimkeABen(a, kontur.map((q) => ({ x: q.x + 5, y: q.y })))).toBeUndefined();
  });
});
