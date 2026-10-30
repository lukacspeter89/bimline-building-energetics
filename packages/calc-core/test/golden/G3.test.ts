import { describe, expect, it } from 'vitest';
import {
  cirkulaciosSegedenergia,
  folyamatosHovisszanyerosSzellozesF,
  futesiAlrendszer,
  futesiHotermelo,
  hmvElosztasiVesztesege,
  hmvHotermelo,
  hmvRendszer,
  hmvTarolasiVesztesege,
  hoelosztasVesztesege,
  hutesSzabalyozasiTenyezo,
  hutesiRendszer,
  hutesiTeljesitmenyTenyezo,
  illesztesiVeszteseg,
  lakoHmvNettoIgeny,
  latensTenyezo,
  nettoEnergiaigeny,
  osszesitettEnergetikaiJellemzo,
  szivattyuSegedenergia,
  ventilatorEnergia,
  type NettoZonaBemenet,
} from '../../src/index.js';
import { betolt, relativ, zonaEpit } from './epito.js';

const { be, vart } = betolt('G3');
const alap = zonaEpit(be, { labazatiFal: 'Lábazati fal a terepszint alatt 0,5 m-ig hőszigetelt', cmKategoria: 3 });
const lt = be.systems['airing'] as { n: number; eta: number; dp: number; fan_eff: number };
const VLT = lt.n * alap.zona.V;
// Fűtési idényben folyamatos hővisszanyerős gépi szellőzés (6.12); nyáron természetes szellőzés éjszakai többlettel
// (az egyszerűsített hűtésszámításban hővisszanyerő nem vehető figyelembe).
const zona: NettoZonaBemenet = { ...alap.zona, hSzell: { F: folyamatosHovisszanyerosSzellozesF(VLT, lt.eta / 100, 0.06, alap.zona.V), H: alap.zona.hSzell.H } };

/** G3_tanusitvany.pdf, 4–8. o. */
const WW = {
  hTrD: 37.9,
  hTrXF: 16.1,
  hTrXH: 38.6,
  hSzellF: 12.2,
  cmEffPerAN: 416.44,
  QFnetEv: 1068,
  QHnetEv: 292.53,
  QFnetHavi: [239.9, 231.8, 141.6, 0.1, 0, 0, 0, 0, 0, 0.9, 10.6, 443.5],
  hSzellH: [218.2, 222.3, 225.8, 242.2, 276.9, 313.4, 337.3, 303.0, 257.4, 235.6, 226.0, 216.3],
};

describe('Golden G3 (WinWatt fecske 9.58) – fűtetlen pince és garázs, hővisszanyerős szellőzés, split hűtés', () => {
  it('TR-015 pincefödém b 0,5/1,5 és garázsfal b 0,9/0,9: H_tr,x 16,1 (tél) és 38,6 W/K (nyár)', () => {
    const bTel = 0.5 * zona.futetlen[0]!.hTrIx + 0.9 * zona.futetlen[1]!.hTrIx;
    const bNyar = 1.5 * zona.futetlen[0]!.hTrIx + 0.9 * zona.futetlen[1]!.hTrIx;
    expect(bTel).toBeCloseTo(WW.hTrXF, 1);
    expect(bNyar).toBeCloseTo(WW.hTrXH, 1);
    expect(zona.futetlen[0]!.hTrIx / 96).toBeCloseTo(vart.winwatt_projekt.panelek['R6./ Pincefödém']!.k, 3);
    expect(zona.futetlen[1]!.hTrIx / 21.6).toBeCloseTo(vart.winwatt_projekt.panelek['R7./ Fal fűtetlen garázs felé']!.k, 3);
  });

  it('SZ-020 hővisszanyerős szellőzés fűtésre (6.12): 0,35·(129,6·0,15 + 0,06·259,2) = 12,2 W/K', () => {
    expect(zona.hSzell.F).toBeCloseTo(WW.hSzellF, 1);
  });

  it('TR-026 H_tr,D a WinWatt 37,9 W/K-jánál nagyobb (E-12, ablak U*)', () => {
    expect(relativ(zona.hTrD.F, WW.hTrD)).toBeLessThan(0.025);
  });

  it('NET-024 … NET-027 a WinWatt H_tr,D és C_m bemenetével: Q_F,net éves ±2 %', () => {
    const e = nettoEnergiaigeny({ ...zona, hTrD: { F: WW.hTrD, H: WW.hTrD }, cmEff: WW.cmEffPerAN * be.heated_area });
    expect(relativ(e.QFnetEv, WW.QFnetEv)).toBeLessThan(0.02);
  });

  it('NET-032 … NET-037 hűtés: a WinWatt egész évre b_nyár-ral és havi H_szell,H-val számol (E-15, E-16); azzal ±2 %', () => {
    const e = nettoEnergiaigeny({
      ...zona,
      hTrD: { F: WW.hTrD, H: WW.hTrD },
      cmEff: WW.cmEffPerAN * be.heated_area,
      // csak a hűtési mérleg összevetéséhez: a hűtési zónában minden hónapban b_nyár, a WinWatt havi H_szell,H értékei
      futetlen: [
        { hTrIx: zona.futetlen[0]!.hTrIx, b: { havi: [0.5, 0.5, 0.5, 0.5, 1.5, 1.5, 1.5, 1.5, 1.5, 0.5, 0.5, 0.5] } },
        { hTrIx: zona.futetlen[1]!.hTrIx, b: { havi: Array<number>(12).fill(0.9) } },
      ],
      hSzell: { F: zona.hSzell.F, H: WW.hSzellH },
    });
    const bNyarMindig = nettoEnergiaigeny({
      ...zona,
      hTrD: { F: WW.hTrD, H: WW.hTrD },
      cmEff: WW.cmEffPerAN * be.heated_area,
      futetlen: [
        { hTrIx: zona.futetlen[0]!.hTrIx, b: { havi: Array<number>(12).fill(1.5) } },
        { hTrIx: zona.futetlen[1]!.hTrIx, b: { havi: Array<number>(12).fill(0.9) } },
      ],
      hSzell: { F: zona.hSzell.F, H: WW.hSzellH },
    });
    expect(relativ(bNyarMindig.QHnetEv, WW.QHnetEv)).toBeLessThan(0.02);
    // a módszer szerinti évszakos b-vel (6.1.3) a hűtési igény a téli hónapokban más, az éves érték közel azonos
    expect(relativ(e.QHnetEv, WW.QHnetEv)).toBeLessThan(0.05);
  });

  it('NET-032 a módszer szerinti saját bemenettel (b évszakosan, éjszakai szellőzés május–szeptember, b_éjjel 1,5) a hűtési igény 19 %-kal nagyobb', () => {
    const e = nettoEnergiaigeny({ ...zona, hTrD: { F: WW.hTrD, H: WW.hTrD }, cmEff: WW.cmEffPerAN * be.heated_area });
    expect(relativ(e.QHnetEv, WW.QHnetEv)).toBeLessThan(0.2);
  });

  it('NET-027 a módszer szerinti saját bemenettel az eltérés dokumentált (E-12, E-13)', () => {
    const e = nettoEnergiaigeny(zona);
    expect(relativ(e.QFnetEv, WW.QFnetEv)).toBeLessThan(0.2);
  });
});

describe('Golden G3 – gépészet és indikátorok (a WinWatt nettó igényeivel)', () => {
  const AN = be.heated_area;
  const h = { elore: 35, vissza: 28 };
  const k = futesiHotermelo({ tipus: 'hoszivattyu', hoforras: 'Levegő/Víz', futoviz: h }, AN);
  const fut = futesiAlrendszer({
    QFnet: WW.QFnetEv,
    epsSzab: 1.018,
    Qszall: hoelosztasVesztesege('futott_terben', h, AN).ertek,
    Qtar: 0,
    epsF: k.epsF,
    Wsziv: szivattyuSegedenergia('ec_eei_023', 'beagyazott', 7, AN).ertek,
    Wtar: 0,
    Wterm: k.Wterm,
  });
  const net = lakoHmvNettoIgeny('Családi ház*', AN);
  const hmvK = hmvHotermelo({ tipus: 'elektromos', csoport: 'Hőszivattyú HMV készítésre', rendszer: 'Levegő' }, AN);
  const hmv = hmvRendszer({
    QHMVnet: net,
    Qszall: hmvElosztasiVesztesege(false, 'futott_terben', AN, net).ertek,
    Qtar: hmvTarolasiVesztesege('indirekt', 'futott_terben', AN, net).ertek,
    epsHMV: hmvK.epsHMV,
    Wcirk: cirkulaciosSegedenergia(false, AN).ertek,
    Wterm: hmvK.Wterm,
  });
  // E-14: a WinWatt a hővisszanyerős szellőzést csak a fűtési idényben (október–április, 212 nap · 24 h = 5088 h) üzemelteti.
  const Wvent = ventilatorEnergia({ VLT, dpLT: lt.dp, etaVent: lt.fan_eff / 100, tLTa: 5088 });
  const hut = hutesiRendszer({
    QHnet: WW.QHnetEv,
    cH: latensTenyezo('Közvetlen elpárologtatós rendszer (5 oC)'),
    epsSzab: hutesSzabalyozasiTenyezo('Direkt elpárologtatás'),
    epsH: hutesiTeljesitmenyTenyezo({ hutogep: 'Kompresszoros léghűtés (split)' }),
  });

  it('FUT-006 FUT-008 hőszivattyú puffer nélkül: E_F,vég 346 kWh/év villamos; W 138,24', () => {
    expect(fut.QFveg).toBeCloseTo(346, 0);
    expect(fut.WFveg).toBeCloseTo(vart.winwatt_projekt.epulet.EPBD_rendszerek['WinWatt32HeatingSystemItem']![0]!.WFinal, 1);
  });

  it('HMV-004 HMV-hőszivattyú: 1447 kWh/év', () => {
    expect(hmv.QHMVveg).toBeCloseTo(1447, 0);
  });

  it('LT-041 LT-044 ventilátor 54,95 kWh/év (5088 h, E-14); befúvás 20 °C alatt, f_LT = 0', () => {
    expect(Wvent).toBeCloseTo(54.95, 2);
    expect(illesztesiVeszteseg(18)).toBe(0);
  });

  it('HUT-001 split klíma: Q_H,vég 191,7 kWh/év (479 kWh/év ε_H nélkül)', () => {
    expect(hut.QHveg / 0.4).toBeCloseTo(479, 0);
  });

  it('IND-001 … IND-028 E_nren 52,19 kWh/m²év; E_CO2 10,55 kg/m²év; célonként egyezik', () => {
    const r = osszesitettEnergetikaiJellemzo(
      {
        F: { ho: [{ Qveg: fut.QFveg, hordozo: 'villamos', hoszivattyuEps: k.epsF }], W: fut.WFveg },
        HMV: { ho: [{ Qveg: hmv.QHMVveg, hordozo: 'villamos', hoszivattyuEps: hmvK.epsHMV }], W: hmv.WHMVveg },
        LT: { ho: [], W: Wvent },
        H: { ho: [{ Qveg: hut.QHveg, hordozo: 'villamos' }], W: hut.WHveg },
      },
      [],
      AN,
    );
    expect(r.celonkent.F!.nren).toBeCloseTo(11.61, 1);
    expect(r.celonkent.HMV!.nren).toBeCloseTo(34.67, 1);
    expect(r.celonkent.LT!.nren).toBeCloseTo(1.32, 2);
    expect(r.celonkent.H!.nren).toBeCloseTo(4.59, 2);
    expect(r.fajlagos.nren).toBeCloseTo(vart.oeny_etanusitas.Ep_kWh_m2a, 1);
    expect(r.fajlagos.co2).toBeCloseTo(vart.oeny_etanusitas.CO2_kg_m2a, 1);
  });
});
