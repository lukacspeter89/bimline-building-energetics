// Követelmények, besorolás, minősítés – 9/2023 ÉKM 1–3., 5. melléklet; 176/2008 Korm. 3–5. melléklet.
import { describe, expect, it } from 'vitest';
import {
  ErvenytelenBemenet,
  arany,
  besorolas,
  co2MaxLako,
  elemiKovetelmeny,
  enrenMaxLako,
  kovetelmenyReferenciabol,
  minositesiSor,
  qmMax,
  rendszerMinosites,
  szerkezetMinosites,
} from '../src/index.js';

describe('Elemi U-követelmény (9/2023 ÉKM 1. melléklet 1.1.)', () => {
  it('KOV-020 homlokzati fal: 0,24 megfelel, 0,25 nem', () => {
    expect(elemiKovetelmeny({ kod: 'homlokzati_fal', U: 0.24, ujEpulet: true })).toEqual({
      sor: 2,
      uMax: 0.24,
      alkalmazando: true,
      megfelel: true,
    });
    expect(elemiKovetelmeny({ kod: 'homlokzati_fal', U: 0.25, ujEpulet: true }).megfelel).toBe(false);
  });

  it('KOV-022 a 0,5 m²-es vagy kisebb ablakra nincs elemi követelmény', () => {
    const kicsi = elemiKovetelmeny({ kod: 'ablak_fa_pvc', U: 1.6, ujEpulet: true, felulet: 0.5 });
    expect(kicsi.alkalmazando).toBe(false);
    expect(kicsi.megfelel).toBe(true);
    expect(elemiKovetelmeny({ kod: 'ablak_fa_pvc', U: 1.2, ujEpulet: true, felulet: 0.51 }).megfelel).toBe(false);
    expect(() => elemiKovetelmeny({ kod: 'ablak_fa_pvc', U: 1.0, ujEpulet: true })).toThrow(ErvenytelenBemenet);
  });

  it('KOV-023 talajon fekvő padló: követelmény csak új épületnél', () => {
    expect(elemiKovetelmeny({ kod: 'talajon_fekvo_padlo', U: 0.5, ujEpulet: false }).alkalmazando).toBe(false);
    expect(elemiKovetelmeny({ kod: 'talajon_fekvo_padlo', U: 0.5, ujEpulet: true }).megfelel).toBe(false);
  });

  it('KOV-026 ajtó és kapu követelményértéke: 1,4 / 1,8 / 2,0', () => {
    expect(elemiKovetelmeny({ kod: 'ajto', U: 1.4, ujEpulet: true }).uMax).toBe(1.4);
    expect(elemiKovetelmeny({ kod: 'kapu', U: 1.8, ujEpulet: true }).uMax).toBe(1.8);
    expect(elemiKovetelmeny({ kod: 'ipari_tuzgatlo_ajto_kapu', U: 2.0, ujEpulet: true }).uMax).toBe(2.0);
  });
});

describe('Fajlagos hőveszteség-tényező követelménye', () => {
  it('KOV-060 közel nulla: A/V 0,2 → 0,14; 0,8 → 0,255; 1,15 → 0,3355 (D-010); 1,5 → 0,37', () => {
    expect(qmMax(0.2, 'kozel_nulla')).toBeCloseTo(0.14, 12);
    expect(qmMax(0.3, 'kozel_nulla')).toBeCloseTo(0.14, 12);
    expect(qmMax(0.8, 'kozel_nulla')).toBeCloseTo(0.255, 12);
    expect(qmMax(1.15, 'kozel_nulla')).toBeCloseTo(0.3355, 12);
    expect(qmMax(1.3, 'kozel_nulla')).toBeCloseTo(0.37, 12);
    expect(qmMax(1.5, 'kozel_nulla')).toBeCloseTo(0.37, 12);
  });

  it('KOV-064 jelentős felújítás: A/V 0,2 → 0,18; 0,8 → 0,35; 2,0 → 0,52', () => {
    expect(qmMax(0.2, 'jelentos_felujitas')).toBeCloseTo(0.18, 12);
    expect(qmMax(0.8, 'jelentos_felujitas')).toBeCloseTo(0.35, 12);
    expect(qmMax(1.3, 'jelentos_felujitas')).toBeCloseTo(0.52, 12);
    expect(qmMax(2.0, 'jelentos_felujitas')).toBeCloseTo(0.52, 12);
  });
});

describe('Összesített energetikai jellemző és CO2 követelménye', () => {
  it('KOV-061, REF-001 közel nulla lakó: 0,8 · 95 = 76 kWh/m²év', () => {
    expect(enrenMaxLako(0.8, 'kozel_nulla')).toBeCloseTo(76, 12);
  });
  it('KOV-062, REF-001 közel nulla lakó CO2: 0,8 · 25 = 20 kg/m²év', () => {
    expect(co2MaxLako('kozel_nulla')).toBeCloseTo(20, 12);
  });
  it('KOV-065 jelentős felújítás lakó: A/V 0,2 → 110; 0,8 → 130; 2,0 → 150', () => {
    expect(enrenMaxLako(0.2, 'jelentos_felujitas')).toBeCloseTo(110, 12);
    expect(enrenMaxLako(0.8, 'jelentos_felujitas')).toBeCloseTo(130, 12);
    expect(enrenMaxLako(2.0, 'jelentos_felujitas')).toBeCloseTo(150, 12);
    expect(co2MaxLako('jelentos_felujitas')).toBeNull();
  });
  it('KOV-063, KOV-066 egyéb rendeltetés: 0,8 · E_REF, ill. 1,0 · E_REF', () => {
    expect(kovetelmenyReferenciabol(100, 'kozel_nulla', 'Enren_fajl')).toBeCloseTo(80, 12);
    expect(kovetelmenyReferenciabol(30, 'kozel_nulla', 'ECO2_fajl')).toBeCloseTo(24, 12);
    expect(kovetelmenyReferenciabol(100, 'jelentos_felujitas', 'Enren_fajl')).toBeCloseTo(100, 12);
    expect(kovetelmenyReferenciabol(100, 'jelentos_felujitas', 'ECO2_fajl')).toBeNull();
  });
});

describe('Besorolás (176/2008 3. melléklet)', () => {
  it('TAN-003 arány: 58,68 / 76 → 77,21%; TAN-004: 12,96 / 20 → 64,8%', () => {
    expect(arany(58.68, 76)).toBeCloseTo(77.21052631578948, 10);
    expect(arany(12.96, 20)).toBeCloseTo(64.8, 10);
  });
  it('TAN-005 sávhatárok', () => {
    expect(besorolas(-5)).toBe('A+++2023');
    expect(besorolas(0)).toBe('A+++2023');
    expect(besorolas(0.01)).toBe('A++2023');
    expect(besorolas(77.21)).toBe('A+2023');
    expect(besorolas(100)).toBe('A2023');
    expect(besorolas(100.01)).toBe('B2023');
    expect(besorolas(160)).toBe('C2023');
    expect(besorolas(390)).toBe('G2023');
    expect(besorolas(500)).toBe('H2023');
    expect(besorolas(500.01)).toBe('I2023');
  });
});

describe('Szerkezet- és rendszerminősítés (176/2008 4–5. melléklet)', () => {
  it('TAN-008 homlokzati fal: 1,0 rossz; 0,5 gyenge; 0,25 közepes; 0,20 jó; 0,16 kiváló', () => {
    expect(szerkezetMinosites(1.0, 'homlokzati fal')).toBe('rossz');
    expect(szerkezetMinosites(0.5, 'homlokzati fal')).toBe('gyenge');
    expect(szerkezetMinosites(0.25, 'homlokzati fal')).toBe('kozepes');
    expect(szerkezetMinosites(0.2, 'homlokzati fal')).toBe('jo');
    expect(szerkezetMinosites(0.16, 'homlokzati fal')).toBe('kivalo');
  });
  it('TAN-008 pincefödém kiváló ≤ 0,2 (ELTERESEK_WINWATT E-05); tetősík ablak jó ≤ 1,3', () => {
    expect(szerkezetMinosites(0.2, 'pincefödém')).toBe('kivalo');
    expect(szerkezetMinosites(0.21, 'pincefödém')).toBe('jo');
    expect(szerkezetMinosites(1.3, 'tetősík ablakok')).toBe('jo');
    expect(szerkezetMinosites(1.1, 'tetősík ablakok')).toBe('kivalo');
  });
  it('TAN-008, D-012 a típuskód leképezése; ajtó és kapu: nincs osztály', () => {
    expect(minositesiSor('futott_tetoter_hatarolo')).toBe('magastető, lapostető');
    expect(minositesiSor('arkad_athajto_feletti_fodem')).toBe('pincefödém');
    expect(minositesiSor('ajto')).toBeNull();
    expect(minositesiSor('kapu')).toBeNull();
  });
  it('TAN-009 fűtési rendszer: 65% kiváló, 80% jó, 100% közepes, 120% gyenge, 131% rossz', () => {
    expect(rendszerMinosites(65, 'futes')).toBe('kivalo');
    expect(rendszerMinosites(80, 'futes')).toBe('jo');
    expect(rendszerMinosites(100, 'futes')).toBe('kozepes');
    expect(rendszerMinosites(120, 'futes')).toBe('gyenge');
    expect(rendszerMinosites(131, 'futes')).toBe('rossz');
  });
});
