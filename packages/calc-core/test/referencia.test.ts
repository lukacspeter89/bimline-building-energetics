// Referenciaépület – 9/2023 ÉKM 5. melléklet; rendszerminősítés – 176/2008 5. melléklet.
import { describe, expect, it } from 'vitest';
import { ErvenytelenBemenet, referenciaInfiltracio, rendszerMinositesiArany, uvegezesiAranyKorlat } from '../src/index.js';

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
