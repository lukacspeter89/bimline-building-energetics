// Referenciaépület – 9/2023 ÉKM 5. melléklet; rendszerminősítés – 176/2008 5. melléklet.
import { describe, expect, it } from 'vitest';
import {
  ErvenytelenBemenet,
  referenciaGepiSzellozesF,
  referenciaHutes,
  referenciaInfiltracio,
  rendszerMinositesiArany,
  uvegezesiAranyKorlat,
} from '../src/index.js';

describe('Referenciaépület', () => {
  it('REF-006 üvegezési arány: 70 %-os déli homlokzat → 50 %, a különbözet a falhoz kerül', () => {
    const ki = uvegezesiAranyKorlat([
      { kod: 'ablak_fa_pvc', A: 70, tajolas: 'D', transzparens: { fKeret: 0.3 } },
      { kod: 'homlokzati_fal', A: 30, tajolas: 'D' },
      { kod: 'homlokzati_fal', A: 50, tajolas: 'É' },
    ]);
    expect(ki[0]!.A).toBeCloseTo(50, 12);
    expect(ki[1]!.A).toBeCloseTo(50, 12);
    expect(ki[2]!.A).toBe(50);
  });

  it('REF-006 60° alatti hajlásszögnél 30 % a korlát; korlát alatt nincs változás', () => {
    const ki = uvegezesiAranyKorlat([
      { kod: 'tetosik_ablak', A: 40, tajolas: 'D', hajlasszog: 45, transzparens: { fKeret: 0.3 } },
      { kod: 'futott_tetoter_hatarolo', A: 60, tajolas: 'D', hajlasszog: 45 },
      { kod: 'ablak_fa_pvc', A: 10, tajolas: 'K', transzparens: { fKeret: 0.3 } },
      { kod: 'homlokzati_fal', A: 40, tajolas: 'K' },
    ]);
    expect(ki[0]!.A).toBeCloseTo(30, 12);
    expect(ki[2]!.A).toBe(10);
  });

  it('REF-010 jó légzárás: egy homlokzat 0,03, több homlokzat 0,06 1/h', () => {
    expect(referenciaInfiltracio(false)).toBe(0.03);
    expect(referenciaInfiltracio(true)).toBe(0.06);
  });

  it('TAN-009 rendszerminősítési arány: fűtésnél a nettó igényre vetítve, HMV-nél közvetlenül', () => {
    expect(rendszerMinositesiArany(1000, 1250)).toBeCloseTo(80, 12);
    expect(rendszerMinositesiArany(1000, 1500, 4000, 5000)).toBeCloseTo(((1000 / 4000) / (1500 / 5000)) * 100, 12);
    expect(() => rendszerMinositesiArany(1, 0)).toThrow(ErvenytelenBemenet);
  });
});

describe('Referencia szellőzés és hűtés', () => {
  it('REF-016 REF-017 hővisszanyerő 50 %: 0,35·(129,6·0,5 + 0,06·259,2)', () => {
    expect(referenciaGepiSzellozesF(129.6, 0.06, 259.2)).toBeCloseTo(0.35 * (64.8 + 15.552), 9);
  });

  it('REF-018 egyéb rendeltetés, levegő–víz 120 kW → SEER 3,8; 6/12 °C fan coil; lakóépületnél nincs referencia-hűtés', () => {
    const r = referenciaHutes({ lakoVagySzallas: false, QHnet: 10000, hutogep: 'Komfort hűtőgép (levegő–víz)', PnevlegesKW: 120, WsegTargy: 50 })!;
    expect(r.Qveg).toBeCloseTo((10000 * 1.25 * 1.13) / 3.8, 9);
    expect(r.sulyozott.nren).toBeCloseTo(((10000 * 1.25 * 1.13) / 3.8 + 50) * 2.3, 9);
    expect(referenciaHutes({ lakoVagySzallas: false, QHnet: 1, hutogep: 'Komfort hűtőgép (víz–víz)', PnevlegesKW: 1500, WsegTargy: 0 })!.Qveg).toBeCloseTo((1.25 * 1.13) / 6.33, 12);
    expect(referenciaHutes({ lakoVagySzallas: true, QHnet: 1, hutogep: 'Komfort hűtőgép (levegő–víz)', PnevlegesKW: 5, WsegTargy: 0 })).toBeNull();
  });
});
