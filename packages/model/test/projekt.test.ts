// A projekt-adatmodell teljes számítási lánca a golden esetekkel (ugyanazok az értékek, mint a calc-core golden
// tesztjeiben és a bemutatóban).
import { describe, expect, it } from 'vitest';
import { ellenoriz, szamolProjekt, type ProjektEredmeny } from '../src/index.js';
import { goldenProjekt } from './goldenAtalakito.js';

const eredmeny = (eset: 'G1' | 'G2' | 'G3'): ProjektEredmeny => {
  const k = szamolProjekt(goldenProjekt(eset));
  if (!k.rendben) throw new Error(JSON.stringify(k.hianyok));
  return k.eredmeny;
};

describe('Projekt-adatmodell – golden esetek', () => {
  it('TAN-005 G1: Q_F,net 4046,5 kWh/év; B2023; E_nren 89,63; A/V 1,157', () => {
    const e = eredmeny('G1');
    expect(e.QFnet).toBeCloseTo(4046.51, 1);
    expect(e.av).toBeCloseTo(1.157, 3);
    expect(e.besorolasEp).toBe('B2023');
    expect(e.Ep).toBeCloseTo(89.63, 2);
    expect(e.futesMinosites.minosites).toBe('gyenge');
    expect(e.hmvMinosites.minosites).toBe('jo');
    // KOV-031: WinWatt 0,450 > 0,3 – nem teljesül
    expect(e.nyariHovedelem.arany).toBeCloseTo(0.45, 3);
    expect(e.nyariHovedelem.megfelel).toBe(false);
  });

  it('TAN-005 MEG-004 G2: A+++2023; napelem 4320 kWh/év; E_nren −4,31', () => {
    const e = eredmeny('G2');
    expect(e.besorolasEp).toBe('A+++2023');
    expect(e.vegso.find((v) => v.cel === 'PV')!.Q).toBe(4320);
    expect(e.Ep).toBeCloseTo(-4.31, 2);
  });

  it('TAN-005 LT-041 HUT-001 G3: A+2023; ventilátor 54,95 kWh/év; hűtés villamos', () => {
    const e = eredmeny('G3');
    expect(e.besorolasEp).toBe('A+2023');
    expect(e.vegso.find((v) => v.cel === 'LT')!.W).toBeCloseTo(54.95, 2);
    expect(e.vegso.some((v) => v.cel === 'H')).toBe(true);
    expect(e.Ep).toBeCloseTo(56.5, 1);
  });

  it('KOV-020 szerkezetek az elemi követelménnyel: fal 0,176 ≤ 0,24; ablak méretenként súlyozott U', () => {
    const e = eredmeny('G1');
    const fal = e.szerkezetek.find((s) => s.szerkezet === 'homlokzati_fal')!;
    expect(fal.U).toBeCloseTo(0.1763, 4);
    expect(fal.Umax).toBe(0.24);
    expect(fal.megfelel).toBe(true);
    expect(e.szerkezetek.find((s) => s.nev === 'Ablak')!.U).toBeCloseTo((9 * 0.70873 + 2.88 * 0.73322 + 1.08 * 0.75319) / 12.96, 3);
  });
});

describe('Ellenőrzés', () => {
  it('a hiányzó adatokat számítás előtt jelzi, helymegjelöléssel', () => {
    const p = goldenProjekt('G1');
    p.helyisegek[0]!.hatarolok[0]!.nyilasok.push({ nyilaszaroAzon: 'nincs', szelesseg: 50, magassag: 3, db: 1 });
    p.anyagok[0]!.lambda = 0;
    const k = szamolProjekt(p);
    expect(k.rendben).toBe(false);
    const uzenetek = !k.rendben ? k.hianyok.map((h) => h.uzenet) : [];
    expect(uzenetek.some((u) => u.includes('típusa nincs meg'))).toBe(true);
    expect(uzenetek.some((u) => u.includes('nagyobbak a határolónál'))).toBe(true);
    expect(uzenetek.some((u) => u.includes('hővezetési tényező'))).toBe(true);
  });

  it('a feltételezett (nem termékadatlapos) anyagot és a kikapcsolt hőhíd-korrekciót figyelmeztetésként jelzi', () => {
    const f = ellenoriz(goldenProjekt('G1')).filter((h) => h.sulyossag === 'figyelmeztetés');
    expect(f.some((h) => h.uzenet.startsWith('Feltételezett érték'))).toBe(true);
    expect(f.some((h) => h.uzenet.includes('hőhidak'))).toBe(true);
  });
});
