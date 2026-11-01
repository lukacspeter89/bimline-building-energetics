// Szellőzés és hűtés – 9/2023 ÉKM számítási módszer, 1. Függelék 10–11. fejezet. Kézzel számolt értékek.
import { describe, expect, it } from 'vitest';
import {
  ErvenytelenBemenet,
  hutesSzabalyozasiTenyezo,
  hutesiRendszer,
  hutesiTeljesitmenyTenyezo,
  illesztesiVeszteseg,
  latensTenyezo,
  legtechnikaiRendszer,
  ventilatorEnergia,
  ventilatorEnergiaErP,
  ventilatorOsszhatasfok,
} from '../src/index.js';

describe('Szellőzés (10. fejezet)', () => {
  it('LT-041 ventilátor (10.20): 129,6 m³/h, 150 Pa, η 0,5, 5088 h → 54,95 kWh/év', () => {
    expect(ventilatorEnergia({ VLT: 129.6, dpLT: 150, etaVent: 0.5, tLTa: 5088 })).toBeCloseTo(54.9504, 4);
    expect(() => ventilatorEnergia({ VLT: 100, dpLT: 150, tLTa: 9000 })).toThrow(ErvenytelenBemenet);
  });

  it('LT-051 ventilátor-összhatásfok alapértéke a 10.8. táblázatból', () => {
    expect(ventilatorOsszhatasfok(500)).toBe(0.4);
    expect(ventilatorOsszhatasfok(1000)).toBe(0.55);
    expect(ventilatorOsszhatasfok(10000)).toBe(0.7);
    expect(ventilatorEnergia({ VLT: 100, dpLT: 144, tLTa: 1000 })).toBeCloseTo((100 * 144) / (3600 * 0.4), 9);
  });

  it('LT-033 … LT-036 ErP lakásszellőző (10.17): 100 m³/h · 1,1 · 0,0003 · 8760 / 1,5^1,2', () => {
    const w = ventilatorEnergiaErP({
      VLT: 100,
      SPI: 0.0003,
      tLTa: 8760,
      legcsatorna: 'Légcsatornával ellátott berendezés',
      vezerles: 'Központi igényvezérlés',
      motor: '2 fokozatú',
    });
    expect(w).toBeCloseTo((100 * 1.1 * 0.0003 * 8760) / 1.5 ** 1.2, 9);
  });

  it('LT-044 f_LT: 20 °C alatt 0; felette helyiségenkénti szabályozással 5 %; pontosan 20 °C nem besorolható', () => {
    expect(illesztesiVeszteseg(18)).toBe(0);
    expect(illesztesiVeszteseg(35, 'Helyiségenkénti szabályozás')).toBe(0.05);
    expect(() => illesztesiVeszteseg(20)).toThrow(ErvenytelenBemenet);
  });

  it('LT-039 LT-042 utófűtés és ventilátorok összegzése', () => {
    const e = legtechnikaiRendszer({ QUFfriss: 1000, Qrecirk: 200, fLT: 0.1, Qlcs: 50, epsUF: 1.1, Wvent: [50, 20], WLTs: 5 });
    expect(e.QUF).toBeCloseTo((1200 * 1.1 + 50) * 1.1, 9);
    expect(e.WLT).toBe(75);
  });
});

describe('Hűtés (11. fejezet)', () => {
  it('HUT-009 HUT-011 HUT-012 HUT-017 táblázati értékek', () => {
    expect(hutesiTeljesitmenyTenyezo({ hutogep: 'Kompresszoros léghűtés (split)' })).toBe(0.4);
    expect(hutesiTeljesitmenyTenyezo({ SEER: 4 })).toBe(0.25);
    expect(latensTenyezo('Közvetlen elpárologtatós rendszer (5 oC)')).toBe(1.45);
    expect(hutesSzabalyozasiTenyezo('Direkt elpárologtatás')).toBe(1.13);
  });

  it('HUT-001 HUT-008 HUT-015 split: 292,53 · 1,45 · 1,13 · 1 · 0,40 = 191,7 kWh/év; W = 0', () => {
    const e = hutesiRendszer({ QHnet: 292.53, cH: 1.45, epsSzab: 1.13, epsH: 0.4 });
    expect(e.QHveg).toBeCloseTo(292.53 * 1.45 * 1.13 * 0.4, 9);
    expect(e.WHveg).toBe(0);
  });
});
