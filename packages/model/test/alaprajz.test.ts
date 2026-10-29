// Rajzolt alaprajz → helyiségadatok (belméret, JEL-004, MOD-006; kitett kerület 4.20).
import { describe, expect, it } from 'vitest';
import { elek, elojelesTerulet, helyisegElek, kozosHossz, rajzSzinkron, szamolProjekt, tajolasAzimutbol, type Helyiseg, type Projekt } from '../src/index.js';
import { goldenProjekt } from './goldenAtalakito.js';

const tegla = (x0: number, y0: number, w: number, d: number) => [
  { x: x0, y: y0 },
  { x: x0 + w, y: y0 },
  { x: x0 + w, y: y0 + d },
  { x: x0, y: y0 + d },
];

describe('Alaprajz geometria', () => {
  it('terület és körüljárás: 6 × 4 m téglalap 24 m²; fordított körüljárásnál −24', () => {
    expect(elojelesTerulet(tegla(0, 0, 6, 4))).toBeCloseTo(24, 12);
    expect(elojelesTerulet([...tegla(0, 0, 6, 4)].reverse())).toBeCloseTo(-24, 12);
  });

  it('a kifelé mutató normális: déli él D, keleti K, északi É, nyugati Ny – körüljárástól függetlenül', () => {
    const t = (pp: { x: number; y: number }[]) => elek(pp).map((e) => tajolasAzimutbol(e.azimut));
    expect(t(tegla(0, 0, 6, 4))).toEqual(['D', 'K', 'É', 'Ny']);
    // fordított sorrend: (0,4)→(6,4) felső él É, jobb K, alsó D, bal Ny
    expect(t([...tegla(0, 0, 6, 4)].reverse())).toEqual(['É', 'K', 'D', 'Ny']);
  });

  it('északi irány 90°-kal elforgatva (a rajz jobbja észak): a rajz alsó éle K, jobb É, felső Ny, bal D', () => {
    expect(elek(tegla(0, 0, 6, 4), 90).map((e) => tajolasAzimutbol(e.azimut))).toEqual(['K', 'É', 'Ny', 'D']);
  });

  it('45°-os sarokél ÉK; a 22,5°-os határ a következő égtájhoz tartozik', () => {
    expect(tajolasAzimutbol(45)).toBe('ÉK');
    expect(tajolasAzimutbol(22.5)).toBe('ÉK');
    expect(tajolasAzimutbol(22.49)).toBe('É');
    expect(tajolasAzimutbol(359)).toBe('É');
  });

  it('közös fal: két szomszédos helyiség 4 m-es közös éle; részleges átfedés 2 m', () => {
    const a = elek(tegla(0, 0, 6, 4));
    const b = elek(tegla(6, 0, 3, 4));
    expect(kozosHossz(a[1]!, b[3]!)).toBeCloseTo(4, 12);
    const c = elek(tegla(6, 2, 3, 4));
    expect(kozosHossz(a[1]!, c[3]!)).toBeCloseTo(2, 12);
    expect(kozosHossz(a[0]!, b[0]!)).toBe(0);
  });

  it('közös fal eltérő körüljárásnál is (a sokszöget az óramutató szerint rajzolták)', () => {
    const a = elek(tegla(0, 0, 6, 4));
    const fordított = elek([...tegla(6, 0, 3, 4)].reverse());
    expect(fordított.reduce((s, f) => s + kozosHossz(a[1]!, f), 0)).toBeCloseTo(4, 12);
  });
});

describe('Rajz szinkron a projektbe', () => {
  const projekt = (): Projekt => {
    const p = goldenProjekt('G1');
    const fal = p.retegrendek.find((r) => r.szerkezet === 'homlokzati_fal')!.azon;
    const padlo = p.retegrendek.find((r) => r.szerkezet === 'talajon_fekvo_padlo')!.azon;
    const hs = (azon: string, pontok: { x: number; y: number }[]): Helyiseg => ({
      azon,
      nev: azon,
      szint: 'fsz',
      alapterulet: 0,
      belmagassag: 2.7,
      alaprajz: { pontok },
      hatarolok: [
        ...[0, 1, 2, 3].map((i) => ({ azon: `${azon}-f${i}`, retegrendAzon: fal, tuloldal: { fajta: 'külső' as const }, felulet: 0, nyilasok: [], rajzEl: i })),
        { azon: `${azon}-p`, retegrendAzon: padlo, tuloldal: { fajta: 'talaj' as const }, hajlasszog: 0, felulet: 0, nyilasok: [], rajzAlap: true },
      ],
    });
    p.helyisegek = [hs('nappali', tegla(0, 0, 6, 4)), hs('szoba', tegla(6, 0, 3, 4))];
    return p;
  };

  it('MOD-006 JEL-004 alapterület, falfelület szabad hossz × belmagasság, közös fal 0 m², tájolás', () => {
    const p = projekt();
    rajzSzinkron(p);
    const [n, s] = p.helyisegek;
    expect(n!.alapterulet).toBe(24);
    expect(s!.alapterulet).toBe(12);
    expect(n!.hatarolok.map((b) => b.felulet)).toEqual([16.2, 0, 16.2, 10.8, 24]);
    expect(n!.hatarolok.slice(0, 4).map((b) => b.tajolas)).toEqual(['D', 'K', 'É', 'Ny']);
    expect(s!.hatarolok.map((b) => b.felulet)).toEqual([8.1, 10.8, 8.1, 0, 12]);
  });

  it('HT-088 kitett kerület: a külső élek szabad hossza helyiségenként; összesen a ház kerülete 2·(9 + 4) = 26 m', () => {
    const p = projekt();
    rajzSzinkron(p);
    const P = p.helyisegek.map((h) => h.hatarolok.find((b) => b.rajzAlap)!.kitettKerulet!);
    expect(P).toEqual([16, 10]);
    expect(helyisegElek(p, p.helyisegek[0]!)[1]!.kozos).toBeCloseTo(4, 12);
  });

  it('a számítás a rajzból képzett projekttel lefut, a padló B-je 36/(0,5·26)', () => {
    const p = projekt();
    rajzSzinkron(p);
    const k = szamolProjekt(p);
    if (!k.rendben) throw new Error(JSON.stringify(k.hianyok));
    expect(k.eredmeny.AN).toBe(36);
    expect(k.eredmeny.szerkezetek.find((x) => x.szerkezet === 'talajon_fekvo_padlo')!.megjegyzes).toContain('B = 2,77 m');
  });
});
