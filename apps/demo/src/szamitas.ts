// A bemutató modell átalakítása a számítási mag hívásaivá (ugyanaz a lánc, mint a golden tesztekben).
import {
  HONAPOK,
  arany,
  besorolas,
  cirkulaciosSegedenergia,
  co2MaxLako,
  direktTranszmisszio,
  egyhejuNyilaszaroU,
  ejszakaiTobbletSzellozes,
  elemiKovetelmeny,
  enrenMaxLako,
  feluletiEllenallas,
  folyamatosHovisszanyerosSzellozesF,
  futesiAlrendszer,
  futesiHotermelo,
  hmvElosztasiVesztesege,
  hmvHotermelo,
  hmvRendszer,
  hmvTarolasiVesztesege,
  hoatbocsatasiTenyezo,
  hoelosztasVesztesege,
  homogenRtot,
  hotarolas,
  hotaroloKepesseg,
  hutesSzabalyozasiTenyezo,
  hutesiRendszer,
  hutesiTeljesitmenyTenyezo,
  lakoHmvNettoIgeny,
  latensTenyezo,
  napelemTermeles,
  nettoEnergiaigeny,
  osszesitettEnergetikaiJellemzo,
  psiPf,
  qmMax,
  referenciaFutes,
  referenciaHmv,
  referenciaInfiltracio,
  referenciaNettoEnergiaigeny,
  referenciaZona,
  retegEllenallas,
  rendszerMinosites,
  rendszerMinositesiArany,
  szivattyuSegedenergia,
  talajHoatvitel,
  talajonFekvoPadlo,
  termeszetesSzellozes,
  ventilatorEnergia,
  vizesSzabalyozasiTenyezo,
  type CelEnergia,
  type FutetlenHatarolo,
  type HaviEredmeny,
  type HoaramIrany,
  type Minosites,
  type NettoZonaBemenet,
  type ReferenciaHatarolo,
  type Tajolas,
  type Transzparens,
} from '../../../packages/calc-core/src/index.js';
import { OLDALAK, type Oldal, type Projekt, type Reteg } from './modell.js';

export interface SzerkezetSor {
  nev: string;
  A: number;
  U: number;
  Umax: number | null;
  megfelel: boolean | null;
  megjegyzes?: string;
}

export interface Eredmeny {
  AN: number;
  V: number;
  Aossz: number;
  av: number;
  szerkezetek: SzerkezetSor[];
  hTrD: number;
  hTrT: number;
  hSzellF: number;
  havi: HaviEredmeny[];
  QFnet: number;
  QHnet: number;
  qm: number;
  qmMax: number;
  futesVeg: { Q: number; W: number; hordozo: string };
  hmvVeg: { Q: number; W: number; hordozo: string };
  ltW: number;
  hutesVeg: number;
  pv: number;
  celonkent: Record<string, number>;
  Ep: number;
  CO2: number;
  EpMax: number;
  CO2Max: number;
  EpArany: number;
  CO2Arany: number;
  besorolasEp: string;
  besorolasCO2: string;
  futesMinosites: { arany: number; minosites: Minosites };
  hmvMinosites: { arany: number; minosites: Minosites };
  jelzesek: string[];
}

const U_retegekbol = (retegek: Reteg[], irany: HoaramIrany, mindketOldalBelso = false): number =>
  hoatbocsatasiTenyezo(
    homogenRtot(
      feluletiEllenallas({ irany, mindketOldalBelso }),
      retegek.map((r) => ({ tipus: 'homogen' as const, d: r.d / 100, lambda: r.lambda })),
    ),
  );

const R_retegek = (retegek: Reteg[]): number => retegek.reduce((s, r) => s + retegEllenallas(r.d / 100, r.lambda), 0);

function ablakU(p: Projekt, x: number, y: number): { U: number; Au: number } {
  const k = p.ablak.keretMm / 1000;
  const Au = Math.max(0, x - 2 * k) * Math.max(0, y - 2 * k);
  return { U: egyhejuNyilaszaroU({ uvegezes: [{ A: Au, U: p.ablak.Ug }], keret: [{ A: x * y - Au, U: p.ablak.Uf }] }), Au };
}

const MINOSITES_SZOVEG: Record<Minosites, string> = { rossz: 'rossz', gyenge: 'gyenge', kozepes: 'közepes', jo: 'jó', kivalo: 'kiváló' };
export const minositesSzoveg = (m: Minosites): string => MINOSITES_SZOVEG[m];

export function szamol(p: Projekt): Eredmeny {
  const jelzesek: string[] = [];
  const AN = p.hossz * p.szelesseg * p.szintek;
  const V = AN * p.belmagassag;
  const alap = p.hossz * p.szelesseg;
  const oldalHossz = (o: Oldal): number => (o === 'É' || o === 'D' ? p.hossz : p.szelesseg);

  const szerkezetek: SzerkezetSor[] = [];
  const elem = (nev: string, kod: string, A: number, U: number, megjegyzes?: string): void => {
    const k = elemiKovetelmeny({ kod, U, ujEpulet: true, felulet: A });
    szerkezetek.push({ nev, A, U, Umax: k.uMax, megfelel: k.alkalmazando ? k.megfelel : null, ...(megjegyzes ? { megjegyzes } : {}) });
  };

  const uFal = U_retegekbol(p.falRetegek, 'vizszintes');
  const elemek: { A: number; U: number }[] = [];
  const transzparens: Transzparens[] = [];
  const futetlen: FutetlenHatarolo[] = [];
  const refHatarolok: ReferenciaHatarolo[] = [];
  let Aossz = 0;
  let falOssz = 0;
  let ablakOssz = 0;
  let ablakUA = 0;

  for (const o of OLDALAK) {
    const brutto = oldalHossz(o) * p.belmagassag * p.szintek;
    Aossz += brutto;
    if (p.garazsOldal === o) {
      const U = U_retegekbol(p.garazsfalRetegek, 'vizszintes', true);
      futetlen.push({ hTrIx: brutto * U, b: { tipus: 'Zárt, fűtetlen garázzsal határos födém vagy fal' } });
      elem('Fal fűtetlen garázs felé', 'futott_futetlen_kozotti_fal', brutto, U);
      refHatarolok.push({ kod: 'futott_futetlen_kozotti_fal', A: brutto, futetlen: { tipus: 'Zárt, fűtetlen garázzsal határos födém vagy fal' } });
      continue;
    }
    let nyilasA = 0;
    for (const n of p.nyilasok.filter((x) => x.oldal === o)) {
      const a = ablakU(p, n.x, n.y);
      const A = n.x * n.y * n.db;
      elemek.push({ A, U: a.U });
      transzparens.push({ Au: a.Au * n.db, gN: p.ablak.g, tajolas: o as Tajolas, hajlasszog: 90, fArny: { F: 1, H: 1 } });
      refHatarolok.push({ kod: 'ablak_fa_pvc', A, tajolas: o as Tajolas, transzparens: { fKeret: 1 - a.Au / (n.x * n.y), fArny: { F: 1, H: 1 } } });
      nyilasA += A;
      ablakOssz += A;
      ablakUA += A * a.U;
    }
    if (p.ajto.oldal === o) {
      const A = p.ajto.x * p.ajto.y;
      elemek.push({ A, U: p.ajto.U });
      refHatarolok.push({ kod: 'ajto', A, tajolas: o as Tajolas });
      elem('Bejárati ajtó', 'ajto', A, p.ajto.U);
      nyilasA += A;
    }
    if (nyilasA > brutto) throw new Error(`A(z) ${o} homlokzaton a nyílászárók nagyobbak a falnál.`);
    elemek.push({ A: brutto - nyilasA, U: uFal });
    falOssz += brutto - nyilasA;
    refHatarolok.push({
      kod: 'homlokzati_fal',
      A: brutto - nyilasA,
      tajolas: o as Tajolas,
      hohid: { szerkezet: 'Külső falak', alcsoport: 'külső oldali, vagy szerkezeten belüli megszakítatlan hőszigeteléssel', hohidassag: p.refHohidassag },
    });
  }
  elem('Külső fal', 'homlokzati_fal', falOssz, uFal);
  if (ablakOssz > 0) elem('Ablakok (átlag)', 'ablak_fa_pvc', ablakOssz, ablakUA / ablakOssz);

  if (p.teto === 'lapostető') {
    const U = U_retegekbol(p.tetoRetegek, 'felfele');
    elemek.push({ A: alap, U });
    elem('Lapostető', 'lapos_teto', alap, U);
    refHatarolok.push({ kod: 'lapos_teto', A: alap, hohid: { szerkezet: 'Lapostetők', hohidassag: p.refHohidassag } });
  } else {
    const U = U_retegekbol(p.tetoRetegek, 'felfele', true);
    futetlen.push({ hTrIx: alap * U, b: { tipus: 'Padlástérrel határos födém vagy fal' } });
    elem('Padlásfödém', 'padlasfodem', alap, U);
    refHatarolok.push({ kod: 'padlasfodem', A: alap, futetlen: { tipus: 'Padlástérrel határos födém vagy fal' }, hohid: { szerkezet: 'Padlásfödémek' } });
  }
  Aossz += alap;

  let hTrT = 0;
  if (p.padlo === 'talajon fekvő') {
    const P = 2 * (p.hossz + p.szelesseg);
    const df = p.falRetegek.reduce((s, r) => s + r.d / 100, 0);
    const padlo = talajonFekvoPadlo({ A: alap, P, df, rP: R_retegek(p.padloRetegek), melyseg: 0 });
    const falazat = [...p.falRetegek].sort((a, b) => b.d - a.d)[0]!;
    const psi = psiPf({
      lambdaFalazat: falazat.lambda,
      kulsoFalKialakitasa: 'külső oldali, megszakítatlan hőszigeteléssel',
      labazatiFal: 'Lábazati fal a terepszint alatt 0,5 m-ig hőszigetelt',
      padloHoszigetelesR: Math.max(...p.padloRetegek.map((r) => retegEllenallas(r.d / 100, r.lambda))),
    });
    hTrT = talajHoatvitel(alap, padlo.U, P, psi);
    elem('Talajon fekvő padló (egyenértékű)', 'talajon_fekvo_padlo', alap, padlo.U, `B = ${padlo.B.toFixed(2)} m, Ψ = ${psi} W/mK`);
    jelzesek.push('Feltevés: a lábazati fal a terepszint alatt 0,5 m-ig hőszigetelt (6.4. táblázat).');
  } else {
    const U = U_retegekbol(p.padloRetegek, 'lefele', true);
    futetlen.push({ hTrIx: alap * U, b: { tipus: 'Zárt, fűtetlen pincével határos födém vagy fal' } });
    elem('Pincefödém', 'also_zarofodem_futetlen_felett', alap, U);
    refHatarolok.push({
      kod: 'also_zarofodem_futetlen_felett',
      A: alap,
      futetlen: { tipus: 'Zárt, fűtetlen pincével határos födém vagy fal' },
      hohid: { szerkezet: 'Pincefödémek', alcsoport: 'alsó oldali hőszigeteléssel' },
    });
  }
  Aossz += alap;

  // Szellőzés: fűtésre a választott mód, nyáron természetes szellőzés éjszakai többlettel (6.2.2–6.2.3).
  const ej = { zajPorRendben: true, nincsVagyonvedelmiKockazat: true, automatikusNyitasVagyLako: true };
  const term = termeszetesSzellozes(0.5, 1, p.nFilt, V);
  const hSzellF = p.szellozes.tipus === 'hővisszanyerős' ? folyamatosHovisszanyerosSzellozesF(p.szellozes.n * V, p.szellozes.eta, p.nFilt, V) : term;
  const hSzellH = HONAPOK.map((m) => term + ejszakaiTobbletSzellozes(m, 6, V, ej));

  const hTrD = direktTranszmisszio({ elemek });
  const zona: NettoZonaBemenet = {
    aN: AN,
    V,
    thetaIF: 20,
    thetaIH: 26,
    cmEff: hotaroloKepesseg(p.cmKategoria, AN),
    hTrD: { F: hTrD, H: hTrD },
    futetlen,
    hTrT,
    hSzell: { F: hSzellF, H: hSzellH },
    transzparens,
    qb: 5,
    sigmaF: 1,
    sigmaH: 1,
  };
  const net = nettoEnergiaigeny(zona);

  // Fűtés
  const radiator = p.futes.hoelado === 'radiátor 55/45';
  const hl = radiator ? { elore: 55, vissza: 45 } : { elore: 35, vissza: 28 };
  const hely = (x: 'fűtött térben' | 'fűtött téren kívül') => (x === 'fűtött térben' ? ('futott_terben' as const) : ('futott_teren_kivul' as const));
  const kazan = p.futes.hotermelo === 'kondenzációs gázkazán';
  const ht = kazan
    ? futesiHotermelo({ tipus: 'kazan', kazan: 'kondenzacios', elhelyezes: hely(p.futes.hotermeloHelye) }, AN)
    : futesiHotermelo({ tipus: 'hoszivattyu', hoforras: 'Levegő/Víz', futoviz: hl }, AN);
  jelzesek.push(...ht.jelzesek);
  const epsSzab = vizesSzabalyozasiTenyezo(
    radiator
      ? {
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
        }
      : {
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
        },
  );
  const szall = hoelosztasVesztesege(hely(p.futes.elosztasHelye), hl, AN);
  jelzesek.push(...szall.jelzesek);
  const tar = p.futes.puffer ? hotarolas('futott_terben', hl, AN, false) : { Qtar: 0, Wtar: 0, jelzesek: [] };
  jelzesek.push(...tar.jelzesek);
  const sziv = szivattyuSegedenergia('ec_eei_023', radiator ? 'szabad' : 'beagyazott', radiator ? 10 : 7, AN);
  const fut = futesiAlrendszer({ QFnet: net.QFnetEv, epsSzab, Qszall: szall.ertek, Qtar: tar.Qtar, epsF: ht.epsF, Wsziv: sziv.ertek, Wtar: tar.Wtar, Wterm: ht.Wterm });

  // HMV
  const qHmv = lakoHmvNettoIgeny(p.funkcio, AN);
  const hmvKazan = p.hmv.hotermelo === 'a fűtési gázkazán';
  const hk = hmvKazan
    ? hmvHotermelo({ tipus: 'kazan', kazan: 'kondenzacios' }, AN)
    : hmvHotermelo({ tipus: 'elektromos', csoport: 'Hőszivattyú HMV készítésre', rendszer: 'Levegő' }, AN);
  const hmvSzall = hmvElosztasiVesztesege(p.hmv.cirkulacio, 'futott_terben', AN, qHmv);
  const hmvTar = hmvTarolasiVesztesege('indirekt', 'futott_terben', AN, qHmv);
  jelzesek.push(...hmvSzall.jelzesek, ...hmvTar.jelzesek, ...hk.jelzesek.filter((j) => !j.startsWith('HMV-037')));
  const hmv = hmvRendszer({
    QHMVnet: qHmv,
    Qszall: hmvSzall.ertek,
    Qtar: hmvTar.ertek,
    epsHMV: hk.epsHMV,
    Wcirk: cirkulaciosSegedenergia(p.hmv.cirkulacio ? 0.23 : false, AN).ertek,
    Wterm: hk.Wterm,
  });

  // Légtechnika, hűtés, napelem
  const ltW =
    p.szellozes.tipus === 'hővisszanyerős'
      ? ventilatorEnergia({ VLT: p.szellozes.n * V, dpLT: p.szellozes.dp, etaVent: p.szellozes.etaVent, tLTa: p.szellozes.uzemido })
      : 0;
  const hut =
    p.hutes === 'split klíma'
      ? hutesiRendszer({
          QHnet: net.QHnetEv,
          cH: latensTenyezo('Közvetlen elpárologtatós rendszer (5 oC)'),
          epsSzab: hutesSzabalyozasiTenyezo('Direkt elpárologtatás'),
          epsH: hutesiTeljesitmenyTenyezo({ hutogep: 'Kompresszoros léghűtés (split)' }),
        })
      : null;
  const pv = p.napelem.kWp > 0 ? napelemTermeles(p.napelem.kWp, p.napelem.tajolas, p.napelem.dolesszog) : 0;

  const celok: Record<string, CelEnergia> = {
    F: kazan
      ? { ho: [{ Qveg: fut.QFveg, hordozo: 'fosszilis_gaz' }], W: fut.WFveg }
      : { ho: [{ Qveg: fut.QFveg, hordozo: 'villamos', hoszivattyuEps: ht.epsF }], W: fut.WFveg },
    HMV: hmvKazan
      ? { ho: [{ Qveg: hmv.QHMVveg, hordozo: 'fosszilis_gaz' }], W: hmv.WHMVveg }
      : { ho: [{ Qveg: hmv.QHMVveg, hordozo: 'villamos', hoszivattyuEps: hk.epsHMV }], W: hmv.WHMVveg },
  };
  if (ltW > 0) celok['LT'] = { ho: [], W: ltW };
  if (hut) celok['H'] = { ho: [{ Qveg: hut.QHveg, hordozo: 'villamos' }], W: hut.WHveg };
  const ind = osszesitettEnergetikaiJellemzo(celok, pv > 0 ? [{ Wexp: pv, termelo: 'nap_pv', cel: 'export_halozatba' }] : [], AN);
  const celonkent: Record<string, number> = {};
  for (const [k, v] of Object.entries(ind.celonkent)) celonkent[k] = v.nren;
  if (pv > 0) celonkent['PV'] = -ind.exp.nren;

  const av = Aossz / V;
  const EpMax = enrenMaxLako(av, 'kozel_nulla');
  const CO2Max = co2MaxLako('kozel_nulla')!;
  const EpArany = arany(ind.fajlagos.nren, EpMax);
  const CO2Arany = arany(ind.fajlagos.co2, CO2Max);

  // Rendszerminősítés a referenciaépülettel (9/2023 ÉKM 5. melléklet, 176/2008 5. melléklet)
  const nFiltRef = referenciaInfiltracio(true);
  const refTerm = termeszetesSzellozes(0.5, 1, nFiltRef, V);
  const refZona = referenciaZona(
    { targy: zona, hatarolok: refHatarolok, ujEpulet: true, ...(p.padlo === 'talajon fekvő' ? { talajonFekvoPadloA: alap } : {}) },
    { F: refTerm, H: HONAPOK.map((m) => refTerm + ejszakaiTobbletSzellozes(m, 6, V, ej)) },
  );
  const refNet = referenciaNettoEnergiaigeny(refZona, true);
  const refF = referenciaFutes({
    QFnet: refNet.QFnetEv,
    aRszr: AN,
    hotermeloHelye: hely(p.futes.hotermeloHelye),
    elosztasHelye: hely(p.futes.elosztasHelye),
    hoeladokSzama: 10,
  });
  const refH = referenciaHmv({ QHMVnet: qHmv, aRszr: AN, elosztasHelye: 'futott_terben' });
  const fAr = rendszerMinositesiArany(ind.celonkent['F']!.nren * AN, refF.sulyozott.nren, net.QFnetEv, refNet.QFnetEv);
  const hAr = rendszerMinositesiArany(ind.celonkent['HMV']!.nren * AN, refH.sulyozott.nren);
  jelzesek.push(`Feltevés: a referenciaépület csatlakozási hőhidassága „${p.refHohidassag}”.`);

  return {
    AN,
    V,
    Aossz,
    av,
    szerkezetek,
    hTrD,
    hTrT,
    hSzellF,
    havi: net.havi,
    QFnet: net.QFnetEv,
    QHnet: net.QHnetEv,
    qm: net.qm,
    qmMax: qmMax(av, 'kozel_nulla'),
    futesVeg: { Q: fut.QFveg, W: fut.WFveg, hordozo: kazan ? 'földgáz (égéshő)' : 'villamos' },
    hmvVeg: { Q: hmv.QHMVveg, W: hmv.WHMVveg, hordozo: hmvKazan ? 'földgáz (égéshő)' : 'villamos' },
    ltW,
    hutesVeg: hut?.QHveg ?? 0,
    pv,
    celonkent,
    Ep: ind.fajlagos.nren,
    CO2: ind.fajlagos.co2,
    EpMax,
    CO2Max,
    EpArany,
    CO2Arany,
    besorolasEp: besorolas(EpArany),
    besorolasCO2: besorolas(CO2Arany),
    futesMinosites: { arany: fAr, minosites: rendszerMinosites(fAr, 'futes') },
    hmvMinosites: { arany: hAr, minosites: rendszerMinosites(hAr, 'hmv') },
    jelzesek: [...new Set(jelzesek)],
  };
}
