// Méretezési hőterhelés a projektből (MSZ EN 12831-1:2017). Kézzel számolt egyhelyiséges példa.
import { describe, expect, it } from 'vitest';
import { hoterhelesProjekt, rajzSzinkron, type Projekt } from '../src/index.js';
import { goldenProjekt } from './goldenAtalakito.js';

const forras = { tipus: 'feltevés' as const, indoklas: 'teszt' };
function projekt(): Projekt {
  const p = goldenProjekt('G1');
  p.anyagok = [{ azon: 'a', nev: 'teszt', lambda: 0.04, forras }];
  p.retegrendek = [
    { azon: 'fal', nev: 'F', szerkezet: 'homlokzati_fal', retegek: [{ anyagAzon: 'a', d: 0.2 }] },
    { azon: 'teto', nev: 'T', szerkezet: 'lapos_teto', retegek: [{ anyagAzon: 'a', d: 0.2 }] },
    { azon: 'padlo', nev: 'P', szerkezet: 'talajon_fekvo_padlo', retegek: [{ anyagAzon: 'a', d: 0.16 }] },
  ];
  p.nyilaszarok = [{ azon: 'ajto', nev: 'Ajtó', fajta: 'ajto', U: 1.4, forras: { tipus: 'jogszabaly', hivatkozas: 'teszt' } }];
  p.helyisegek = [
    {
      azon: 'sz',
      nev: 'Szoba',
      szint: 'fsz',
      alapterulet: 0,
      belmagassag: 2.5,
      alaprajz: { pontok: [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 4 }, { x: 0, y: 4 }] },
      hoterheles: { nMinTipus: 'allando' },
      hatarolok: [
        { azon: 'f0', retegrendAzon: 'fal', tuloldal: { fajta: 'külső' }, felulet: 0, nyilasok: [{ nyilaszaroAzon: 'ajto', szelesseg: 1, magassag: 2, db: 1 }], rajzEl: 0 },
        ...[1, 2, 3].map((i) => ({ azon: `f${i}`, retegrendAzon: 'fal', tuloldal: { fajta: 'külső' as const }, felulet: 0, nyilasok: [], rajzEl: i })),
        { azon: 'p', retegrendAzon: 'padlo', tuloldal: { fajta: 'talaj' }, hajlasszog: 0, felulet: 0, nyilasok: [], rajzAlap: 'alatta', kitettKerulet: 0 },
        { azon: 't', retegrendAzon: 'teto', tuloldal: { fajta: 'külső' }, hajlasszog: 0, felulet: 0, nyilasok: [], rajzAlap: 'felette' },
      ],
    },
  ];
  p.hoterheles = {
    thetaERef: { ertek: -13, forras: 'teszt' },
    thetaEm: { ertek: 10, forras: 'teszt' },
    hohid: 'egyeb',
    legtomorseg: { osztaly: 'III' },
    tobbHomlokzat: true,
    arnyekoltsag: 'normal',
    magasEpulet: false,
    dhz: 3,
    talajvizKozel: false,
    hotarolo: 'kozepes_magas',
    futetlenF1: {},
  };
  rajzSzinkron(p);
  return p;
}

describe('Méretezési hőterhelés a projektből', () => {
  it('HL-003 HL-006 HL-008 HL-017 6 × 4 m szoba: H_ie 24,1536 W/K → 797,07 W; talaj (B′ 2,4) 97,62 W; szellőzés 336,6 W; Φ_HL 1231,29 W', () => {
    // Kézi számítás: U_fal = 1/(0,13 + 5 + 0,04) = 0,193424; U_tető = 1/(0,10 + 5 + 0,04) = 0,194553; ΔU_TB = 0,10 (B.1 „egyéb”).
    // H_ie = 48·(0,193424 + 0,1) + 2·(1,4 + 0,1) + 24·(0,194553 + 0,1) = 24,15359 W/K; Φ_T,ie = 24,15359·33 = 797,069 W.
    // Talaj: U_k = 1/(0,17 + 4 + 0,04) = 0,237530; B′ = 24/(0,5·20) = 2,4; U_equiv = 0,280509 (E.1);
    // H_ig = 1,45·24·0,280509·(20 − 10)/33 = 2,958099 W/K → 97,617 W.
    // Szellőzés: q_env,50·A_env = 6·74 = 444; q_inf-add = 444·0,05 = 22,2 < q_min = 0,5·60 = 30 → 0,34·30·33 = 336,6 W.
    const k = hoterhelesProjekt(projekt());
    if (!k.rendben) throw new Error(JSON.stringify(k.hianyok));
    const h = k.eredmeny.helyisegek[0]!;
    expect(k.eredmeny.thetaE).toBe(-13);
    expect(h.thetaInt).toBe(20);
    expect(h.transzmisszio.reszek.ie).toBeCloseTo(797.0686, 3);
    expect(h.transzmisszio.reszek.ig).toBeCloseTo(97.6173, 3);
    expect(h.PhiV).toBeCloseTo(336.6, 9);
    expect(h.PhiHL).toBeCloseTo(1231.2858, 3);
    expect(k.eredmeny.epulet).toBeCloseTo(1231.2858, 3);
  });

  it('HL-010 hiányzó klímaadatnál és fűtetlen tér jellege nélkül hiánylista', () => {
    const p = projekt();
    delete p.hoterheles!.thetaERef;
    p.helyisegek[0]!.hatarolok[2]!.tuloldal = { fajta: 'fűtetlen', ter: 'Padlástérrel határos födém vagy fal' };
    const k = hoterhelesProjekt(p);
    expect(k.rendben).toBe(false);
    const u = !k.rendben ? k.hianyok.map((x) => x.uzenet).join(' | ') : '';
    expect(u).toContain('θ_e,Ref');
    expect(u).toContain('B.2. táblázat');
  });

  it('HL-005 HL-007 fürdő 24 °C a szoba mellett: a közös belső falon H_T,ia; a szoba felé negatív', () => {
    const p = projekt();
    p.retegrendek.push({ azon: 'belso', nev: 'Válaszfal', szerkezet: 'homlokzati_fal', retegek: [{ anyagAzon: 'a', d: 0.04 }] });
    p.hoterheles!.belsoFalRetegrendAzon = 'belso';
    const sz = p.helyisegek[0]!;
    p.helyisegek.push({ ...structuredClone(sz), azon: 'fu', nev: 'Fürdő', alaprajz: { pontok: [{ x: 6, y: 0 }, { x: 8, y: 0 }, { x: 8, y: 4 }, { x: 6, y: 4 }] }, hoterheles: { nMinTipus: 'vizes_ablakos' } });
    rajzSzinkron(p);
    const k = hoterhelesProjekt(p);
    if (!k.rendben) throw new Error(JSON.stringify(k.hianyok));
    const [szoba, furdo] = k.eredmeny.helyisegek;
    // Közös fal 4 m × 2,5 m = 10 m²; U = 1/(0,13 + 1 + 0,13) = 0,793651; szoba: 10·0,793651·(20 − 24) = −31,746 W.
    expect(furdo!.thetaInt).toBe(24);
    expect(szoba!.transzmisszio.reszek.ia).toBeCloseTo(-31.746, 3);
    expect(furdo!.transzmisszio.reszek.ia).toBeCloseTo(31.746, 3);
  });
});
