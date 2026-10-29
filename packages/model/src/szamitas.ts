// A projekt teljes számítása: adatmodell → számítási mag → eredmény. Egy zóna (lakóépületnél a fűtött téren belül
// nem kell zónázni; 2. függ. 2.1. táblázat, segédlet 5. fejezet), egyszerűsített havi módszer.
import {
  HONAPOK,
  SzamitasiHiba,
  arany,
  besorolas,
  celSulyozottEnergia,
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
  hohiddalKorrigaltU,
  homogenRtot,
  hotarolas,
  hotaroloKepesseg,
  hutesSzabalyozasiTenyezo,
  hutesiRendszer,
  hutesiTeljesitmenyTenyezo,
  lakoHmvNettoIgeny,
  latensTenyezo,
  napelemTermeles,
  napkollektorosHmv,
  nyariHovedelem,
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
  szolarSzivattyuSegedenergia,
  talajHoatvitel,
  talajonFekvoPadlo,
  futottPinceFal,
  terepszintFelettiPadlo,
  karakterisztikusMeret,
  szamitasiMelyseg,
  termeszetesSzellozes,
  ventilatorEnergia,
  vizesSzabalyozasiTenyezo,
  zeta,
  type CelEnergia,
  type FelhasznalasiCel,
  type FutetlenHatarolo,
  type HaviEredmeny,
  type HoaramIrany,
  type Minosites,
  type NettoZonaBemenet,
  type ReferenciaHatarolo,
  type Transzparens,
  type ZetaBemenet,
} from '@bimline/calc-core';
import { ellenoriz, type Hiany } from './ellenorzes.js';
import type { Hatarolo, NyilaszaroTipus, Projekt, Retegrend, SzerkezetTipus } from './projekt.js';

export interface SzerkezetEredmeny {
  nev: string;
  szerkezet: SzerkezetTipus | 'nyilaszaro';
  A: number;
  U: number;
  Umax: number | null;
  megfelel: boolean | null;
  megjegyzes?: string;
}

export interface ProjektEredmeny {
  AN: number;
  V: number;
  Aossz: number;
  av: number;
  szerkezetek: SzerkezetEredmeny[];
  hTrD: number;
  hTrT: number;
  hSzellF: number;
  havi: HaviEredmeny[];
  QFnet: number;
  QHnet: number;
  qm: number;
  qmMax: number;
  nyariHovedelem: { alkalmazando: boolean; arany: number | null; hatar: number; megfelel: boolean };
  vegso: { cel: FelhasznalasiCel | 'PV'; nev: string; Q: number; W: number; hordozo: string }[];
  celonkent: Partial<Record<FelhasznalasiCel | 'PV', { nren: number; co2: number }>>;
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

export type SzamitasKimenet = { rendben: true; eredmeny: ProjektEredmeny; figyelmeztetesek: Hiany[] } | { rendben: false; hianyok: Hiany[] };

interface SzerkezetJellemzo {
  irany: (h: Hatarolo) => HoaramIrany;
  hohid?: (p: Projekt) => ZetaBemenet;
}

const SZERKEZETEK: Record<SzerkezetTipus, SzerkezetJellemzo> = {
  homlokzati_fal: {
    irany: () => 'vizszintes',
    hohid: (p) => ({
      szerkezet: 'Külső falak',
      alcsoport: p.epulet.kulsoFalKialakitasa === 'külső oldali, megszakítatlan hőszigeteléssel' ? 'külső oldali, vagy szerkezeten belüli megszakítatlan hőszigeteléssel' : 'egyéb külső falak',
      hohidassag: p.epulet.hohidassag,
    }),
  },
  lapos_teto: { irany: () => 'felfele', hohid: (p) => ({ szerkezet: 'Lapostetők', hohidassag: p.epulet.hohidassag }) },
  futott_tetoter_hatarolo: {
    irany: (h) => ((h.hajlasszog ?? 45) > 60 ? 'vizszintes' : 'felfele'),
    hohid: (p) => ({ szerkezet: 'Beépített tetőteret határoló szerkezetek', hohidassag: p.epulet.hohidassag }),
  },
  padlasfodem: { irany: () => 'felfele', hohid: () => ({ szerkezet: 'Padlásfödémek' }) },
  arkad_athajto_feletti_fodem: { irany: () => 'lefele', hohid: () => ({ szerkezet: 'Árkádfödémek' }) },
  also_zarofodem_futetlen_felett: { irany: () => 'lefele', hohid: () => ({ szerkezet: 'Pincefödémek', alcsoport: 'alsó oldali hőszigeteléssel' }) },
  futott_futetlen_kozotti_fal: {
    irany: () => 'vizszintes',
    hohid: () => ({ szerkezet: 'Fűtött és fűtetlen terek közötti falak, fűtött pincetereket határoló, külső oldalon hőszigetelt falak' }),
  },
  szomszed_futott_epulet_fal: { irany: () => 'vizszintes' },
  talajon_fekvo_padlo: { irany: () => 'lefele' },
  talajjal_erintkezo_fal: { irany: () => 'vizszintes' },
};

const ELH = (h: 'futott_terben' | 'futott_teren_kivul') => h;

/** A projekt teljes számítása; hiányos vagy hibás adatnál a hiánylistát adja vissza. */
export function szamolProjekt(p: Projekt): SzamitasKimenet {
  const ell = ellenoriz(p);
  const hibak = ell.filter((h) => h.sulyossag === 'hiba');
  if (hibak.length) return { rendben: false, hianyok: hibak };
  try {
    return { rendben: true, eredmeny: szamol(p), figyelmeztetesek: ell.filter((h) => h.sulyossag !== 'hiba') };
  } catch (e) {
    const id = e instanceof SzamitasiHiba ? e.matrixId : 'program';
    return { rendben: false, hianyok: [{ sulyossag: 'hiba', hely: 'számítás', uzenet: `${(e as Error).message} (${id})` }] };
  }
}

function szamol(p: Projekt): ProjektEredmeny {
  const jelzesek: string[] = [];
  const anyag = new Map(p.anyagok.map((a) => [a.azon, a]));
  const rr = new Map(p.retegrendek.map((r) => [r.azon, r]));
  const ny = new Map(p.nyilaszarok.map((n) => [n.azon, n]));
  const retegek = (r: Retegrend) => r.retegek.map((x) => ({ tipus: 'homogen' as const, d: x.d, lambda: anyag.get(x.anyagAzon)!.lambda }));
  const Rretegek = (r: Retegrend): number => r.retegek.reduce((s, x) => s + retegEllenallas(x.d, anyag.get(x.anyagAzon)!.lambda), 0);

  const AN = p.helyisegek.reduce((s, h) => s + h.alapterulet, 0);
  const V = p.helyisegek.reduce((s, h) => s + h.alapterulet * h.belmagassag, 0);

  // Nyílászáró U (4.16): keret körben, Ψ_g az üvegezés kerülete mentén.
  const nyU = (t: NyilaszaroTipus, x: number, y: number): { U: number; Au: number } => {
    if (t.osszetevok) {
      const o = t.osszetevok;
      const ux = Math.max(0, x - 2 * o.keretSzelesseg);
      const uy = Math.max(0, y - 2 * o.keretSzelesseg);
      const Au = ux * uy;
      return {
        U: egyhejuNyilaszaroU({ uvegezes: [{ A: Au, U: o.Ug }], keret: [{ A: x * y - Au, U: o.Uf }], keretUveg: [{ l: 2 * (ux + uy), psi: o.psiG }] }),
        Au,
      };
    }
    return { U: t.U!, Au: 0 };
  };

  const elemek: { A: number; U: number }[] = [];
  const transzparens: Transzparens[] = [];
  const futetlen: FutetlenHatarolo[] = [];
  const refHatarolok: ReferenciaHatarolo[] = [];
  const szerkOssz = new Map<string, { A: number; UA: number; r: Retegrend; megj?: string }>();
  const nyOssz = new Map<string, { A: number; UA: number; t: NyilaszaroTipus }>();
  let Aossz = 0;
  let hTrT = 0;
  let talajA = 0;
  const falVastagsag = Math.max(0, ...p.retegrendek.filter((r) => r.szerkezet === 'homlokzati_fal').map((r) => r.retegek.reduce((s, x) => s + x.d, 0)));
  const falazatLambda = (() => {
    const fal = p.retegrendek.find((r) => r.szerkezet === 'homlokzati_fal');
    if (!fal) return null;
    const vastag = [...fal.retegek].sort((a, b) => b.d - a.d)[0]!;
    return anyag.get(vastag.anyagAzon)!.lambda;
  })();

  // A karakterisztikus méret (4.20) a teljes, összefüggő padlóra számítandó, nem helyiségenként (E-02, D-140).
  const talajPadlok = p.helyisegek.flatMap((h) => h.hatarolok).filter((b) => rr.get(b.retegrendAzon)!.szerkezet === 'talajon_fekvo_padlo');
  const padloAossz = talajPadlok.reduce((s, b) => s + b.felulet, 0);
  const padloPossz = talajPadlok.reduce((s, b) => s + (b.kitettKerulet ?? 0), 0);

  for (const h of p.helyisegek) {
    for (const b of h.hatarolok) {
      const r = rr.get(b.retegrendAzon)!;
      const j = SZERKEZETEK[r.szerkezet];
      Aossz += b.felulet;
      let nyilasA = 0;
      for (const n of b.nyilasok) {
        const t = ny.get(n.nyilaszaroAzon)!;
        const { U, Au } = nyU(t, n.szelesseg, n.magassag);
        const A = n.szelesseg * n.magassag * n.db;
        nyilasA += A;
        const o = nyOssz.get(t.azon) ?? { A: 0, UA: 0, t };
        o.A += A;
        o.UA += A * U;
        nyOssz.set(t.azon, o);
        if (b.tuloldal.fajta === 'külső') elemek.push({ A, U });
        else if (b.tuloldal.fajta === 'fűtetlen') futetlen.push({ hTrIx: A * U, b: { tipus: b.tuloldal.ter } });
        if (t.fajta === 'ablak' && b.tuloldal.fajta === 'külső') {
          transzparens.push({ Au: Au * n.db, gN: t.osszetevok!.g, tajolas: b.tajolas!, hajlasszog: b.hajlasszog ?? 90, fArny: { F: 1, H: 1 } });
          refHatarolok.push({
            kod: t.fajta === 'ablak' ? 'ablak_fa_pvc' : 'ajto',
            A,
            tajolas: b.tajolas!,
            hajlasszog: b.hajlasszog ?? 90,
            transzparens: { fKeret: 1 - Au / (n.szelesseg * n.magassag), fArny: { F: 1, H: 1 } },
          });
        } else if (b.tuloldal.fajta === 'külső' || b.tuloldal.fajta === 'fűtetlen') {
          refHatarolok.push({
            kod: 'ajto',
            A,
            ...(b.tajolas ? { tajolas: b.tajolas } : {}),
            ...(b.tuloldal.fajta === 'fűtetlen' ? { futetlen: { tipus: b.tuloldal.ter } } : {}),
          });
        }
      }
      const Anetto = b.felulet - nyilasA;

      if (r.szerkezet === 'talajon_fekvo_padlo') {
        const P = b.kitettKerulet ?? 0;
        const zSzam = szamitasiMelyseg(b.melyseg ?? 0);
        // Terepszint feletti padló (4.4.3): (4.24)–(4.26), m = a padló felső síkjának magassága a terepszint felett.
        const lf = zSzam < 0 ? rr.get(b.labazatiFalRetegrendAzon!)! : undefined;
        const padlo = lf
          ? {
              B: karakterisztikusMeret(padloAossz, padloPossz),
              z: 0,
              dp: 0,
              U: terepszintFelettiPadlo({
                A: padloAossz,
                P: padloPossz,
                Up: hoatbocsatasiTenyezo(homogenRtot(feluletiEllenallas({ irany: 'lefele' }), retegek(r))),
                Ulf: hoatbocsatasiTenyezo(homogenRtot(feluletiEllenallas({ irany: 'vizszintes' }), retegek(lf))),
                dlf: lf.retegek.reduce((s, x) => s + x.d, 0),
                m: -zSzam,
              }),
            }
          : talajonFekvoPadlo({ A: padloAossz, P: padloPossz, df: falVastagsag, rP: Rretegek(r), melyseg: b.melyseg ?? 0 });
        // Fűtött pince (4.4.4): a pincefal U_T,pf-je (4.28) a pincepadló d_p-jével; hőátvitele z·P·U_T,pf (6.6).
        let pince: { z: number; uTpf: number } | undefined;
        if (padlo.z > 0) {
          const falR = rr.get(b.pinceFalRetegrendAzon!)!;
          pince = { z: padlo.z, uTpf: futottPinceFal({ z: padlo.z, dp: padlo.dp, rPf: Rretegek(falR) }) };
          const Afal = padlo.z * P;
          Aossz += Afal;
          const of = szerkOssz.get(falR.azon) ?? { A: 0, UA: 0, r: falR, megj: `z = ${String(padlo.z).replace('.', ',')} m; felület z·P (6.6)` };
          of.A += Afal;
          of.UA += Afal * pince.uTpf;
          szerkOssz.set(falR.azon, of);
          refHatarolok.push({ kod: 'talajjal_erintkezo_fal', A: Afal });
        }
        const psi =
          P > 0 && falazatLambda !== null
            ? psiPf({
                lambdaFalazat: falazatLambda,
                kulsoFalKialakitasa: p.epulet.kulsoFalKialakitasa,
                labazatiFal: p.epulet.labazatiFal,
                padloHoszigetelesR: Math.max(...r.retegek.map((x) => retegEllenallas(x.d, anyag.get(x.anyagAzon)!.lambda))),
              })
            : 0;
        hTrT += talajHoatvitel(b.felulet, padlo.U, P, psi, pince);
        talajA += b.felulet;
        const o = szerkOssz.get(r.azon) ?? { A: 0, UA: 0, r, megj: `B = ${padlo.B.toFixed(2).replace('.', ',')} m; Ψ_p,f = ${String(psi).replace('.', ',')} W/mK${padlo.z > 0 ? `; z = ${String(padlo.z).replace('.', ',')} m` : ''}${lf ? `; terepszint felett ${String(-zSzam).replace('.', ',')} m (4.24)` : ''}` };
        o.A += b.felulet;
        o.UA += b.felulet * padlo.U;
        szerkOssz.set(r.azon, o);
        continue;
      }

      const belso = b.tuloldal.fajta !== 'külső';
      let U = hoatbocsatasiTenyezo(homogenRtot(feluletiEllenallas({ irany: j.irany(b), mindketOldalBelso: belso }), retegek(r)));
      const o = szerkOssz.get(r.azon) ?? { A: 0, UA: 0, r };
      o.A += Anetto;
      o.UA += Anetto * U;
      szerkOssz.set(r.azon, o);
      if (j.hohid) U = hohiddalKorrigaltU(U, zeta(j.hohid(p)));
      if (b.tuloldal.fajta === 'külső') elemek.push({ A: Anetto, U });
      else if (b.tuloldal.fajta === 'fűtetlen') futetlen.push({ hTrIx: Anetto * U, b: { tipus: b.tuloldal.ter } });
      if (b.tuloldal.fajta === 'külső' || b.tuloldal.fajta === 'fűtetlen') {
        refHatarolok.push({
          kod: r.szerkezet,
          A: Anetto,
          ...(b.tajolas ? { tajolas: b.tajolas } : {}),
          ...(b.hajlasszog !== undefined ? { hajlasszog: b.hajlasszog } : {}),
          ...(b.tuloldal.fajta === 'fűtetlen' ? { futetlen: { tipus: b.tuloldal.ter } } : {}),
          ...(j.hohid ? { hohid: j.hohid(p) } : {}),
        });
      }
    }
  }

  const szerkezetek: SzerkezetEredmeny[] = [];
  for (const o of szerkOssz.values()) {
    const U = o.A > 0 ? o.UA / o.A : 0;
    const k = elemiKovetelmeny({ kod: o.r.szerkezet, U: U || 1e-9, ujEpulet: p.epulet.ujEpulet, felulet: o.A });
    szerkezetek.push({ nev: o.r.nev, szerkezet: o.r.szerkezet, A: o.A, U, Umax: k.uMax, megfelel: k.alkalmazando ? k.megfelel : null, ...(o.megj ? { megjegyzes: o.megj } : {}) });
  }
  for (const o of nyOssz.values()) {
    const U = o.UA / o.A;
    const kod = o.t.fajta === 'ablak' ? 'ablak_fa_pvc' : 'ajto';
    const k = elemiKovetelmeny({ kod, U, ujEpulet: p.epulet.ujEpulet, felulet: o.A });
    szerkezetek.push({ nev: o.t.nev, szerkezet: 'nyilaszaro', A: o.A, U, Umax: k.uMax, megfelel: k.alkalmazando ? k.megfelel : null });
  }

  // Szellőzés
  const ej = { zajPorRendben: true, nincsVagyonvedelmiKockazat: true, automatikusNyitasVagyLako: true };
  const sz = p.rendszerek.szellozes;
  const term = termeszetesSzellozes(0.5, 1, p.epulet.nFilt, V);
  const hSzellF = sz.fajta === 'hővisszanyerős' ? folyamatosHovisszanyerosSzellozesF(sz.legcsere * V, sz.etaR, p.epulet.nFilt, V) : term;
  const hTrD = direktTranszmisszio({ elemek });
  const zona: NettoZonaBemenet = {
    aN: AN,
    V,
    thetaIF: 20,
    thetaIH: 26,
    cmEff: hotaroloKepesseg(p.epulet.cmKategoria, AN),
    hTrD: { F: hTrD, H: hTrD },
    futetlen,
    hTrT,
    hSzell: { F: hSzellF, H: HONAPOK.map((m) => term + ejszakaiTobbletSzellozes(m, 6, V, ej)) },
    transzparens,
    qb: 5,
    sigmaF: 1,
    sigmaH: 1,
  };
  const net = nettoEnergiaigeny(zona);

  // Fűtés
  const f = p.rendszerek.futes;
  const ht = futesiHotermelo(f.hotermelo, AN);
  jelzesek.push(...ht.jelzesek);
  const szall = hoelosztasVesztesege(ELH(f.elosztasHelye), f.hofoklepcso, AN);
  const tar = f.tarolo ? hotarolas(f.tarolo.helye, f.hofoklepcso, AN, f.hotermelo.tipus === 'szilard') : { Qtar: 0, Wtar: 0, jelzesek: [] };
  const sziv = szivattyuSegedenergia(f.szivattyu, f.hoelado, f.hoelado === 'beagyazott' ? 7 : 10, AN);
  jelzesek.push(...szall.jelzesek, ...tar.jelzesek, ...sziv.jelzesek);
  const fut = futesiAlrendszer({
    QFnet: net.QFnetEv,
    epsSzab: vizesSzabalyozasiTenyezo(f.szabalyozas),
    Qszall: szall.ertek,
    Qtar: tar.Qtar,
    epsF: ht.epsF,
    Wsziv: sziv.ertek,
    Wtar: tar.Wtar,
    Wterm: ht.Wterm,
  });
  const hp = (t: string): boolean => t.startsWith('hoszivattyu') || t === 'erp_hoszivattyu';

  // HMV
  const hm = p.rendszerek.hmv;
  const qHmv = lakoHmvNettoIgeny(p.epulet.rendeltetes, AN);
  const hk = hmvHotermelo(hm.hotermelo, AN);
  const hmvSzall = hmvElosztasiVesztesege(hm.cirkulacio !== false, hm.elosztasHelye, AN, qHmv);
  const hmvTar = hmvTarolasiVesztesege(hm.tarolo?.fajta ?? null, hm.tarolo?.helye ?? 'futott_terben', AN, qHmv);
  jelzesek.push(...hk.jelzesek, ...hmvSzall.jelzesek, ...hmvTar.jelzesek);
  let hmvQveg: number;
  const hmvBase = hmvRendszer({
    QHMVnet: qHmv,
    Qszall: hmvSzall.ertek,
    Qtar: hmvTar.ertek,
    epsHMV: hk.epsHMV,
    Wcirk: cirkulaciosSegedenergia(hm.cirkulacio, AN).ertek,
    ...(hm.napkollektor ? { Wszol: szolarSzivattyuSegedenergia(hm.napkollektor.AkollBrutto) } : {}),
    Wterm: hk.Wterm,
  });
  if (hm.napkollektor) {
    const k = napkollektorosHmv({ QHMVnet: qHmv, Qszall: hmvSzall.ertek, Qtar: hmvTar.ertek, eps2: hk.epsHMV, aRszr: AN }, hm.napkollektor);
    hmvQveg = k.QHMVveg2;
    jelzesek.push(...k.jelzesek);
  } else hmvQveg = hmvBase.QHMVveg;
  const hmvW = hmvBase.WHMVveg;

  // Légtechnika, hűtés, napelem
  const ltW = sz.fajta === 'hővisszanyerős' ? ventilatorEnergia({ VLT: sz.legcsere * V, dpLT: sz.dp, tLTa: sz.uzemido, ...(sz.etaVent !== undefined ? { etaVent: sz.etaVent } : {}) }) : 0;
  const hu = p.rendszerek.hutes;
  const hut = hu
    ? hutesiRendszer({
        QHnet: net.QHnetEv,
        cH: latensTenyezo(hu.hutokozeg),
        epsSzab: hutesSzabalyozasiTenyezo(hu.szabalyozas),
        epsH: hutesiTeljesitmenyTenyezo({ hutogep: hu.hutogep }),
      })
    : null;
  const pv = p.rendszerek.napelemek.reduce((s, n) => s + napelemTermeles(n.kWp, n.tajolas, n.hajlasszog), 0);

  const celok: Partial<Record<FelhasznalasiCel, CelEnergia>> = {
    F: {
      ho: [{ Qveg: fut.QFveg, hordozo: f.hordozo, ...(f.egyediSulyok ? { egyediSulyok: f.egyediSulyok } : {}), ...(hp(f.hotermelo.tipus) ? { hoszivattyuEps: ht.epsF } : {}) }],
      W: fut.WFveg,
    },
    HMV: {
      ho: [{ Qveg: hmvQveg, hordozo: hm.hordozo, ...(hm.hotermelo.tipus === 'elektromos' && /Hőszivattyú/.test(hm.hotermelo.csoport) ? { hoszivattyuEps: hk.epsHMV } : {}) }],
      W: hmvW,
    },
  };
  if (ltW > 0) celok.LT = { ho: [], W: ltW };
  if (hut) celok.H = { ho: [{ Qveg: hut.QHveg, hordozo: 'villamos' }], W: hut.WHveg };
  const ind = osszesitettEnergetikaiJellemzo(celok, pv > 0 ? [{ Wexp: pv, termelo: 'nap_pv', cel: 'export_halozatba' }] : [], AN);
  const celonkent: ProjektEredmeny['celonkent'] = {};
  for (const [k, v] of Object.entries(ind.celonkent)) celonkent[k as FelhasznalasiCel] = { nren: v.nren, co2: v.co2 };
  if (pv > 0) celonkent.PV = { nren: -ind.exp.nren, co2: -ind.exp.co2 };

  const av = Aossz / V;
  const EpMax = enrenMaxLako(av, 'kozel_nulla');
  const CO2Max = co2MaxLako('kozel_nulla')!;
  const EpArany = arany(ind.fajlagos.nren, EpMax);
  const CO2Arany = arany(ind.fajlagos.co2, CO2Max);

  // Referencia és rendszerminősítés
  const refTerm = termeszetesSzellozes(0.5, 1, referenciaInfiltracio(true), V);
  const refZona = referenciaZona(
    { targy: zona, hatarolok: refHatarolok, ujEpulet: p.epulet.ujEpulet, ...(talajA > 0 ? { talajonFekvoPadloA: talajA } : {}) },
    { F: refTerm, H: HONAPOK.map((m) => refTerm + ejszakaiTobbletSzellozes(m, 6, V, ej)) },
  );
  const refNet = referenciaNettoEnergiaigeny(refZona, true);
  const refF = referenciaFutes({
    QFnet: refNet.QFnetEv,
    aRszr: AN,
    hotermeloHelye: f.hotermeloHelye,
    elosztasHelye: f.elosztasHelye,
    hoeladokSzama: f.szabalyozas.beszabalyozas.hoeladokSzama ?? 10,
  });
  const refH = referenciaHmv({ QHMVnet: qHmv, aRszr: AN, elosztasHelye: hm.elosztasHelye });
  const Ef = celSulyozottEnergia(celok.F!).sulyozott.nren;
  const Eh = celSulyozottEnergia(celok.HMV!).sulyozott.nren;
  const fAr = rendszerMinositesiArany(Ef, refF.sulyozott.nren, net.QFnetEv, refNet.QFnetEv);
  const hAr = rendszerMinositesiArany(Eh, refH.sulyozott.nren);

  const hordozoNev = (h: string): string => ({ fosszilis_gaz: 'földgáz', villamos: 'villamos energia', tavho_alapertelmezett: 'távhő' } as Record<string, string>)[h] ?? h;
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
    nyariHovedelem: nyariHovedelem(
      transzparens.map((t) => ({ Au: t.Au, tajolas: t.tajolas, hajlasszog: t.hajlasszog, gN: t.gN, ...(t.gArnyH !== undefined ? { gArnyH: t.gArnyH } : {}) })),
      AN,
    ),
    vegso: [
      { cel: 'F', nev: 'Fűtés', Q: fut.QFveg, W: fut.WFveg, hordozo: hordozoNev(f.hordozo) },
      { cel: 'HMV', nev: 'Melegvíz', Q: hmvQveg, W: hmvW, hordozo: hordozoNev(hm.hordozo) },
      ...(ltW > 0 ? [{ cel: 'LT' as const, nev: 'Szellőzés', Q: 0, W: ltW, hordozo: 'villamos energia' }] : []),
      ...(hut ? [{ cel: 'H' as const, nev: 'Hűtés', Q: hut.QHveg, W: hut.WHveg, hordozo: 'villamos energia' }] : []),
      ...(pv > 0 ? [{ cel: 'PV' as const, nev: 'Napelem (exportált)', Q: pv, W: 0, hordozo: 'napenergia' }] : []),
    ],
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
