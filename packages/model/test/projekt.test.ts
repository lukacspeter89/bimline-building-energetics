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
  // A minták a rendelet szerint számolnak: csatlakozási hőhidak ζ-val (a WinWatt-golden dU_tb = 0, W-01).
  it('TAN-005 G1: Q_F,net 4608,0 kWh/év; B2023; E_nren 95,58; A/V 1,157', () => {
    const e = eredmeny('G1');
    expect(e.QFnet).toBeCloseTo(4607.96, 1);
    expect(e.av).toBeCloseTo(1.157, 3);
    expect(e.besorolasEp).toBe('B2023');
    expect(e.Ep).toBeCloseTo(95.58, 2);
    expect(e.futesMinosites.minosites).toBe('kozepes');
    expect(e.hmvMinosites.minosites).toBe('jo');
    // KOV-031: WinWatt 0,450 > 0,3 – nem teljesül
    expect(e.nyariHovedelem.arany).toBeCloseTo(0.45, 3);
    expect(e.nyariHovedelem.megfelel).toBe(false);
  });

  it('TAN-005 MEG-004 G2: A+++2023; napelem 4320 kWh/év; E_nren −1,32', () => {
    const e = eredmeny('G2');
    expect(e.besorolasEp).toBe('A+++2023');
    expect(e.vegso.find((v) => v.cel === 'PV')!.Q).toBe(4320);
    expect(e.Ep).toBeCloseTo(-1.32, 2);
  });

  it('TAN-005 LT-041 LT-051 HUT-001 G3: A+2023; ventilátor 129,6·150/(3600·0,40)·8,76 = 118,26 kWh/év; hűtés villamos', () => {
    const e = eredmeny('G3');
    expect(e.besorolasEp).toBe('A+2023');
    expect(e.vegso.find((v) => v.cel === 'LT')!.W).toBeCloseTo(118.26, 2);
    expect(e.vegso.some((v) => v.cel === 'H')).toBe(true);
    expect(e.Ep).toBeCloseTo(60.78, 2);
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

  it('HT-088 a talajon fekvő padló 0 kitett kerületét a beviteli ellenőrzés jelzi (nem a számítás dobja)', () => {
    const p = goldenProjekt('G1');
    const padlo = p.helyisegek.flatMap((h) => h.hatarolok).find((b) => b.tuloldal.fajta === 'talaj')!;
    padlo.kitettKerulet = 0;
    const h = ellenoriz(p).filter((x) => x.sulyossag === 'hiba');
    expect(h.some((x) => x.uzenet.includes('kitett kerülete'))).toBe(true);
  });

  it('a feltételezett (nem termékadatlapos) anyagot figyelmeztetésként jelzi', () => {
    const f = ellenoriz(goldenProjekt('G1')).filter((h) => h.sulyossag === 'figyelmeztetés');
    expect(f.some((h) => h.uzenet.startsWith('Feltételezett érték'))).toBe(true);
    expect(ellenoriz(goldenProjekt('G3')).some((h) => h.uzenet.includes('10.8. táblázat'))).toBe(true);
  });
});

describe('Talajjal érintkező szerkezetek a modellben', () => {
  it('HT-088 D-140 a B a teljes padlóra számít: a padlót két határolóra bontva ugyanaz a H_tr,T', () => {
    const p = goldenProjekt('G1');
    const hs = p.helyisegek[0]!;
    const padlo = hs.hatarolok.find((b) => b.tuloldal.fajta === 'talaj')!;
    hs.hatarolok.push({ ...structuredClone(padlo), azon: 'padlo-2', felulet: padlo.felulet / 2, kitettKerulet: padlo.kitettKerulet! / 2 });
    padlo.felulet /= 2;
    padlo.kitettKerulet! /= 2;
    const k = szamolProjekt(p);
    if (!k.rendben) throw new Error(JSON.stringify(k.hianyok));
    expect(k.eredmeny.hTrT).toBeCloseTo(eredmeny('G1').hTrT, 9);
  });

  it('HT-103 HT-104 TR-021 fűtött pince z = 2,5 m: U_T,p 0,1522; U_T,pf 0,2272 (d_pf < d_p); ΔH_tr,T = +21,18 W/K', () => {
    // Kézi számítás: R_p = 4,4026; d_p = 0,47 + 2,0·(0,17 + 4,4026 + 0,04) = 9,6952 m; B = 96/(0,5·40) = 4,8 m;
    // d_p + 0,5z ≥ B → (4.23): U = 2,0/(0,457·4,8 + 10,9452) = 0,15222 (z = 0-nál 0,16823).
    // Pincefal: R_pf = 0,10/0,035 + 0,30/1,55 = 3,0507; d_pf = 2,0·(0,13 + 3,0507 + 0,04) = 6,4414 m < d_p;
    // (4.28): U_T,pf = 4/(π·2,5)·(1 + 0,5·6,4414/8,9414)·ln(2,5/6,4414 + 1) = 0,22718.
    // ΔH = 96·(0,15222 − 0,16823) + 2,5·40·0,22718 = 21,182 W/K.
    const p = goldenProjekt('G1');
    p.anyagok.push({ azon: 'eps-l', nev: 'Lábazati XPS', lambda: 0.035, forras: { tipus: 'feltevés', indoklas: 'teszt' } });
    p.retegrendek.push({ azon: 'pf', nev: 'PF1 pincefal', szerkezet: 'talajjal_erintkezo_fal', retegek: [{ anyagAzon: 'eps-l', d: 0.1 }, { anyagAzon: 'a-Vasbeton', d: 0.3 }] });
    const padlo = p.helyisegek[0]!.hatarolok.find((b) => b.tuloldal.fajta === 'talaj')!;
    padlo.melyseg = 2.5;
    expect(ellenoriz(p).some((h) => h.sulyossag === 'hiba' && h.uzenet.includes('pincefal rétegrendje'))).toBe(true);
    padlo.pinceFalRetegrendAzon = 'pf';
    const k = szamolProjekt(p);
    if (!k.rendben) throw new Error(JSON.stringify(k.hianyok));
    expect(k.eredmeny.hTrT - eredmeny('G1').hTrT).toBeCloseTo(21.1819, 3);
    const fal = k.eredmeny.szerkezetek.find((s) => s.nev === 'PF1 pincefal')!;
    expect(fal.A).toBeCloseTo(100, 9);
    expect(fal.U).toBeCloseTo(0.22718, 4);
    expect(fal.Umax).toBe(0.3);
    expect(fal.megfelel).toBe(true);
  });

  it('HT-096 0,5 m-en belüli mélység: nincs pincefal, a padló z = 0-val számít', () => {
    const p = goldenProjekt('G1');
    p.helyisegek[0]!.hatarolok.find((b) => b.tuloldal.fajta === 'talaj')!.melyseg = 0.4;
    const k = szamolProjekt(p);
    if (!k.rendben) throw new Error(JSON.stringify(k.hianyok));
    expect(k.eredmeny.hTrT).toBeCloseTo(eredmeny('G1').hTrT, 9);
  });

  it('HT-098 HT-099 terepszint feletti padló m = 0,8 m, lábazat = R1 fal: U_p 0,2168; U_lf 0,1763; U_T,p 0,16461', () => {
    // Kézi számítás: U_p = 1/(0,17 + 4,4026 + 0,04) = 0,21680; U_lf = 1/(0,13 + 5,5010 + 0,04) = 0,17634; d_lf = 0,47 m; B = 4,8 m;
    // (4.25) U_talaj = 4/(π·4,8 + 1,27)·ln(π·4,8/1,27 + 1) = 0,62514; (4.26) U_T,lf = 2·0,8·0,17634/4,8 = 0,05878;
    // (4.24) U_T,p = 1/(1/0,21680 + 1/0,68392) = 0,16461 (talajon fekvőként 0,16823): ΔH = 96·(−0,00362) = −0,3466 W/K.
    const p = goldenProjekt('G1');
    const padlo = p.helyisegek[0]!.hatarolok.find((b) => b.tuloldal.fajta === 'talaj')!;
    padlo.melyseg = -0.8;
    expect(ellenoriz(p).some((h) => h.sulyossag === 'hiba' && h.uzenet.includes('lábazati fal'))).toBe(true);
    padlo.labazatiFalRetegrendAzon = 'r-R1./ Külső fal';
    const k = szamolProjekt(p);
    if (!k.rendben) throw new Error(JSON.stringify(k.hianyok));
    expect(k.eredmeny.szerkezetek.find((s) => s.szerkezet === 'talajon_fekvo_padlo')!.U).toBeCloseTo(0.164615, 5);
    expect(k.eredmeny.hTrT - eredmeny('G1').hTrT).toBeCloseTo(-0.34658, 4);
  });

  it('a talajjal érintkező falat önálló határolóként nem fogadja el (a (6.6) z·P-vel számol)', () => {
    const p = goldenProjekt('G1');
    p.retegrendek.push({ azon: 'pf', nev: 'PF1', szerkezet: 'talajjal_erintkezo_fal', retegek: [{ anyagAzon: 'a-Vasbeton', d: 0.3 }] });
    p.helyisegek[0]!.hatarolok.push({ azon: 'x', retegrendAzon: 'pf', tuloldal: { fajta: 'talaj' }, felulet: 10, nyilasok: [] });
    expect(ellenoriz(p).some((h) => h.sulyossag === 'hiba' && h.uzenet.includes('nem önálló határoló'))).toBe(true);
  });
});
