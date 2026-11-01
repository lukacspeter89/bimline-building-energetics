// Golden G1: referenciaépület és referencia épülettechnikai rendszer (9/2023 ÉKM 5. melléklet), rendszerminősítés.
import { describe, expect, it } from 'vitest';
import {
  HONAPOK,
  ejszakaiTobbletSzellozes,
  referenciaFutes,
  referenciaHmv,
  referenciaInfiltracio,
  referenciaNettoEnergiaigeny,
  referenciaZona,
  rendszerMinosites,
  rendszerMinositesiArany,
  termeszetesSzellozes,
  type ReferenciaHatarolo,
} from '../../src/index.js';
import { TAJOLAS, ablakU, betolt, zonaEpit } from './epito.js';

const { be } = betolt('G1');
const { zona } = zonaEpit(be, { labazatiFal: 'Lábazati fal a terepszint alatt 0,5 m-ig hőszigetelt', cmKategoria: 3 });
const AN = be.heated_area;
/** G1_tanusitvany.pdf, 6–8. o. */
const WW = { QFnet: 3912, EFnren: 4675.8, EFnrenRef: 5385.9, EHMVnren: 3791.3, EHMVnrenRef: 4525.8 };

describe('Referencia épülettechnikai rendszer (5. melléklet 2.) – G1', () => {
  it('REF-015 a WinWatt referencia-HMV-je (elosztás fűtött téren kívül, cirkulációval) a programmal pontosan számolható: 4525,8 kWh/év', () => {
    expect(referenciaHmv({ QHMVnet: 2400, aRszr: AN, elosztasHelye: 'futott_teren_kivul' }).sulyozott.nren).toBeCloseTo(WW.EHMVnrenRef, 0);
  });

  it('REF-014 a WinWatt referenciafűtése (kazán és elosztás a fűtött téren kívül, a tárgyi Q_F,net-tel) pontosan számolható: 5385,9 kWh/év', () => {
    const r = referenciaFutes({ QFnet: WW.QFnet, aRszr: AN, hotermeloHelye: 'futott_teren_kivul', elosztasHelye: 'futott_teren_kivul', hoeladokSzama: 10 });
    expect(r.sulyozott.nren).toBeCloseTo(WW.EFnrenRef, 0);
  });

  it('REF-014 REF-015 E-18 a rendelet szerint a hőtermelő helye és a nyomvonal a tárgyi épületé (G1: fűtött térben)', () => {
    const f = referenciaFutes({ QFnet: WW.QFnet, aRszr: AN, hotermeloHelye: 'futott_terben', elosztasHelye: 'futott_terben', hoeladokSzama: 10 });
    // (3912·1,012 + 2,10·96)·1,01·0,9·1,1 + (0,79 + 1,44)·96·2,3
    expect(f.sulyozott.nren).toBeCloseTo((3912 * 1.012 + 2.1 * 96) * 1.01 * 0.99 + 2.23 * 96 * 2.3, 6);
    const h = referenciaHmv({ QHMVnet: 2400, aRszr: AN, elosztasHelye: 'futott_terben' });
    // 2400·(1 + 0,24 + 0,24)·1,17·0,99 + (0,30 + 1,06)·96·2,3
    expect(h.sulyozott.nren).toBeCloseTo(2400 * 1.48 * 1.17 * 0.99 + 1.36 * 96 * 2.3, 6);
    expect(rendszerMinosites(rendszerMinositesiArany(WW.EHMVnren, h.sulyozott.nren), 'hmv')).toBe('jo');
  });
});

describe('Referenciaépület (5. melléklet 1.) – G1', () => {
  const h = be.rooms[0]!;
  const hatarolok: ReferenciaHatarolo[] = [];
  for (const fal of h.walls) {
    let nyilas = 0;
    for (const [x, y, db] of h.windows[fal.side] ?? []) {
      const a = ablakU(be, x, y);
      hatarolok.push({ kod: 'ablak_fa_pvc', A: x * y * db, tajolas: TAJOLAS[fal.side], transzparens: { fKeret: 1 - a.Au / (x * y), fArny: { F: 1, H: 1 } } });
      nyilas += x * y * db;
    }
    if (h.door && h.door[0] === fal.side) {
      hatarolok.push({ kod: 'ajto', A: h.door[1] * h.door[2], tajolas: TAJOLAS[fal.side] });
      nyilas += h.door[1] * h.door[2];
    }
    // Feltevés: a WinWatt referencia-adatlapja szerint erősen hőhidas (a csatlakozási élhosszak a bemenetben nincsenek meg).
    hatarolok.push({
      kod: 'homlokzati_fal',
      A: fal.A - nyilas,
      tajolas: TAJOLAS[fal.side],
      hohid: { szerkezet: 'Külső falak', alcsoport: 'külső oldali, vagy szerkezeten belüli megszakítatlan hőszigeteléssel', hohidassag: 'erősen hőhidas' },
    });
  }
  hatarolok.push({ kod: 'lapos_teto', A: h.roof!.A, hohid: { szerkezet: 'Lapostetők', hohidassag: 'erősen hőhidas' } });
  const nFilt = referenciaInfiltracio(true);
  const hSz = termeszetesSzellozes(0.5, 1, nFilt, zona.V);
  const ej = { zajPorRendben: true, nincsVagyonvedelmiKockazat: true, automatikusNyitasVagyLako: true };
  const ref = referenciaZona(
    { targy: zona, hatarolok, talajonFekvoPadloA: h.floor!.A, ujEpulet: true },
    { F: hSz, H: HONAPOK.map((m) => hSz + ejszakaiTobbletSzellozes(m, 6, zona.V, ej)) },
  );
  const e = referenciaNettoEnergiaigeny(ref, true);

  it('REF-007 … REF-011 referencia-H: fal 0,24·1,3; tető 0,17·1,2; ablak 1,1; ajtó 1,4; padló 96·0,3; n_filt 0,06; g 0,55', () => {
    const fal = 0.24 * 1.3 * (29.22 + 20.16 + 23.4 + 20.16);
    expect(ref.hTrD.F).toBeCloseTo(fal + 0.17 * 1.2 * 96 + 1.1 * 12.96 + 1.4 * 2.1, 6);
    expect(ref.hTrT).toBeCloseTo(28.8, 9);
    expect(nFilt).toBe(0.06);
    expect(ref.transzparens.every((t) => t.gN === 0.55)).toBe(true);
  });

  it('REF-013 TAN-009 E-18 rendszerminősítés a referenciaépület nettó igényével: fűtés (E/Q)/(E_REF/Q_REF)', () => {
    const f = referenciaFutes({ QFnet: e.QFnetEv, aRszr: AN, hotermeloHelye: 'futott_terben', elosztasHelye: 'futott_terben', hoeladokSzama: 10 });
    const arany = rendszerMinositesiArany(WW.EFnren, f.sulyozott.nren, WW.QFnet, e.QFnetEv);
    expect(e.QFnetEv).toBeGreaterThan(WW.QFnet);
    // Q_F,net,REF ≈ 6141 kWh/év (σ_F = 1, τ > 24 h); arány ≈ 106,3 % → „gyenge”. A WinWatt 86,8 %-ot („jó”) ad (E-18).
    expect(e.QFnetEv).toBeCloseTo(6140.66, 1);
    expect(arany).toBeCloseTo(106.25, 1);
    expect(rendszerMinosites(arany, 'futes')).toBe('gyenge');
  });
});
