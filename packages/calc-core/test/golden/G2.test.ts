import { describe, expect, it } from 'vitest';
import {
  cirkulaciosSegedenergia,
  futesiAlrendszer,
  futesiHotermelo,
  hmvElosztasiVesztesege,
  hmvHotermelo,
  hmvRendszer,
  hmvTarolasiVesztesege,
  hoelosztasVesztesege,
  hotarolas,
  lakoHmvNettoIgeny,
  napelemTermeles,
  nettoEnergiaigeny,
  osszesitettEnergetikaiJellemzo,
  szivattyuSegedenergia,
  vizesSzabalyozasiTenyezo,
} from '../../src/index.js';
import { betolt, relativ, zonaEpit } from './epito.js';

const { be, vart } = betolt('G2');
const { zona, Aossz, padlo } = zonaEpit(be, { labazatiFal: 'Lábazati fal a terepszint alatt 0,5 m-ig hőszigetelt', cmKategoria: 3 });

/** G2_tanusitvany.pdf, 4–6. o. */
const WW = {
  hTrD: 50.5,
  hTrX: 10.2,
  hTrT: 15.8,
  hSzellF: 84.7,
  cmEffPerAN: 501.56,
  QFnetHavi: [1018.5, 994.7, 783.3, 15.6, 0, 0, 0, 0, 0, 100.3, 297.4, 1398.3],
  QsHavi: [428.3, 527.1, 513.7, 816.8, 969.4, 821.1, 805.1, 935.7, 816.5, 828.0, 553.6, 285.9],
  QFnetEv: 4608,
};

describe('Golden G2 (WinWatt fecske 9.58) – kétszintes ház hideg padlással, hőszivattyú', () => {
  it('HT-023 rétegtervi U: padlásfödém 0,141 (mindkét oldalon R_si = 0,10)', () => {
    expect(zona.futetlen[0]!.hTrIx / 80).toBeCloseTo(vart.winwatt_projekt.panelek['R5./ Padlásfödém']!.k, 3);
  });

  it('TR-015 padlásfödém b = 0,9 télen: H_tr,x 10,2 W/K', () => {
    expect(0.9 * zona.futetlen[0]!.hTrIx).toBeCloseTo(WW.hTrX, 1);
  });

  it('TR-026 A/V 0,82; H_tr,D a WinWatt 50,5 W/K-jánál 2,3 %-kal nagyobb (E-12)', () => {
    expect(Aossz / zona.V).toBeCloseTo(vart.oeny_etanusitas.AV_arany, 2);
    expect(relativ(zona.hTrD.F, WW.hTrD)).toBeLessThan(0.025);
  });

  it('HT-096 TR-019 talajon fekvő padló (4.23) B = 4,44 m; H_tr,T a WinWatt-nál nagyobb (E-03)', () => {
    expect(padlo!.B).toBeCloseTo(80 / 18, 10);
    expect(zona.hTrT).toBeGreaterThan(WW.hTrT);
  });

  it('SZ-009 NY-015 szellőzés 84,7 W/K; szoláris nyereség havonta ±3 %', () => {
    expect(zona.hSzell.F).toBeCloseTo(WW.hSzellF, 1);
    const e = nettoEnergiaigeny(zona);
    e.havi.forEach((m, i) => expect(relativ(m.QsdF, WW.QsHavi[i]!)).toBeLessThan(0.03));
  });

  it('NET-024 … NET-027 a WinWatt H és C_m bemenetével a havi mérleg egyezik (éves ±1 %, havi ±2 %, 150 kWh alatti hónapokban ±15 kWh)', () => {
    const fut = zona.futetlen.map((f) => ({ ...f, hTrIx: WW.hTrX / 0.9 }));
    const e = nettoEnergiaigeny({ ...zona, hTrD: { F: WW.hTrD, H: WW.hTrD }, futetlen: fut, hTrT: WW.hTrT, cmEff: WW.cmEffPerAN * be.heated_area });
    expect(relativ(e.QFnetEv, WW.QFnetEv)).toBeLessThan(0.01);
    e.havi.forEach((m, i) => {
      if (WW.QFnetHavi[i]! > 150) expect(relativ(m.QFnet, WW.QFnetHavi[i]!)).toBeLessThan(0.02);
      else expect(Math.abs(m.QFnet - WW.QFnetHavi[i]!)).toBeLessThan(15);
    });
  });

  it('NET-027 a módszer szerinti saját bemenettel az eltérés dokumentált (E-03, E-12, E-13)', () => {
    const e = nettoEnergiaigeny(zona);
    expect(relativ(e.QFnetEv, WW.QFnetEv)).toBeLessThan(0.12);
  });
});

describe('Golden G2 – gépészet (a WinWatt Q_F,net = 4608 kWh/év bemenetével)', () => {
  const AN = be.heated_area;
  const h = { elore: 35, vissza: 28 };

  it('FUT-030 FUT-057 … FUT-071 levegő-víz hőszivattyú, padlófűtés: ε 0,30; ε_szab 1,018; Q_F,vég 1439; W 202,56 (interpolált táblaértékek)', () => {
    const k = futesiHotermelo({ tipus: 'hoszivattyu', hoforras: 'Levegő/Víz', futoviz: h }, AN);
    expect(k.epsF).toBe(0.3);
    const epsSzab = vizesSzabalyozasiTenyezo({
      hoelado: 'beagyazott',
      alap: 'Szabályozás referencia helyiségre, kétpontos szabályozó (0,5 K hiszterézis alatt), P-, PI-, PID-szabályozó\nKözponti előremenő hőmérséklet szabályozás helyiségenkénti hőmérséklet szabályozással',
      korrekcio1: { alcsoport: 'Padlófűtés', leiras: '— nedves fektetésű' },
      korrekcio2: 'beágyazott fűtőfelület MSZ EN 1264-2 szerinti minimális hőszigeteléssel',
      korrekcio3: 'különálló, képes önálló be-kikapcsolásra (pl. termosztatikus zónaszelep)',
      beszabalyozas: {
        rendszer: 'Kétcsöves rendszer',
        kialakitas: 'fűtőtestenként/fűtőfelületenként dinamikus beszabályozás (pl. automatikus térfogatáram korlátozókkal/nyomáskülönbség-szabályozókkal)',
        hoeladokSzama: 10,
      },
    });
    expect(epsSzab).toBeCloseTo(1.018, 12);
    const szall = hoelosztasVesztesege('futott_terben', h, AN).ertek;
    expect(szall / AN).toBeCloseTo(0.6, 2);
    const tar = hotarolas('futott_terben', h, AN, false);
    expect(tar.Qtar / AN).toBeCloseTo(0.07, 2);
    const sziv = szivattyuSegedenergia('ec_eei_023', 'beagyazott', 7, AN).ertek;
    const e = futesiAlrendszer({ QFnet: WW.QFnetEv, epsSzab, Qszall: szall, Qtar: tar.Qtar, epsF: k.epsF, Wsziv: sziv, Wtar: tar.Wtar, Wterm: k.Wterm });
    expect(e.QFveg).toBeCloseTo(1439, 0);
    expect(e.WFveg).toBeCloseTo(vart.winwatt_projekt.epulet.EPBD_rendszerek['WinWatt32HeatingSystemItem']![0]!.WFinal, 1);
  });

  it('HMV-037 HMV-045 levegős HMV-hőszivattyú: ε 0,45; tárolás 16,4 % (interpolált); Q_HMV,vég 2275', () => {
    const net = lakoHmvNettoIgeny('Családi ház*', AN);
    const tar = hmvTarolasiVesztesege('indirekt', 'futott_terben', AN, net).ertek;
    expect(tar / net).toBeCloseTo(0.164, 10);
    const k = hmvHotermelo({ tipus: 'elektromos', csoport: 'Hőszivattyú HMV készítésre', rendszer: 'Levegő' }, AN);
    const e = hmvRendszer({
      QHMVnet: net,
      Qszall: hmvElosztasiVesztesege(false, 'futott_terben', AN, net).ertek,
      Qtar: tar,
      epsHMV: k.epsHMV,
      Wcirk: cirkulaciosSegedenergia(false, AN).ertek,
      Wterm: k.Wterm,
    });
    expect(e.QHMVveg).toBeCloseTo(2275, 0);
    expect(e.WHMVveg).toBe(0);
  });

  it('MEG-004 IND-001 … IND-028 hőszivattyú (ε_F 0,30 megújuló, ε_HMV 0,45 nem), napelem 4 kWp D 30° = 4320 kWh/év exportálva: E_nren −5,79; E_CO2 1,42', () => {
    const W = napelemTermeles(4, 'D', 30);
    expect(W).toBe(4320);
    const r = osszesitettEnergetikaiJellemzo(
      {
        F: { ho: [{ Qveg: 1439.28, hordozo: 'villamos', hoszivattyuEps: 0.3 }], W: 202.56 },
        HMV: { ho: [{ Qveg: 2275.2, hordozo: 'villamos', hoszivattyuEps: 0.45 }], W: 0 },
      },
      [{ Wexp: W, termelo: 'nap_pv', cel: 'export_halozatba' }],
      AN,
    );
    expect(r.celonkent.F!.nren).toBeCloseTo(23.6, 1);
    expect(r.celonkent.F!.ren).toBeCloseTo(24.07, 1);
    expect(r.celonkent.HMV!.ren).toBeCloseTo(4.27, 2);
    expect(r.exp.nren).toBeCloseTo(62.1, 2);
    expect(r.exp.co2).toBeCloseTo(10.29, 2);
    expect(r.fajlagos.nren).toBeCloseTo(vart.oeny_etanusitas.Ep_kWh_m2a, 1);
    expect(r.fajlagos.co2).toBeCloseTo(vart.oeny_etanusitas.CO2_kg_m2a, 1);
  });
});
