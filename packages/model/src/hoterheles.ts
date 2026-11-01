// Projekt → méretezési hőterhelés (MSZ EN 12831-1:2017, szabványos módszer) helyiségenként és épületre.
// A geometria és a rétegrendek ugyanazok, mint az energetikai számításban; a csatlakozási hőhidakat itt a szabvány
// ΔU_TB átalánypótléka veszi figyelembe (a rendelet ζ-ja nem). Döntések: D-146, D-147.
import {
  ReszletesModszerSzukseges,
  SzamitasiHiba,
  befujtHomerseklet,
  belsoMeretezesiHomerseklet,
  egyenertekuUTalaj,
  epuletHoterheles,
  fajlagosHotarolo,
  feluletiEllenallas,
  futetlenF1,
  hoatbocsatasiTenyezo,
  hohidPotlek,
  holeadoJellemzo,
  homlokzatszamTenyezo,
  homogenRtot,
  idoallando,
  kulsoMeretezesiHomerseklet,
  legatereszto,
  legatereszto50,
  magasFeluletiHomerseklet,
  magasLeghomerseklet,
  minimalisLegcsere,
  szamitasiMelyseg,
  szellozesAltalanos,
  talajGeometria,
  terfogataramTenyezo,
  transzmisszio,
  type BelsoTipus12831,
  type HlElem,
  type NMinTipus,
  type TranszmisszioEredmeny,
} from '@bimline/calc-core';
import { elek, kozosHossz } from './alaprajz.js';
import { hataroloU, nyilaszaroU } from './szamitas.js';
import type { Helyiseg, HoterhelesBeallitas, Projekt } from './projekt.js';

/** Alapbeállítás: a B melléklet szerinti választások; a klímaadatot meg kell adni. */
export const alapHoterhelesBeallitas = (): HoterhelesBeallitas => ({
  hohid: 'egyeb',
  legtomorseg: { osztaly: 'III' },
  tobbHomlokzat: true,
  arnyekoltsag: 'normal',
  magasEpulet: false,
  dhz: 0,
  talajvizKozel: false,
  hotarolo: 'kozepes_magas',
  futetlenF1: {},
});

/** Javaslat a helyiség típusára a névből (B.14): fürdő, zuhanyzó → 24 °C; egyébként lakás 20 °C. */
export function javasoltTipus(h: Helyiseg): BelsoTipus12831 {
  return /fürdő|zuhany/i.test(h.nev) ? 'furdo' : 'lakas';
}

/** Javaslat az n_min-re (B.7): ablakos helyiség 0,5 1/h (vizes helyiségnél is), ablaktalan mellékhelyiség 0. */
export function javasoltNMin(p: Projekt, h: Helyiseg): NMinTipus {
  const ablakos = h.hatarolok.some((b) => b.nyilasok.some((n) => p.nyilaszarok.find((t) => t.azon === n.nyilaszaroAzon)?.fajta === 'ablak'));
  if (!ablakos) return 'mellek_belso';
  return /fürdő|zuhany|wc|konyha/i.test(h.nev) ? 'vizes_ablakos' : 'allando';
}

export interface HelyisegHoterhelesEredmeny {
  azon: string;
  nev: string;
  szint: string;
  thetaInt: number;
  A: number;
  V: number;
  transzmisszio: TranszmisszioEredmeny;
  PhiV: number;
  /** Φ_HL,i [W], (3). */
  PhiHL: number;
  /** Φ_HL,i / A [W/m²]. */
  fajlagos: number;
  javaslatok: string[];
}

export interface HoterhelesEredmeny {
  thetaE: number;
  thetaE0: number;
  dTau: number;
  tau: number | null;
  helyisegek: HelyisegHoterhelesEredmeny[];
  /** Φ_HL,build [W], (1). */
  epulet: number;
  epuletT: number;
  epuletV: number;
  jelzesek: string[];
}

export type HoterhelesKimenet = { rendben: true; eredmeny: HoterhelesEredmeny } | { rendben: false; hianyok: { hely: string; uzenet: string }[] };

export function hoterhelesProjekt(p: Projekt): HoterhelesKimenet {
  const hianyok: { hely: string; uzenet: string }[] = [];
  const be = p.hoterheles ?? alapHoterhelesBeallitas();
  if (!be.thetaERef) hianyok.push({ hely: 'Hőterhelés', uzenet: 'A külső méretezési hőmérséklet (θ_e,Ref) forrással szükséges (nemzeti melléklet; a szabvány B melléklete nem ad értéket).' });
  if (!be.thetaEm) hianyok.push({ hely: 'Hőterhelés', uzenet: 'Az éves átlagos külső hőmérséklet (θ_e,m) forrással szükséges (talaj, szomszéd épület).' });
  for (const h of p.helyisegek)
    for (const b of h.hatarolok)
      if (b.tuloldal.fajta === 'fűtetlen' && !be.futetlenF1[b.tuloldal.ter])
        hianyok.push({ hely: `Hőterhelés › ${b.tuloldal.ter}`, uzenet: 'Válaszd ki a fűtetlen tér jellegét (B.2. táblázat, f_1).' });
  for (const h of p.helyisegek)
    if (h.belmagassag >= 4 && !h.hoterheles?.holeado) hianyok.push({ hely: h.nev, uzenet: '4 m-nél magasabb helyiségnél a hőleadó rendszer szükséges (6.3.8, B.3. táblázat).' });
  if (hianyok.length) return { rendben: false, hianyok: [...new Map(hianyok.map((x) => [x.hely + x.uzenet, x])).values()] };
  try {
    return { rendben: true, eredmeny: szamol(p, be) };
  } catch (e) {
    const id = e instanceof SzamitasiHiba ? e.matrixId : 'program';
    return { rendben: false, hianyok: [{ hely: 'számítás', uzenet: `${(e as Error).message} (${id})` }] };
  }
}

function szamol(p: Projekt, be: HoterhelesBeallitas): HoterhelesEredmeny {
  const jelzesek: string[] = [];
  const rr = new Map(p.retegrendek.map((r) => [r.azon, r]));
  const ny = new Map(p.nyilaszarok.map((t) => [t.azon, t]));
  const anyag = new Map(p.anyagok.map((a) => [a.azon, a]));
  const dUTB = hohidPotlek(be.hohid);
  const thetaEm = be.thetaEm!.ertek;
  const fGW = be.talajvizKozel ? 1.15 : 1.0;
  const thetaInt = (h: Helyiseg): number => h.hoterheles?.thetaInt ?? belsoMeretezesiHomerseklet(h.hoterheles?.tipus ?? javasoltTipus(h));

  // Talaj: az épület padlólemezének B′-je (E.2); a kitett kerület a modell padlóiból.
  const padlok = p.helyisegek.flatMap((h) => h.hatarolok.map((b) => ({ h, b }))).filter(({ b }) => rr.get(b.retegrendAzon)?.szerkezet === 'talajon_fekvo_padlo');
  const AG = padlok.reduce((s, x) => s + x.b.felulet, 0);
  const PG = padlok.reduce((s, x) => s + (x.b.kitettKerulet ?? 0), 0);
  const Bepulet = AG > 0 && PG > 0 ? talajGeometria(AG, PG) : null;

  // Helyiségenkénti elemek.
  type Elok = { h: Helyiseg; thetaInt: number; elemek: HlElem[]; Aenv: number; HTfuggetlen: number; javaslatok: string[]; thetaStar: number };
  const helyek: Elok[] = p.helyisegek.map((h) => {
    const ti = thetaInt(h);
    const javaslatok: string[] = [];
    if (!h.hoterheles?.tipus && h.hoterheles?.thetaInt === undefined) javaslatok.push(`θ_int = ${ti} °C (javaslat a névből, B.14)`);
    const magas = h.belmagassag >= 4;
    const hol = magas ? holeadoJellemzo(h.hoterheles!.holeado!) : null;
    const hOccup = 1;
    const thetaStarK = (hk: number): number | undefined => (hol ? magasFeluletiHomerseklet({ thetaInt: ti, Gair: hol.Gair, hk, hOccup, dTsurf: 0 }) : undefined);
    const elemek: HlElem[] = [];
    let Aenv = 0;
    let HTfuggetlen = 0;
    const tegyen = (e: HlElem, hk: number, burok: boolean, fuggetlenH: number): void => {
      const t = thetaStarK(hk);
      elemek.push(t === undefined ? e : { ...e, thetaStarK: t });
      if (burok) Aenv += e.A;
      HTfuggetlen += fuggetlenH;
    };
    for (const b of h.hatarolok) {
      const r = rr.get(b.retegrendAzon)!;
      const fuggoleges = (b.hajlasszog ?? 90) >= 60;
      const hk = fuggoleges ? h.belmagassag / 2 : r.szerkezet === 'talajon_fekvo_padlo' || r.szerkezet === 'also_zarofodem_futetlen_felett' || r.szerkezet === 'arkad_athajto_feletti_fodem' ? 0 : h.belmagassag;
      const nyA = b.nyilasok.reduce((s, n) => s + n.szelesseg * n.magassag * n.db, 0);
      const Aopak = b.felulet - nyA;
      if (b.tuloldal.fajta === 'talaj') {
        if (r.szerkezet !== 'talajon_fekvo_padlo') continue;
        const z = szamitasiMelyseg(b.melyseg ?? 0);
        if (z < 0) throw new ReszletesModszerSzukseges(`${h.nev}: terepszint feletti padlóra az E melléklet nem alkalmazható; MSZ EN ISO 13370.`, 'HL-041');
        // U_k az EN ISO 6946 analógiájára: R_si (lefelé) + R + R_se, mint a 4.21-ben (D-101, D-147).
        const Uk = hoatbocsatasiTenyezo(
          homogenRtot(feluletiEllenallas({ irany: 'lefele' }), r.retegek.map((x) => ({ tipus: 'homogen' as const, d: x.d, lambda: anyag.get(x.anyagAzon)!.lambda }))),
        );
        // E melléklet 1. pont: az épület B′-je, ha a helyiségnek nincs külső fala vagy a padló U ≤ 0,5; egyébként a helyiségé.
        const vanKulsoFal = h.hatarolok.some((x) => x.tuloldal.fajta === 'külső' && (x.hajlasszog ?? 90) >= 60 && x.felulet > 0);
        const Bhelyiseg = b.kitettKerulet && b.kitettKerulet > 0 ? talajGeometria(b.felulet, b.kitettKerulet) : null;
        const Bv = !vanKulsoFal || Uk <= 0.5 || Bhelyiseg === null ? Bepulet : Bhelyiseg;
        if (Bv === null) throw new ReszletesModszerSzukseges(`${h.nev}: a padló kitett kerülete nélkül B′ nem számítható (E.2).`, 'HL-040');
        const Ueq = egyenertekuUTalaj({ szerkezet: 'padlo', B: Bv, z, U: Uk, dUTB });
        tegyen({ nev: r.nev, A: b.felulet, U: Ueq, tuloldal: { x: 'g', fGW } }, 0, false, b.felulet * Ueq * fGW);
        if (z > 0 && b.pinceFalRetegrendAzon) {
          const fal = rr.get(b.pinceFalRetegrendAzon)!;
          const Rf = fal.retegek.reduce((s, x) => s + x.d / anyag.get(x.anyagAzon)!.lambda, 0);
          const Ubw = hoatbocsatasiTenyezo(homogenRtot(feluletiEllenallas({ irany: 'vizszintes' }), [{ tipus: 'homogen', d: Rf, lambda: 1 }]));
          const Afal = z * (b.kitettKerulet ?? 0);
          const UeqF = egyenertekuUTalaj({ szerkezet: 'pincefal', B: Bv, z, U: Ubw, dUTB });
          tegyen({ nev: fal.nev, A: Afal, U: UeqF, tuloldal: { x: 'g', fGW } }, h.belmagassag / 2, false, Afal * UeqF * fGW);
        }
        continue;
      }
      const U = hataroloU(p, b);
      const tul: HlElem['tuloldal'] | null =
        b.tuloldal.fajta === 'külső'
          ? { x: 'e' }
          : b.tuloldal.fajta === 'fűtetlen'
            ? { x: 'ae', f1: futetlenF1(be.futetlenF1[b.tuloldal.ter]!) }
            : b.tuloldal.fajta === 'fűtött szomszéd'
              ? { x: 'epulet' }
              : null;
      if (!tul) continue;
      const burok = tul.x === 'e' || tul.x === 'ae';
      const plusz = tul.x === 'e' || tul.x === 'ae' || tul.x === 'epulet' ? dUTB : 0;
      if (Aopak > 0) tegyen({ nev: r.nev, A: Aopak, U, tuloldal: tul }, hk, burok, Aopak * (U + plusz));
      for (const n of b.nyilasok) {
        const t = ny.get(n.nyilaszaroAzon)!;
        const A = n.szelesseg * n.magassag * n.db;
        const Un = nyilaszaroU(t, n.szelesseg, n.magassag).U;
        tegyen({ nev: t.nev, A, U: Un, tuloldal: tul }, hk, burok, A * (Un + plusz));
      }
    }
    const thetaStar = hol ? magasLeghomerseklet({ thetaInt: ti, Gair: hol.Gair, hi: h.belmagassag, hOccup, dTrad: hol.dTrad }) : ti;
    return { h, thetaInt: ti, elemek, Aenv, HTfuggetlen, javaslatok, thetaStar };
  });

  // Rajzolt közös falak eltérő hőmérsékletű fűtött helyiségek között (H_T,ia, 6.3.2.3 (1) eset).
  const belso = be.belsoFalRetegrendAzon ? rr.get(be.belsoFalRetegrendAzon) : undefined;
  if (belso) {
    const Ub = hoatbocsatasiTenyezo(
      homogenRtot(feluletiEllenallas({ irany: 'vizszintes', mindketOldalBelso: true }), belso.retegek.map((x) => ({ tipus: 'homogen' as const, d: x.d, lambda: anyag.get(x.anyagAzon)!.lambda }))),
    );
    for (const a of helyek) {
      if (!a.h.alaprajz || a.h.alaprajz.pontok.length < 3) continue;
      const ea = elek(a.h.alaprajz.pontok);
      for (const b of helyek) {
        if (b === a || b.h.szint !== a.h.szint || !b.h.alaprajz || b.h.alaprajz.pontok.length < 3 || Math.abs(a.thetaInt - b.thetaInt) < 1e-9) continue;
        const L = ea.reduce((s, e) => s + elek(b.h.alaprajz!.pontok).reduce((t, f) => t + kozosHossz(e, f), 0), 0);
        if (L > 0.01) a.elemek.push({ nev: `${belso.nev} → ${b.h.nev}`, A: L * a.h.belmagassag, U: Ub, tuloldal: { x: 'a', thetaX: b.thetaInt } });
      }
    }
  } else if (p.helyisegek.some((h) => (h.hoterheles?.tipus ?? javasoltTipus(h)) === 'furdo')) {
    jelzesek.push('Belső fal rétegrend nincs megadva: a különböző hőmérsékletű helyiségek (pl. fürdő 24 °C) közti hőátadás (H_T,ia) kimarad.');
  }

  // Szellőzés: épületrészenként (egység) egy zóna.
  const zonak = new Map<string, Elok[]>();
  for (const x of helyek) zonak.set(x.h.hoterheles?.egyseg ?? '', [...(zonak.get(x.h.hoterheles?.egyseg ?? '') ?? []), x]);
  const Vbuild = helyek.reduce((s, x) => s + x.h.alapterulet * x.h.belmagassag, 0);
  const AenvBuild = helyek.reduce((s, x) => s + x.Aenv, 0);
  const qEnv50 = 'osztaly' in be.legtomorseg ? legatereszto(be.legtomorseg.osztaly) : legatereszto50(be.legtomorseg.n50, Vbuild, AenvBuild);
  const fqv = terfogataramTenyezo({ tobbHomlokzat: be.tobbHomlokzat, hgz: be.magasEpulet ? 51 : 0, arnyekoltsag: be.arnyekoltsag, dhz: be.dhz });
  const ffac = homlokzatszamTenyezo(be.tobbHomlokzat);
  const szell = p.rendszerek.szellozes;

  const szellozes = (thetaE: number, thetaE0: number) => {
    const eredm = new Map<Elok, { Phi: number; qKulsoZona: number }>();
    const zonaPhi: number[] = [];
    for (const tagok of zonak.values()) {
      const hk = tagok.map((x) => {
        const nMin = minimalisLegcsere(x.h.hoterheles?.nMinTipus ?? javasoltNMin(p, x.h));
        const V = x.h.alapterulet * x.h.belmagassag;
        return {
          V,
          Aenv: x.Aenv,
          qMin: nMin * V,
          thetaStar: x.thetaStar,
          ...(x.h.hoterheles?.qExh ? { qExh: x.h.hoterheles.qExh } : {}),
          ...(x.h.hoterheles?.qSup ? { qSup: x.h.hoterheles.qSup } : {}),
        };
      });
      const elszivas = tagok.filter((x) => (x.h.hoterheles?.qExh ?? 0) > 0).map((x) => ({ q: x.h.hoterheles!.qExh!, thetaStar: x.thetaStar }));
      const vanBefuvas = tagok.some((x) => (x.h.hoterheles?.qSup ?? 0) > 0);
      const thetaRec = vanBefuvas
        ? befujtHomerseklet({ thetaE0, etaRec: szell.fajta === 'hővisszanyerős' ? szell.etaR : 0, elszivas: elszivas.length ? elszivas : [{ q: 1, thetaStar: tagok[0]!.thetaStar }] })
        : undefined;
      const r = szellozesAltalanos({ helyisegek: hk, thetaE, qEnv50, fqv, ffac, ...(thetaRec !== undefined ? { thetaRec } : {}) });
      tagok.forEach((x, i) => eredm.set(x, { Phi: r.helyisegek[i]!.Phi, qKulsoZona: r.helyisegek[i]!.qKulsoZona }));
      zonaPhi.push(r.zona);
    }
    return { eredm, zonaPhi };
  };

  // Külső méretezési hőmérséklet; időállandó-korrekció csak V_e megadásával (41).
  const kulso0 = kulsoMeretezesiHomerseklet({ thetaERef: be.thetaERef!.ertek, ...(be.magassag ? { magassag: be.magassag } : {}) });
  let tau: number | null = null;
  if (be.Ve && be.Ve > 0) {
    const HT = helyek.reduce((s, x) => s + x.HTfuggetlen, 0);
    const HV = 0.34 * [...szellozes(kulso0.thetaE0, kulso0.thetaE0).eredm.values()].reduce((s, x) => s + x.qKulsoZona, 0);
    tau = idoallando(fajlagosHotarolo(be.hotarolo), be.Ve, HT + HV);
  } else jelzesek.push('Külső bruttó térfogat (V_e) nélkül nincs időállandó szerinti korrekció (Δθ_e,τ = 0), ez a biztonság javára téved.');
  const kulso = kulsoMeretezesiHomerseklet({ thetaERef: be.thetaERef!.ertek, ...(be.magassag ? { magassag: be.magassag } : {}), ...(tau !== null ? { tau } : {}) });
  const thetaE = kulso.thetaE;

  const sz = szellozes(thetaE, kulso.thetaE0);
  const eredm: HelyisegHoterhelesEredmeny[] = helyek.map((x) => {
    const tr = transzmisszio({ thetaInt: x.thetaInt, elemek: x.elemek }, { thetaE, thetaEm, dUTB });
    const PhiV = sz.eredm.get(x)!.Phi;
    const PhiHL = tr.Phi + PhiV;
    return {
      azon: x.h.azon,
      nev: x.h.nev,
      szint: x.h.szint,
      thetaInt: x.thetaInt,
      A: x.h.alapterulet,
      V: x.h.alapterulet * x.h.belmagassag,
      transzmisszio: tr,
      PhiV,
      PhiHL,
      fajlagos: x.h.alapterulet > 0 ? PhiHL / x.h.alapterulet : 0,
      javaslatok: x.javaslatok,
    };
  });
  const epulet = epuletHoterheles({ helyisegek: eredm.map((x) => ({ reszek: x.transzmisszio.reszek })), PhiVZonak: sz.zonaPhi });
  const epuletV = sz.zonaPhi.reduce((s, x) => s + x, 0);
  return { thetaE, thetaE0: kulso.thetaE0, dTau: kulso.dTau, tau, helyisegek: eredm, epulet, epuletT: epulet - epuletV, epuletV, jelzesek };
}
