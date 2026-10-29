import { describe, expect, it } from 'vitest';
import {
  HONAPOK,
  cirkulaciosSegedenergia,
  futesiAlrendszer,
  futesiHotermelo,
  hmvElosztasiVesztesege,
  hmvHotermelo,
  hmvRendszer,
  hmvTarolasiVesztesege,
  hoelosztasVesztesege,
  lakoHmvNettoIgeny,
  szivattyuSegedenergia,
  vizesSzabalyozasiTenyezo,
  direktTranszmisszio,
  ejszakaiTobbletSzellozes,
  hotaroloKepesseg,
  nettoEnergiaigeny,
  psiPf,
  talajHoatvitel,
  termeszetesSzellozes,
  type NettoZonaBemenet,
  type Transzparens,
} from '../../src/index.js';
import { TAJOLAS, ablakU, betolt, padloU, retegtervU } from './epito.js';

const { be, vart } = betolt('G1');
const h = be.rooms[0]!;

const uFal = retegtervU(be, 'R1./ Külső fal', 'vizszintes');
const uTeto = retegtervU(be, 'R2./ Lapostető', 'felfele');
const padlo = padloU(be, 'R3./ Talajon fekvő padló', h.floor!.A, h.floor!.P, be.iso!.w);

const elemek: { A: number; U: number }[] = [];
const transzparens: Transzparens[] = [];
for (const fal of h.walls) {
  let nyilasok = 0;
  for (const [x, y, db] of h.windows[fal.side] ?? []) {
    const a = ablakU(be, x, y);
    elemek.push({ A: x * y * db, U: a.U });
    transzparens.push({ Au: a.Au * db, gN: be.window.g, tajolas: TAJOLAS[fal.side], hajlasszog: 90, fArny: { F: 1, H: 1 } });
    nyilasok += x * y * db;
  }
  if (h.door && h.door[0] === fal.side) {
    elemek.push({ A: h.door[1] * h.door[2], U: be.door.U });
    nyilasok += h.door[1] * h.door[2];
  }
  elemek.push({ A: fal.A - nyilasok, U: uFal });
}
elemek.push({ A: h.roof!.A, U: uTeto });

const V = h.area * h.height;
const hTrD = direktTranszmisszio({ elemek });
// Feltevés: lábazati fal a terepszint alatt 0,5 m-ig hőszigetelt (a bemenet nem adja meg; a WinWatt 0,10 W/mK alapértéke).
const psi = psiPf({
  lambdaFalazat: be.materials_used['Kerámia falazóblokk 30 (teszt)']!.lambda,
  kulsoFalKialakitasa: 'külső oldali, megszakítatlan hőszigeteléssel',
  labazatiFal: 'Lábazati fal a terepszint alatt 0,5 m-ig hőszigetelt',
  padloHoszigetelesR: 4.286,
});
const hTrT = talajHoatvitel(h.floor!.A, padlo.U, h.floor!.P, psi);
const hSzF = termeszetesSzellozes(0.5, 1, 0.06, V);
const ej = { zajPorRendben: true, nincsVagyonvedelmiKockazat: true, automatikusNyitasVagyLako: true };
const zona: NettoZonaBemenet = {
  aN: be.heated_area,
  V,
  thetaIF: 20,
  thetaIH: 26,
  cmEff: hotaroloKepesseg(3, be.heated_area),
  hTrD: { F: hTrD, H: hTrD },
  futetlen: [],
  hTrT,
  hSzell: { F: hSzF, H: HONAPOK.map((m) => hSzF + ejszakaiTobbletSzellozes(m, 6, V, ej)) },
  transzparens,
  qb: 5,
  sigmaF: 1,
  sigmaH: 1,
};

/** A WinWatt tanúsítvány-dokumentációjának (G1_tanusitvany.pdf, 4–5. o.) részeredményei. */
const WW = {
  hTrD: 40.9,
  hTrT: 18.5,
  hSzellF: 50.8,
  cmEffPerAN: 301.41,
  QFnetHavi: [787.1, 782.0, 657.4, 104.9, 0, 0, 0, 0, 0, 228.1, 347.9, 1004.4],
  QsHavi: [204.5, 249.6, 240.8, 377.2, 443.0, 371.3, 366.6, 431.1, 381.9, 393.2, 264.4, 135.9],
  QbHavi: [357.1, 322.6, 357.1, 345.6, 357.1, 345.6, 357.1, 357.1, 345.6, 357.1, 345.6, 357.1],
  QFnetEv: 3912,
};

const relativ = (a: number, b: number): number => Math.abs(a - b) / Math.abs(b);

describe('Golden G1 (WinWatt fecske 9.58) – földszintes lapostetős ház, kondenzációs gázkazán', () => {
  it('HT-023 rétegtervi U-értékek: fal 0,176, tető 0,134 (±0,002)', () => {
    expect(Math.abs(uFal - vart.winwatt_projekt.panelek['R1./ Külső fal']!.k)).toBeLessThanOrEqual(0.002);
    expect(Math.abs(uTeto - vart.winwatt_projekt.panelek['R2./ Lapostető']!.k)).toBeLessThanOrEqual(0.002);
  });

  it('HT-072 ablak U méretenként (0,9×1,2: 0,75; 1,2×1,2: 0,73; 1,5×1,5: 0,71), ±0,005', () => {
    expect(ablakU(be, 0.9, 1.2).U).toBeCloseTo(0.75, 2);
    expect(ablakU(be, 1.2, 1.2).U).toBeCloseTo(0.73, 2);
    expect(ablakU(be, 1.5, 1.5).U).toBeCloseTo(0.71, 2);
  });

  it('HT-096 talajon fekvő padló (4.23): 0,168 = a WinWatt „átlagos rétegtervi” értéke', () => {
    expect(padlo.keplet).toBe('4.23');
    expect(padlo.U).toBeCloseTo(0.168, 3);
  });

  it('TR-026 geometria és direkt transzmisszió: A/V 1,157; H_tr,D a WinWatt 40,9 W/K-jánál 1,4 %-kal nagyobb (E-12)', () => {
    const A = elemek.reduce((s, e) => s + e.A, 0) + h.floor!.A;
    expect(A / V).toBeCloseTo(1.157, 3);
    // A WinWatt az ablakoknál U helyett csökkentett U*-gal számol (0,75 → 0,705); a módszerben ennek nincs alapja.
    expect(hTrD).toBeCloseTo(41.45, 1);
    expect(relativ(hTrD, WW.hTrD)).toBeLessThan(0.015);
  });

  it('SZ-009 szellőzési tényező fűtésre: 50,8 W/K', () => {
    expect(hSzF).toBeCloseTo(WW.hSzellF, 1);
  });

  it('NET-020 belső hőnyereség havonta: Q_b egyezik', () => {
    const e = nettoEnergiaigeny(zona);
    e.havi.forEach((m, i) => expect(m.Qb).toBeCloseTo(WW.QbHavi[i]!, 0));
  });

  it('NY-015 szoláris nyereség fűtésre (északi sugárzás, F_árny = 1): havonta ±3 %', () => {
    const e = nettoEnergiaigeny(zona);
    e.havi.forEach((m, i) => expect(relativ(m.QsdF, WW.QsHavi[i]!)).toBeLessThan(0.03));
  });

  it('NET-024 … NET-027 a WinWatt H_tr,D, H_tr,T és C_m bemenetével a havi mérleg ±1 %-on belül egyezik', () => {
    const e = nettoEnergiaigeny({ ...zona, hTrD: { F: WW.hTrD, H: WW.hTrD }, hTrT: WW.hTrT, cmEff: WW.cmEffPerAN * be.heated_area });
    expect(relativ(e.QFnetEv, WW.QFnetEv)).toBeLessThan(0.01);
    e.havi.forEach((m, i) => {
      if (WW.QFnetHavi[i]! > 100) expect(relativ(m.QFnet, WW.QFnetHavi[i]!)).toBeLessThan(0.02);
      else expect(Math.abs(m.QFnet - WW.QFnetHavi[i]!)).toBeLessThan(15);
    });
  });

  it('NET-027 a módszer szerinti saját bemenettel az éves nettó fűtési igény eltérése dokumentált (E-03, E-12)', () => {
    const e = nettoEnergiaigeny(zona);
    // +3,4 %: talaj (E-03), ablak U* (E-12) és a 6.5. táblázat szerinti C_m (E-13).
    expect(relativ(e.QFnetEv, WW.QFnetEv)).toBeLessThan(0.04);
  });
});

describe('Golden G1 – gépészet (a WinWatt Q_F,net = 3912 kWh/év bemenetével)', () => {
  const AN = be.heated_area;
  const QFnet = WW.QFnetEv;

  it('FUT-017 FUT-018 kondenzációs kazán fűtött térben: ε_F 1,01; w 0,79 kWh/m²év', () => {
    const k = futesiHotermelo({ tipus: 'kazan', kazan: 'kondenzacios', elhelyezes: 'futott_terben' }, AN);
    expect(k.epsF).toBe(1.01);
    expect(k.Wterm / AN).toBeCloseTo(0.79, 2);
  });

  it('FUT-052 … FUT-062 szabályozás: ε_F,szab 1,018 (1,042 + 0,015 + 0,009 − 0,060 + 0,012)', () => {
    expect(
      vizesSzabalyozasiTenyezo({
        hoelado: 'szabad',
        alap: 'Szabályozás referencia helyiségre, PI-szabályozó\nKözponti előremenő hőmérséklet szabályozás helyiségenkénti hőmérséklet szabályozással',
        korrekcio1: { alcsoport: 'kétcsöves fűtés és modernizált egycsöves fűtés', leiras: '55 °C/45 °C' },
        korrekcio2: 'külsőfali radiátor',
        korrekcio3: 'különálló, képes önálló be-kikapcsolásra (pl. termosztatikus szelep)',
        beszabalyozas: {
          rendszer: 'Kétcsöves rendszer',
          kialakitas: 'fűtőtestenként /fűtőfelületenként statikus-beállítás csoportos statikus beszabályozással (pl. strangszabályozó szelepekkel)',
          hoeladokSzama: 10,
        },
      }),
    ).toBeCloseTo(1.018, 12);
  });

  it('FUT-047 FUT-071 elosztás 55/45 fűtött térben 2,10 kWh/m²év; EC szivattyú (EEI 0,23) 1,44 kWh/m²év', () => {
    expect(hoelosztasVesztesege('futott_terben', { elore: 55, vissza: 45 }, AN).ertek / AN).toBeCloseTo(2.1, 2);
    expect(szivattyuSegedenergia('ec_eei_023', 'szabad', 10, AN).ertek / AN).toBeCloseTo(1.44, 2);
  });

  it('FUT-006 FUT-008 fűtés végső energiája: Q_F,vég 4226 kWh/év, W_F,vég 214,08 kWh/év', () => {
    const k = futesiHotermelo({ tipus: 'kazan', kazan: 'kondenzacios', elhelyezes: 'futott_terben' }, AN);
    const e = futesiAlrendszer({
      QFnet,
      epsSzab: 1.018,
      Qszall: hoelosztasVesztesege('futott_terben', { elore: 55, vissza: 45 }, AN).ertek,
      Qtar: 0,
      epsF: k.epsF,
      Wsziv: szivattyuSegedenergia('ec_eei_023', 'szabad', 10, AN).ertek,
      Wtar: 0,
      Wterm: k.Wterm,
    });
    expect(e.QFveg).toBeCloseTo(4226, 0);
    expect(e.WFveg).toBeCloseTo(vart.winwatt_projekt.epulet.EPBD_rendszerek['WinWatt32HeatingSystemItem']![0]!.WFinal, 1);
  });

  it('HMV-001 … HMV-051 HMV: q 25 kWh/m²év; ε 1,17; tárolás 24 %, elosztás 10 %; Q_HMV,vég 3763; W 28,8', () => {
    const net = lakoHmvNettoIgeny('Családi ház*', AN);
    expect(net / AN).toBe(25);
    const k = hmvHotermelo({ tipus: 'kazan', kazan: 'kondenzacios' }, AN);
    expect(k.epsHMV).toBe(1.17);
    const e = hmvRendszer({
      QHMVnet: net,
      Qszall: hmvElosztasiVesztesege(false, 'futott_terben', AN, net).ertek,
      Qtar: hmvTarolasiVesztesege('indirekt', 'futott_terben', AN, net).ertek,
      epsHMV: k.epsHMV,
      Wcirk: cirkulaciosSegedenergia(false, AN).ertek,
      Wterm: k.Wterm,
    });
    expect(e.QHMVveg).toBeCloseTo(3763, 0);
    expect(e.WHMVveg).toBeCloseTo(vart.winwatt_projekt.epulet.EPBD_rendszerek['WinWatt32WaterHeatingSystemItem']![0]!.WFinal, 1);
  });
});

