// Méretezési hőterhelés – MSZ EN 12831-1:2017 (F-12, F-13). Kézzel számolt példák.
import { describe, expect, it } from 'vitest';
import {
  ErvenytelenBemenet,
  ReszletesModszerSzukseges,
  befujtHomerseklet,
  belsoMeretezesiHomerseklet,
  egyenertekuUTalaj,
  epuletHoterheles,
  fajlagosHotarolo,
  felfutesiTobblet,
  futetlenF1,
  helyisegHoterheles,
  helyisegZonaArany,
  hohidPotlek,
  holeadoJellemzo,
  homersekletKorrekcio,
  homlokzatszamTenyezo,
  idoallando,
  kulsoMeretezesiHomerseklet,
  legatereszto,
  legatereszto50,
  magasFeluletiHomerseklet,
  magasLeghomerseklet,
  minimalisLegcsere,
  szellozesAltalanos,
  talajGeometria,
  terfogataramTenyezo,
  transzmisszio,
} from '../src/index.js';

describe('MSZ EN 12831-1 B melléklet alapértékei', () => {
  it('HL-030 HL-031 HL-033 HL-034 HL-035 HL-036 HL-038 HL-039 táblázatok', () => {
    expect([hohidPotlek('uj_igazolt'), hohidPotlek('uj_altalanos'), hohidPotlek('belso_szigeteles'), hohidPotlek('egyeb')]).toEqual([0.02, 0.05, 0.15, 0.1]);
    expect(futetlenF1('padlas_szigetelt')).toBe(0.7);
    expect(futetlenF1('pince_nyilas_nelkul')).toBe(0.5);
    expect([fajlagosHotarolo('alacsony'), fajlagosHotarolo('kozepes_magas')]).toEqual([15, 50]);
    expect([helyisegZonaArany(1), helyisegZonaArany(2), helyisegZonaArany(7)]).toEqual([1, 0.5, 0.5]);
    expect([legatereszto('I'), legatereszto('II'), legatereszto('III'), legatereszto('IV')]).toEqual([2, 3, 6, 12]);
    expect([minimalisLegcsere('allando'), minimalisLegcsere('vizes_ablakos'), minimalisLegcsere('mellek_belso')]).toEqual([0.5, 0.5, 0]);
    expect([homlokzatszamTenyezo(false), homlokzatszamTenyezo(true)]).toEqual([12, 8]);
    expect([belsoMeretezesiHomerseklet('lakas'), belsoMeretezesiHomerseklet('furdo'), belsoMeretezesiHomerseklet('aruhaz')]).toEqual([20, 24, 16]);
  });

  it('HL-037 f_qv,z: egy homlokzat 0,03; több, normál árnyékolás, Δh ≤ 5 m 0,05; szabad terület 0,07; 50 m felett 0,09; Δh 12 m 0,08', () => {
    expect(terfogataramTenyezo({ tobbHomlokzat: false, hgz: 3, arnyekoltsag: 'normal', dhz: 3 })).toBe(0.03);
    expect(terfogataramTenyezo({ tobbHomlokzat: true, hgz: 3, arnyekoltsag: 'normal', dhz: 5 })).toBe(0.05);
    expect(terfogataramTenyezo({ tobbHomlokzat: true, hgz: 3, arnyekoltsag: 'nincs', dhz: 4 })).toBe(0.07);
    expect(terfogataramTenyezo({ tobbHomlokzat: true, hgz: 60, arnyekoltsag: 'normal', dhz: 4 })).toBe(0.09);
    expect(terfogataramTenyezo({ tobbHomlokzat: true, hgz: 10, arnyekoltsag: 'intenziv', dhz: 12 })).toBe(0.08);
  });

  it('HL-032 radiátor G 1,0; felületfűtés G 0,2, Δθ_rad 1,5, Δθ_surf 1,5', () => {
    expect(holeadoJellemzo('radiator')).toEqual({ Gair: 1, dTrad: 0, dTsurf: { padlo: 0, fal: 0, menny: 0 } });
    expect(holeadoJellemzo('feluletfutes').dTsurf.padlo).toBe(1.5);
  });
});

describe('Transzmisszió (6.3.2)', () => {
  it('HL-005 f_1 + f_2: szomszéd 24 °C, θ_int 20, θ_e −13 → −4/33; f_1 közvetlenül; θ_int = θ_e hiba', () => {
    expect(homersekletKorrekcio({ thetaInt: 20, thetaE: -13, thetaX: 24 })).toBeCloseTo(-4 / 33, 12);
    expect(homersekletKorrekcio({ thetaInt: 20, thetaE: -13, f1: 0.7, thetaStarK: 23.3 })).toBeCloseTo(0.7 + 3.3 / 33, 12);
    expect(() => homersekletKorrekcio({ thetaInt: 5, thetaE: 5, thetaX: 5 })).toThrow(ErvenytelenBemenet);
  });

  it('HL-004 HL-006 HL-007 HL-008 nappali: fal 12 m² U 0,2, ablak 2,4 m² U 1,0, ΔU_TB 0,05 → H_ie 5,52; fürdő felé 8 m² U 1,5 → −48 W; talaj → 58,01 W', () => {
    // H_ie = 12·0,25 + 2,4·1,05 = 5,52 W/K; Φ = 5,52·33 = 182,16 W.
    // Fürdő (24 °C): 8·1,5·(20 − 24) = −48 W.
    // Talaj: U_equiv 0,200051 (B′ 8, z 0, U 0,25); f_ig = (20 − 10)/33; H = 1,45·20·0,200051·f_ig = 1,75803 W/K → 58,015 W.
    const Ueq = egyenertekuUTalaj({ szerkezet: 'padlo', B: 8, z: 0, U: 0.25, dUTB: 0.05 });
    const r = transzmisszio(
      {
        thetaInt: 20,
        elemek: [
          { A: 12, U: 0.2, tuloldal: { x: 'e' } },
          { A: 2.4, U: 1.0, tuloldal: { x: 'e' } },
          { A: 8, U: 1.5, tuloldal: { x: 'a', thetaX: 24 } },
          { A: 20, U: Ueq, tuloldal: { x: 'g', fGW: 1 } },
        ],
      },
      { thetaE: -13, thetaEm: 10, dUTB: 0.05 },
    );
    expect(r.H.ie).toBeCloseTo(5.52, 12);
    expect(r.reszek.ie).toBeCloseTo(182.16, 10);
    expect(r.reszek.ia).toBeCloseTo(-48, 10);
    expect(r.reszek.ig).toBeCloseTo(58.0149, 3);
    expect(r.Phi).toBeCloseTo(182.16 - 48 + 58.0149, 3);
  });

  it('HL-007 fűtetlen padlás f_1 = 0,7 (B.2); szomszéd épület θ_x = max(θ_e,m; 5 °C)', () => {
    const r = transzmisszio(
      { thetaInt: 20, elemek: [{ A: 10, U: 0.2, tuloldal: { x: 'ae', f1: futetlenF1('padlas_szigetelt') } }, { A: 10, U: 0.5, tuloldal: { x: 'epulet' } }] },
      { thetaE: -13, thetaEm: 3, dUTB: 0.05 },
    );
    // 10·0,2·0,7·33 = 46,2 W; szomszéd épület θ_x = 5 °C: 10·0,5·(20 − 5) = 75 W.
    expect(r.reszek.iae).toBeCloseTo(46.2 + 75, 10);
  });
});

describe('Talaj, külső hőmérséklet, időállandó', () => {
  it('HL-040 HL-041 B′ = 96/(0,5·40) = 4,8; padló U_equiv (B′ 8, z 0, U 0,25) = 0,20005; pincefal (z 2,5, U 0,4) = 0,29886', () => {
    expect(talajGeometria(96, 40)).toBeCloseTo(4.8, 12);
    expect(egyenertekuUTalaj({ szerkezet: 'padlo', B: 8, z: 0, U: 0.25, dUTB: 0.05 })).toBeCloseTo(0.2000514, 6);
    expect(egyenertekuUTalaj({ szerkezet: 'pincefal', B: 8, z: 2.5, U: 0.4, dUTB: 0.05 })).toBeCloseTo(0.2988650, 6);
  });

  it('HL-041 az E melléklet tartományán kívül részletes módszer kell (B′ < 2, U > 4, pincefal z = 0)', () => {
    expect(() => egyenertekuUTalaj({ szerkezet: 'padlo', B: 1.5, z: 0, U: 0.3, dUTB: 0.05 })).toThrow(ReszletesModszerSzukseges);
    expect(() => egyenertekuUTalaj({ szerkezet: 'padlo', B: 5, z: 0, U: 4.5, dUTB: 0.05 })).toThrow(ReszletesModszerSzukseges);
    expect(() => egyenertekuUTalaj({ szerkezet: 'pincefal', B: 5, z: 0, U: 0.3, dUTB: 0.05 })).toThrow(ReszletesModszerSzukseges);
  });

  it('HL-010 HL-011 HL-012 θ_e: magassági korrekció; τ = 100 h → Δθ = 0,016·100 − 0,8 = 0,8 K; τ = 10 h → 0 (alsó korlát); τ = 400 h → 4 (felső)', () => {
    expect(kulsoMeretezesiHomerseklet({ thetaERef: -13 }).thetaE).toBe(-13);
    expect(kulsoMeretezesiHomerseklet({ thetaERef: -13, magassag: { G: -0.005, hBuild: 300, hRef: 100 } }).thetaE0).toBeCloseTo(-14, 12);
    expect(kulsoMeretezesiHomerseklet({ thetaERef: -13, tau: 100 }).thetaE).toBeCloseTo(-12.2, 12);
    expect(kulsoMeretezesiHomerseklet({ thetaERef: -13, tau: 10 }).dTau).toBe(0);
    expect(kulsoMeretezesiHomerseklet({ thetaERef: -13, tau: 400 }).dTau).toBe(4);
  });

  it('HL-013 τ = c_eff·V_e/H = 50·1000/250 = 200 h', () => {
    expect(idoallando(50, 1000, 250)).toBe(200);
  });

  it('HL-014 HL-015 magas helyiség radiátorral: h_k 3, h_occup 1 → θ* = 22; h 6 m → θ*_int = 22', () => {
    expect(magasFeluletiHomerseklet({ thetaInt: 20, Gair: 1, hk: 3, hOccup: 1, dTsurf: 0 })).toBe(22);
    expect(magasLeghomerseklet({ thetaInt: 20, Gair: 1, hi: 6, hOccup: 1, dTrad: 0 })).toBe(22);
  });
});

describe('Szellőzés (6.3.3)', () => {
  it('HL-016 … HL-028 egy helyiség, természetes szellőzés: q_inf-add 4,32 < q_min 27 m³/h → Φ_V = 0,34·27·33 = 302,94 W', () => {
    const r = szellozesAltalanos({ helyisegek: [{ V: 54, Aenv: 14.4, qMin: 27, thetaStar: 20 }], thetaE: -13, qEnv50: 6, fqv: 0.05, ffac: 8 });
    expect(r.qInfAdd).toBeCloseTo(4.32, 12);
    expect(r.helyisegek[0]!.qEnv).toBeCloseTo(4.32, 12);
    expect(r.helyisegek[0]!.Phi).toBeCloseTo(302.94, 10);
    expect(r.zona).toBeCloseTo(302.94, 10);
  });

  it('HL-018 … HL-023 kiegyenlítetlen: fürdő 60 m³/h elszívás → f_e 0,018571; Φ_V nappali 558,22, fürdő 130,56, zóna 688,38 W', () => {
    // Kézi számítás: q_env,50·A_env = 6·17,4 = 104,4; f_e = 1/(1 + 160·(60/104,4)²) = 0,0185711; q_inf-add = 0,096941;
    // q_env,z = 60,096941; nappali: q_leak = 49,7354, q_env,i = 49,75211 → 0,34·49,75211·33;
    // fürdő: q_leak = 10,36154, q_env,i = 10,37826, q_techn = 60 → 0,34·10,37826·37;
    // zóna (f_i-z = 0,5): 0,34·(49,7354·33 + 10,36154·37).
    const r = szellozesAltalanos({
      helyisegek: [
        { V: 54, Aenv: 14.4, qMin: 27, thetaStar: 20 },
        { V: 12, Aenv: 3, qMin: 6, thetaStar: 24, qExh: 60 },
      ],
      thetaE: -13,
      qEnv50: 6,
      fqv: 0.05,
      ffac: 8,
    });
    expect(r.qInfAdd).toBeCloseTo(0.0969411, 6);
    expect(r.helyisegek[0]!.Phi).toBeCloseTo(558.2187, 3);
    expect(r.helyisegek[1]!.Phi).toBeCloseTo(130.5585, 3);
    expect(r.helyisegek[1]!.qTechn).toBe(60);
    expect(r.zona).toBeCloseTo(688.3794, 3);
  });

  it('HL-026 HL-027 q_env,50 = 3·300/250 = 3,6; θ_rec = −13 + 0,8·(22 + 13) = 15 °C', () => {
    expect(legatereszto50(3, 300, 250)).toBeCloseTo(3.6, 12);
    expect(befujtHomerseklet({ thetaE0: -13, etaRec: 0.8, elszivas: [{ q: 30, thetaStar: 24 }, { q: 30, thetaStar: 20 }] })).toBeCloseTo(15, 12);
  });
});

describe('Összegzés (6.3.1)', () => {
  it('HL-001 HL-003 HL-029 helyiség 182,16 + 302,94 W; felfűtés 20 m²·10 W/m²; épület: ia tag nélkül', () => {
    expect(helyisegHoterheles({ PhiT: 182.16, PhiV: 302.94 })).toBeCloseTo(485.1, 10);
    expect(felfutesiTobblet(20, 10)).toBe(200);
    const reszek = { ie: 182.16, ia: -48, iae: 10, iaBE: 0, ig: 58 };
    expect(epuletHoterheles({ helyisegek: [{ reszek }], PhiVZonak: [302.94] })).toBeCloseTo(182.16 + 10 + 58 + 302.94, 10);
  });
});
