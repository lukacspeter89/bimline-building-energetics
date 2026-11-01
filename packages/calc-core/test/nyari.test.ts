// Nyári hőterhelés – egyszerűsített óránkénti mérleg (D-150), méretezési nap az F-05-ből.
import { describe, expect, it } from 'vitest';
import { meretezesiHomerseklet, meretezesiSugarzas, nedvessegtartalom, nyariHoterheles, telitesiGoznyomas } from '../src/index.js';

describe('Méretezési nap (F-05, 07.14.)', () => {
  it('NYH-001 a lefutás a 38 °C-os csúcsra eltolva: 12 órakor 38, éjfélkor 23,3 + 3,9 = 27,2 °C', () => {
    const t = meretezesiHomerseklet(38);
    expect(t).toHaveLength(24);
    expect(t[12]).toBeCloseTo(38, 12);
    expect(t[0]).toBeCloseTo(27.2, 12);
    expect(Math.max(...t)).toBeCloseTo(38, 12);
  });

  it('NYH-002 sugárzás 12 órakor: D 90° 400,9; É 90° 202,7; vízszintes 672,1; D 35° → 30°-os oszlop 711,4', () => {
    expect(meretezesiSugarzas(12, 'D', 90)).toBe(400.9);
    expect(meretezesiSugarzas(12, 'É', 90)).toBe(202.7);
    expect(meretezesiSugarzas(12, undefined, 0)).toBe(672.1);
    expect(meretezesiSugarzas(12, 'D', 35)).toBe(711.4);
  });

  it('NYH-007 telítési gőznyomás 38 °C-on 66,156 hPa; x(38 °C, 45 %) = 18,828 g/kg; x(26 °C, 50 %) = 10,466 g/kg', () => {
    expect(telitesiGoznyomas(38)).toBeCloseTo(66.1558, 3);
    expect(nedvessegtartalom(38, 45)).toBeCloseTo(18.8281, 3);
    expect(nedvessegtartalom(26, 50)).toBeCloseTo(10.4657, 3);
  });
});

describe('Óránkénti hőmérleg', () => {
  it('NYH-003 … NYH-006 déli fal 10 m² U 0,2 + ablak 2 m² (A_ü 1,5, g⊥ 0,5) U 1,0; q 30 m³/h; belső 100 W: 12 órakor 541,01 W, csúcs 13 órakor', () => {
    // 12 óra: ΔT = 38 − 26 = 12 K; Q_tr = (2 + 2)·12 = 48 W; Q_sug = 1,5·0,9·0,5·400,9 = 270,61 W;
    // Q_szell = 0,34·30·12 = 122,4 W; Q_belső = 100 W → 541,01 W.
    const r = nyariHoterheles({
      elemek: [
        { A: 10, U: 0.2, tajolas: 'D', hajlasszog: 90 },
        { A: 2, U: 1.0, tajolas: 'D', hajlasszog: 90, atlatszo: { Au: 1.5, gN: 0.5 } },
      ],
      thetaI: 26,
      qV: 30,
      belso: 100,
      thetaEcsucs: 38,
      rhE: 45,
    });
    const d = r.orai[12]!;
    expect(d.transzmisszio).toBeCloseTo(48, 9);
    expect(d.napsugarzas).toBeCloseTo(270.6075, 9);
    expect(d.szellozes).toBeCloseTo(122.4, 9);
    expect(d.erzekelheto).toBeCloseTo(541.0075, 9);
    // A csúcs az órai értékek maximuma (itt 13 óra: a déli sugárzás nagyobb, a hőmérséklet 37,3 °C).
    expect(r.csucs.erzekelheto).toBe(Math.max(...r.orai.map((x) => x.erzekelheto)));
    expect(r.csucs.ora).toBe(13);
    expect(r.csucsLatens).toBe(0);
  });

  it('NYH-007 látens: 30 m³/h, kint 38 °C / 45 %, bent 26 °C / 50 % → 212,05 W a csúcsórában', () => {
    const r = nyariHoterheles({ elemek: [], thetaI: 26, qV: 30, belso: 0, thetaEcsucs: 38, rhE: 45, rhI: 50 });
    expect(r.orai[12]!.latens).toBeCloseTo(212.0529, 3);
  });
});
