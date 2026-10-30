// Hőtechnika – 9/2023 ÉKM számítási módszer, 1. Függelék 4. fejezet.
// A tesztnevek eleje a követelménymátrix azonosítója; a várt értékek kézzel, a forrás képleteiből számolva.
import { describe, expect, it } from 'vitest';
import {
  ErvenytelenBemenet,
  ReszletesModszerSzukseges,
  SzamitasiHiba,
  arnyekolosNyilaszaroU,
  egyhejuNyilaszaroU,
  effektivHezagossag,
  elemeltPadlo,
  feluletiEllenallas,
  forditottTetoKorrekcio,
  fuggonyfalU,
  futottPinceFal,
  hoaramIranya,
  hoatbocsatasiTenyezo,
  homogenRtot,
  inhomogenSzerkezet,
  karakterisztikusMeret,
  kethejuNyilaszaroU,
  kismertekbenSzellozottRtot,
  korrigaltU,
  legateresztesiOsztaly,
  legretegEgyszerusitettEllenorzes,
  legretegSzellozes,
  leguregKorrekcio,
  mertekadoPeremPsi,
  padloEgyenertekuVastagsag,
  padloUPeremmel,
  panelosFalU,
  peremHoszigetelesPsi,
  reszlegesenAlapincezettMelyseg,
  retegEllenallas,
  rogzitoelemKorrekcio,
  szamitasiMelyseg,
  talajLambda,
  talajonFekvoPadlo,
  terepszintFelettiPadlo,
  tobbletEllenallasIsmertRarny,
  tobbletEllenallasKozelito,
  zartLegretegEllenallas,
} from '../src/index.js';

describe('4.1 Hőátbocsátási tényező', () => {
  it('HT-002 [(4.1)] U = 1/R_tot', () => {
    expect(hoatbocsatasiTenyezo(4.0)).toBeCloseTo(0.25, 12);
    expect(() => hoatbocsatasiTenyezo(0)).toThrow(ErvenytelenBemenet);
  });

  it('HT-003, HT-005 [(4.2), (4.3)] többrétegű fal: 15 cm EPS λ 0,04 + 30 cm falazat λ 0,5', () => {
    const f = feluletiEllenallas({ irany: 'vizszintes' });
    const rTot = homogenRtot(f, [
      { tipus: 'homogen', d: 0.15, lambda: 0.04 },
      { tipus: 'homogen', d: 0.3, lambda: 0.5 },
    ]);
    expect(rTot).toBeCloseTo(4.52, 12);
    expect(hoatbocsatasiTenyezo(rTot)).toBeCloseTo(0.221238938, 8);
  });

  it('HT-005 [(4.3)] R = d/λ, érvénytelen bemenet', () => {
    expect(retegEllenallas(0.15, 0.04)).toBeCloseTo(3.75, 12);
    expect(() => retegEllenallas(-0.1, 0.04)).toThrow(ErvenytelenBemenet);
    expect(() => retegEllenallas(0.1, 0)).toThrow(ErvenytelenBemenet);
  });
});

describe('4.1.2 Felületi hőátadási ellenállás (4.1. táblázat)', () => {
  it('HT-010 … HT-013 táblázati értékek', () => {
    expect(feluletiEllenallas({ irany: 'felfele' })).toEqual({ Rsi: 0.1, Rse: 0.04 });
    expect(feluletiEllenallas({ irany: 'vizszintes' })).toEqual({ Rsi: 0.13, Rse: 0.04 });
    expect(feluletiEllenallas({ irany: 'lefele' })).toEqual({ Rsi: 0.17, Rse: 0.04 });
  });

  it('HT-004 belső, ill. fűtött–fűtetlen elválasztó szerkezet: mindkét oldalon R_si', () => {
    expect(feluletiEllenallas({ irany: 'lefele', mindketOldalBelso: true })).toEqual({ Rsi: 0.17, Rse: 0.17 });
    expect(feluletiEllenallas({ irany: 'felfele', mindketOldalBelso: true })).toEqual({ Rsi: 0.1, Rse: 0.1 });
  });

  it('HT-014 a vízszintes érték ±30°-ig érvényes', () => {
    expect(hoaramIranya(30)).toBe('vizszintes');
    expect(hoaramIranya(-30)).toBe('vizszintes');
    expect(hoaramIranya(31)).toBe('felfele');
    expect(hoaramIranya(-31)).toBe('lefele');
    expect(() => hoaramIranya(95)).toThrow(ErvenytelenBemenet);
  });

  it('HT-015 alacsony emissziós / nem sík felület → részletes módszer', () => {
    expect(() => feluletiEllenallas({ irany: 'vizszintes', kulonlegesFelulet: true })).toThrow(ReszletesModszerSzukseges);
  });
});

describe('4.1.3 Légrétegek (4.2. táblázat)', () => {
  it('HT-023 lineáris interpoláció: 20 mm vízszintes → 0,175; 12 mm felfelé → 0,154; táblázati pont 300 mm lefelé → 0,23', () => {
    expect(zartLegretegEllenallas(0.02, 'vizszintes')).toBeCloseTo(0.175, 12);
    expect(zartLegretegEllenallas(0.012, 'felfele')).toBeCloseTo(0.154, 12);
    expect(zartLegretegEllenallas(0.3, 'lefele')).toBeCloseTo(0.23, 12);
  });

  it('HT-018 0,3 m-nél vastagabb légréteg nem vehető figyelembe', () => {
    expect(() => zartLegretegEllenallas(0.31, 'vizszintes')).toThrow(ReszletesModszerSzukseges);
  });

  it('HT-017, HT-019 … HT-021 az egyszerűsített módszer feltételei', () => {
    const ok = { d: 0.03, emisszio: 0.9, szelesseg: 1, magassag: 2.5, belsoKornyezettelKapcsolatban: false };
    expect(() => legretegEgyszerusitettEllenorzes(ok)).not.toThrow();
    expect(() => legretegEgyszerusitettEllenorzes({ ...ok, emisszio: 0.5 })).toThrow(ReszletesModszerSzukseges);
    expect(() => legretegEgyszerusitettEllenorzes({ ...ok, d: 0.05, szelesseg: 0.4 })).toThrow(ReszletesModszerSzukseges);
    expect(() => legretegEgyszerusitettEllenorzes({ ...ok, belsoKornyezettelKapcsolatban: true })).toThrow(
      ReszletesModszerSzukseges,
    );
  });

  it('HT-024, HT-025, HT-027 kiszellőztetés mértéke (500 / 1500 mm² határ)', () => {
    expect(legretegSzellozes(500)).toBe('zart');
    expect(legretegSzellozes(501)).toBe('kismerteku');
    expect(legretegSzellozes(1499)).toBe('kismerteku');
    expect(legretegSzellozes(1500)).toBe('intenziv');
  });

  it('HT-026 [(4.4)] kismértékben kiszellőztetett: A=1000, R_zárt=3,4, R_szell=2,9 → 3,15', () => {
    expect(kismertekbenSzellozottRtot(1000, 3.4, 2.9)).toBeCloseTo(3.15, 12);
    expect(() => kismertekbenSzellozottRtot(400, 3.4, 2.9)).toThrow(ErvenytelenBemenet);
  });
});

describe('4.1.4 Inhomogén rétegek', () => {
  // Ferde tető: 12,5 mm gipszkarton (λ 0,25) + 20 cm réteg: 90% ásványgyapot (λ 0,04) / 10% fa (λ 0,13),
  // hőáram felfelé (R_si 0,10, R_se 0,04).
  const szerkezet = {
    felulet: { Rsi: 0.1, Rse: 0.04 },
    szeletArany: [0.9, 0.1],
    retegek: [
      { d: 0.0125, szeletek: [{ lambda: 0.25 }, { lambda: 0.25 }] },
      { d: 0.2, szeletek: [{ lambda: 0.04 }, { lambda: 0.13 }] },
    ],
  };

  it('HT-035 … HT-040 [(4.5)–(4.9)] felső 4,32404, alsó 4,27163, eredő 4,29784, U 0,232675', () => {
    const e = inhomogenSzerkezet(szerkezet);
    expect(e.rTotFelso).toBeCloseTo(4.324037819799778, 9);
    expect(e.rTotAlso).toBeCloseTo(4.271632653061225, 9);
    expect(e.rTot).toBeCloseTo(4.297835236430501, 9);
    expect(e.U).toBeCloseTo(0.23267527603746258, 9);
  });

  it('HT-033 felső/alsó arány > 1,5 → részletes módszer (acél váz a hőszigetelésben)', () => {
    expect(() =>
      inhomogenSzerkezet({
        ...szerkezet,
        szeletArany: [0.95, 0.05],
        retegek: [{ d: 0.2, szeletek: [{ lambda: 0.04 }, { lambda: 50 }] }],
      }),
    ).toThrow(ReszletesModszerSzukseges);
  });

  it('HT-034 fém kötőelem átszúrja a hőszigetelést → (4.13) kell', () => {
    expect(() => inhomogenSzerkezet({ ...szerkezet, femKotoelemAtszurja: true })).toThrow(ReszletesModszerSzukseges);
  });

  it('HT-037 a területarányok összege 1', () => {
    expect(() => inhomogenSzerkezet({ ...szerkezet, szeletArany: [0.8, 0.1] })).toThrow(ErvenytelenBemenet);
  });
});

describe('4.1.6 U-korrekciók', () => {
  it('HT-047, HT-049 [(4.12)] 1. szint: 0,01·(3/3,5)² = 0,0073469', () => {
    expect(leguregKorrekcio(1, 3, 3.5)).toBeCloseTo(0.007346938775510204, 12);
  });

  it('HT-048 2. szint ΔU″ = 0,04; HT-050 lépcsőzetes → 0', () => {
    expect(leguregKorrekcio(2, 3.5, 3.5)).toBeCloseTo(0.04, 12);
    expect(leguregKorrekcio('lepcsozetes', 3, 3.5)).toBe(0);
  });

  it('HT-052, HT-053 [(4.13)] átmenő acél dübel: 0,8·50·1,96e-5·6/0,15·0,95² = 0,0283024', () => {
    expect(
      rogzitoelemKorrekcio({ lambdaRogz: 50, aRogz: 1.96e-5, nRogz: 6, d1: 0.15, r1: 0.95, rTot: 1 }),
    ).toBeCloseTo(0.0283024, 10);
  });

  it('HT-054 süllyesztett: α = 0,8·d_1/d_0 = 0,64', () => {
    const b = { lambdaRogz: 50, aRogz: 1e-5, nRogz: 4, d1: 0.12, r1: 1, rTot: 1 };
    expect(rogzitoelemKorrekcio({ ...b, d0: 0.15 })).toBeCloseTo((0.64 * 50 * 1e-5 * 4) / 0.12, 12);
  });

  it('HT-057 λ_rögz < 1 W/mK vagy légréteget szúr át → nincs korrekció; HT-059 szendvicspanel → részletes', () => {
    const b = { lambdaRogz: 0.3, aRogz: 1e-5, nRogz: 4, d1: 0.12, r1: 1, rTot: 1 };
    expect(rogzitoelemKorrekcio(b)).toBe(0);
    expect(rogzitoelemKorrekcio({ ...b, lambdaRogz: 50, legretegetSzurAt: true })).toBe(0);
    expect(() => rogzitoelemKorrekcio({ ...b, ketFemlemeztKotOssze: true })).toThrow(ReszletesModszerSzukseges);
  });

  it('HT-060, HT-061 fordított tető: általában 0; egyrétegű + tompa + vízáteresztő fedés → részletes', () => {
    const b = { egyreteguHoszigeteles: true, tompaIllesztes: true, vizateresztoFedoreteg: false };
    expect(forditottTetoKorrekcio(b)).toBe(0);
    expect(() => forditottTetoKorrekcio({ ...b, vizateresztoFedoreteg: true })).toThrow(ReszletesModszerSzukseges);
  });

  it('HT-044, HT-045 [(4.10)–(4.11)] U = U_0 + ΣΔU (a 3%-os elhanyagolás nélkül, D-102)', () => {
    expect(korrigaltU(0.2, { legureg: 0.004, rogz: 0.006 })).toBeCloseTo(0.21, 12);
    expect(korrigaltU(0.25, { legureg: 0.001 })).toBeCloseTo(0.251, 12);
  });
});

describe('4.1.7 Panelos falak (2. függ. 4.6. táblázat)', () => {
  it('HT-062 Dunaújváros 1967-1979, kiegészítő hőszigetelés nélkül 1,786, 8 → 0,424', () => {
    expect(panelosFalU('Dunaújváros', '1967-1979', 0)).toBe(1.786);
    expect(panelosFalU('Dunaújváros', '1967-1979', 8)).toBe(0.424);
  });
  it('HT-062 ismeretlen házgyár → hiba', () => {
    expect(() => panelosFalU('Nincsilyen', '1900-1901', 0)).toThrow(SzamitasiHiba);
  });
});

describe('4.2 Függönyfal', () => {
  it('HT-067 [(4.14)] (1,0·10 + 1,4·5)/15 = 1,1333', () => {
    expect(fuggonyfalU([{ A: 10, U: 1.0 }, { A: 5, U: 1.4 }])).toBeCloseTo(17 / 15, 12);
  });
});

describe('4.3 Nyílászárók', () => {
  it('HT-072 [(4.16)] A_ü 1,2 U_ü 1,1; A_k 0,5 U_k 1,3; l 4,6 ψ 0,06 → 1,321176', () => {
    expect(
      egyhejuNyilaszaroU({
        uvegezes: [{ A: 1.2, U: 1.1 }],
        keret: [{ A: 0.5, U: 1.3 }],
        keretUveg: [{ l: 4.6, psi: 0.06 }],
      }),
    ).toBeCloseTo(1.3211764705882354, 12);
  });

  it('HT-073 [(4.17)] kapcsolt gerébtok U1=U2=2,8, R_l 0,18 → 1,380671', () => {
    expect(kethejuNyilaszaroU(2.8, 2.8, 0.18)).toBeCloseTo(1.3806706114398422, 12);
  });

  it('HT-075 [(4.18)] U 1,0, ΔR 0,15 → 0,960870', () => {
    expect(arnyekolosNyilaszaroU(1.0, 0.15)).toBeCloseTo(0.9608695652173913, 12);
  });

  it('HT-077, HT-078 [(4.19), 4.3. táblázat] hézagosság és osztály', () => {
    expect(effektivHezagossag(2, 3, 4)).toBe(9);
    expect(legateresztesiOsztaly(2, 3, 4)).toBe(3);
    expect(legateresztesiOsztaly(20, 10, 10)).toBe(1);
    expect(legateresztesiOsztaly(10, 5, 0)).toBe(2);
    expect(legateresztesiOsztaly(0, 3, 0)).toBe(5);
    // 3 < b_eth < 8: a táblázat nem fedi le (D-103)
    expect(() => legateresztesiOsztaly(2, 2, 1)).toThrow(SzamitasiHiba);
  });

  it('HT-079 [4.4. táblázat] 3. osztály, R_árny 0,10 → 0,165; 1. osztály → 0,08', () => {
    expect(tobbletEllenallasIsmertRarny(3, 0.1)).toBeCloseTo(0.165, 12);
    expect(tobbletEllenallasIsmertRarny(1, 0.5)).toBeCloseTo(0.08, 12);
  });

  it('HT-080 [4.5. táblázat] alumínium redőny 3. osztály → 0,12; habkitöltéses 5. osztály → 0,26', () => {
    expect(tobbletEllenallasKozelito('Alumínium redőny', 3)).toBe(0.12);
    expect(tobbletEllenallasKozelito('Redőny habkitöltéses lamellákkal', 5)).toBe(0.26);
  });
});

describe('4.4 Talajjal érintkező szerkezetek', () => {
  it('HT-083, HT-084 [4.6. táblázat] talaj λ; ismeretlen → 2. típus (2,0)', () => {
    expect(talajLambda(1)).toBe(1.5);
    expect(talajLambda(3)).toBe(3.5);
    expect(talajLambda()).toBe(2.0);
  });

  it('HT-088 [(4.20)] B = A/(0,5P): 10×10 m → 5', () => {
    expect(karakterisztikusMeret(100, 40)).toBeCloseTo(5, 12);
  });

  it('HT-089 [(4.21)] d_p = 0,4 + 2·(0,17 + 2,5 + 0,04) = 5,82 (D-101)', () => {
    expect(padloEgyenertekuVastagsag(0.4, 2, 2.5)).toBeCloseTo(5.82, 12);
  });

  it('HT-091, HT-092 [(4.22)] mérsékelten szigetelt padló: R_p 0,10 → d_p 1,02, U 0,668887', () => {
    const e = talajonFekvoPadlo({ A: 100, P: 40, df: 0.4, rP: 0.1, melyseg: 0 });
    expect(e.keplet).toBe('4.22');
    expect(e.dp).toBeCloseTo(1.02, 12);
    expect(e.U).toBeCloseTo(0.6688869635061931, 12);
  });

  it('HT-093, HT-094 [(4.23)] jól szigetelt padló: d_p 5,82 ≥ B 5 → U 0,246761', () => {
    const e = talajonFekvoPadlo({ A: 100, P: 40, df: 0.4, rP: 2.5, melyseg: 0.3 });
    expect(e.keplet).toBe('4.23');
    expect(e.z).toBe(0);
    expect(e.U).toBeCloseTo(0.24676125848241826, 12);
  });

  it('HT-096 ±0,5 m-en belül z = 0', () => {
    expect(szamitasiMelyseg(0.5)).toBe(0);
    expect(szamitasiMelyseg(-0.4)).toBe(0);
    expect(szamitasiMelyseg(0.6)).toBe(0.6);
  });

  it('HT-097 elemelt padló → MSZ EN ISO 13370 (részletes)', () => {
    expect(() => elemeltPadlo()).toThrow(ReszletesModszerSzukseges);
  });

  it('HT-098 … HT-101 [(4.24)–(4.26)] terepszint feletti padló: U 0,217744', () => {
    const b = { A: 100, P: 40, Up: 0.3, Ulf: 0.5, dlf: 0.4, m: 0.6 };
    expect(terepszintFelettiPadlo(b)).toBeCloseTo(0.21774377543426224, 12);
    expect(() => terepszintFelettiPadlo({ ...b, m: 0.5 })).toThrow(ReszletesModszerSzukseges);
    expect(() => terepszintFelettiPadlo({ ...b, A: 251 })).toThrow(ReszletesModszerSzukseges);
  });

  it('HT-103 … HT-105 [(4.27)–(4.28)] fűtött pincefal: z 2, d_p 1,02, R_pf 2,0 → d_pf 4,34, U 0,282028', () => {
    expect(futottPinceFal({ z: 2, dp: 1.02, rPf: 2.0 })).toBeCloseTo(0.28202795646953766, 12);
  });

  it('HT-106 részlegesen alápincézett: a mélység fele', () => {
    expect(reszlegesenAlapincezettMelyseg(2.4)).toBeCloseTo(1.2, 12);
  });

  it('HT-108 … HT-113 [(4.29)–(4.32)] perem hőszigetelés Ψ (R_psz 2,5, d 0,1, D 1, d_p 1,02)', () => {
    const b = { D: 1, rPsz: 2.5, dPsz: 0.1, dp: 1.02 };
    const v = peremHoszigetelesPsi({ ...b, elhelyezes: 'vizszintes' });
    const f = peremHoszigetelesPsi({ ...b, elhelyezes: 'fuggoleges' });
    expect(v).toBeCloseTo(-0.33563585194970347, 12);
    expect(f).toBeCloseTo(-0.5057303952200454, 12);
    expect(v).toBeLessThan(0);
    expect(mertekadoPeremPsi([v, f])).toBe(f); // HT-109
  });

  it('HT-114 [(4.33)] U = 0,668887 + 40·(−0,335636)/100 = 0,534633', () => {
    expect(padloUPeremmel(0.6688869635061931, 40, -0.33563585194970347, 100)).toBeCloseTo(
      0.5346326227263117,
      12,
    );
  });
});
