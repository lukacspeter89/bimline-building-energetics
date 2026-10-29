// Indikátorok – 9/2023 ÉKM 7. melléklet és számítási módszer, 1. Függelék 14. fejezet. Kézzel számolt értékek.
import { describe, expect, it } from 'vitest';
import {
  ErvenytelenBemenet,
  SzamitasiHiba,
  celSulyozottEnergia,
  exportSulyozottEnergia,
  fuetoertekEgeshoHanyados,
  osszesitettEnergetikaiJellemzo,
  sulyozoTenyezok,
} from '../src/index.js';

describe('Súlyozó tényezők és F_fé/éh', () => {
  it('IND-009 IND-010 7. melléklet: gáz 1,1/0/1,1/0,297; villamos 2,3/0,3/2,6/0,455', () => {
    expect(sulyozoTenyezok('fosszilis_gaz')).toEqual({ nren: 1.1, ren: 0, tot: 1.1, co2: 0.297 });
    expect(sulyozoTenyezok('villamos')).toEqual({ nren: 2.3, ren: 0.3, tot: 2.6, co2: 0.455 });
  });

  it('IND-013 távhő szolgáltatói tényezővel', () => {
    expect(sulyozoTenyezok('tavho_alapertelmezett', { nren: 0.8, ren: 0.3, tot: 1.1, co2: 0.2 }).nren).toBe(0.8);
    expect(() => sulyozoTenyezok('tavho_alapertelmezett', { nren: -1, ren: 0, tot: 0, co2: 0 })).toThrow(ErvenytelenBemenet);
  });

  it('IND-007 F_fé/éh: földgáz 0,9; olaj 0,94; villamos 1,0; biogáz megadandó (D-132)', () => {
    expect(fuetoertekEgeshoHanyados('fosszilis_gaz')).toBe(0.9);
    expect(fuetoertekEgeshoHanyados('fosszilis_folyekony')).toBe(0.94);
    expect(fuetoertekEgeshoHanyados('villamos')).toBe(1);
    expect(() => fuetoertekEgeshoHanyados('bio_gaz')).toThrow(SzamitasiHiba);
    expect(fuetoertekEgeshoHanyados('bio_gaz', 0.9)).toBe(0.9);
  });
});

describe('Súlyozott energia (14.1)–(14.14)', () => {
  it('IND-002 gázkazán: 1000 kWh égéshőn → 1000·0,9·1,1 + 100·2,3 = 1220 kWh nren', () => {
    const e = celSulyozottEnergia({ ho: [{ Qveg: 1000, hordozo: 'fosszilis_gaz' }], W: 100 });
    expect(e.sulyozott.nren).toBeCloseTo(1220, 9);
    expect(e.sulyozott.co2).toBeCloseTo(900 * 0.297 + 100 * 0.455, 9);
  });

  it('IND-027 IND-028 hőszivattyú: ε 0,25 → környezeti hő 2000·3 = 6000 kWh; ε 0,40 → nincs', () => {
    const e = celSulyozottEnergia({ ho: [{ Qveg: 2000, hordozo: 'villamos', hoszivattyuEps: 0.25 }], W: 0 });
    expect(e.kornyezetiHo).toBeCloseTo(6000, 9);
    expect(e.sulyozott.ren).toBeCloseTo(2000 * 0.3 + 6000, 9);
    expect(e.sulyozott.co2).toBeCloseTo(2000 * 0.455 + 6000 * 0.027, 9);
    expect(celSulyozottEnergia({ ho: [{ Qveg: 2000, hordozo: 'villamos', hoszivattyuEps: 0.4 }], W: 0 }).kornyezetiHo).toBe(0);
  });

  it('IND-014 IND-015 napelem export: 1000 kWh → nren 2300, ren −700 (levonandó)', () => {
    const e = exportSulyozottEnergia([{ Wexp: 1000, termelo: 'nap_pv', cel: 'export_halozatba' }]);
    expect(e.nren).toBeCloseTo(2300, 9);
    expect(e.ren).toBeCloseTo(-700, 9);
    expect(e.co2).toBeCloseTo(1000 * (0.455 - 0.074), 9);
  });

  it('IND-001 IND-018 IND-020 összesítés fajlagosan', () => {
    const r = osszesitettEnergetikaiJellemzo(
      { F: { ho: [{ Qveg: 1000, hordozo: 'fosszilis_gaz' }], W: 100 }, HMV: { ho: [{ Qveg: 500, hordozo: 'villamos' }], W: 0 } },
      [{ Wexp: 100, termelo: 'nap_pv', cel: 'export_halozatba' }],
      100,
    );
    expect(r.celonkent.F!.nren).toBeCloseTo(12.2, 9);
    expect(r.celonkent.HMV!.nren).toBeCloseTo(11.5, 9);
    expect(r.exp.nren).toBeCloseTo(2.3, 9);
    expect(r.fajlagos.nren).toBeCloseTo(12.2 + 11.5 - 2.3, 9);
    expect(() => osszesitettEnergetikaiJellemzo({}, [], 0)).toThrow(ErvenytelenBemenet);
  });
});
