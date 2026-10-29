import { ErvenytelenBemenet } from '../hibak.js';
import { sorKeres, szamMezo, type TablaHivatkozas } from '../normativ/index.js';
import { elemiKovetelmeny } from '../kovetelmeny/index.js';
import { nettoEnergiaigeny, type FutetlenHatarolo, type NettoEredmeny, type NettoZonaBemenet } from '../netto/merleg.js';
import type { Transzparens } from '../netto/nyereseg.js';
import { hohiddalKorrigaltU, zeta, type FutetlenTerTipus, type NapterUvegezes, type ZetaBemenet } from '../netto/transzmisszio.js';
import type { Tajolas } from '../netto/eghajlat.js';
import { futesiAlrendszer, futesiHotermelo, hoelosztasVesztesege, szivattyuSegedenergia, vizesSzabalyozasiTenyezo, type Elhelyezes } from './futes.js';
import { cirkulaciosSegedenergia, hmvElosztasiVesztesege, hmvHotermelo, hmvRendszer, hmvTarolasiVesztesege } from './hmv.js';
import { celSulyozottEnergia, type Sulyok } from './indikatorok.js';

const REF: TablaHivatkozas = 'rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek#referenciaepulet_parameterek';
const refParam = (p: string): number => szamMezo(sorKeres(REF, (s) => s['parameter'] === p), 'ertek', REF);

// ---------------------------------------------------------------------------------------------
// Referenciaépület: szerkezetek és nettó igény (9/2023 ÉKM 5. melléklet 1.)
// ---------------------------------------------------------------------------------------------

/** A tárgyi épület egy határolója a referenciaépület felépítéséhez. */
export interface ReferenciaHatarolo {
  /** Szerkezettípus az 1. melléklet 1.1. táblázata szerint (`u_kovetelmeny` kód); a referencia-U ennek követelményértéke. */
  kod: string;
  /** Felület [m²]; nyílászárónál a nyílászáró teljes felülete. */
  A: number;
  /** Homlokzat / tetősík azonosítója az üvegezési arányhoz (tájolásonkénti bontás, 1.7.4.). */
  tajolas?: Tajolas;
  /** Hajlásszög a vízszinteshez [°]; 60° alatt 30 %-os üvegezési korlát (1.7.4.). */
  hajlasszog?: number;
  /** Átlátszó szerkezet: a keretarány [-] (a tárgyi épületével azonos, 1.7.2.); a külső akadályok F_árny-a (1.8.6.). */
  transzparens?: { fKeret: number; fArny?: { F: number; H: number } };
  /** Nem kondicionált tér felé: a 6.3. táblázat sora. */
  futetlen?: { tipus: FutetlenTerTipus; uvegezes?: NapterUvegezes };
  /** Csatlakozási hőhidak egyszerűsített módszerrel (1.8.2.): a tárgyi épület geometriája szerinti hőhidasság. */
  hohid?: ZetaBemenet;
}

export interface ReferenciaZonaBemenet {
  /** A tárgyi zóna: geometria, hőtároló képesség, profil és szellőzés innen (1.7.1., 1.7.5.–1.7.6., 1.8.4.). */
  targy: NettoZonaBemenet;
  hatarolok: readonly ReferenciaHatarolo[];
  /** Talajon fekvő padló felülete [m²]: H_tr,T = A·0,3 W/m²K (1.8.3., D-134). */
  talajonFekvoPadloA?: number;
  /** Új épület – a talajjal érintkező szerkezetek elemi követelményéhez. */
  ujEpulet: boolean;
}

/**
 * Üvegezési arány korlátozása tájolásonként (REF-006; 5. melléklet 1.7.4.): ha a nyílászárók aránya a homlokzaton
 * (60° alatti hajlásszögnél a tetősíkon) meghaladja az 50 %-ot (30 %-ot), a nyílászáró-felület a korlátra csökken,
 * a különbözet az adott homlokzat átlátszatlan szerkezetéhez kerül.
 */
export function uvegezesiAranyKorlat(hatarolok: readonly ReferenciaHatarolo[]): ReferenciaHatarolo[] {
  const ki = hatarolok.map((h) => ({ ...h }));
  const csoport = (h: ReferenciaHatarolo): string | null => {
    if (h.tajolas === undefined || h.futetlen) return null;
    const lejto = (h.hajlasszog ?? 90) < refParam('hajlasszog_hatar');
    return `${h.tajolas}|${lejto ? 'teto' : 'homlokzat'}`;
  };
  const csoportok = new Map<string, ReferenciaHatarolo[]>();
  for (const h of ki) {
    const c = csoport(h);
    if (c) csoportok.set(c, [...(csoportok.get(c) ?? []), h]);
  }
  for (const [c, elemek] of csoportok) {
    const korlat = refParam(c.endsWith('teto') ? 'uvegezesi_arany_max_60fok_alatti_hajlasszog' : 'uvegezesi_arany_max_homlokzat');
    const nyilas = elemek.filter((e) => e.transzparens);
    const opak = elemek.filter((e) => !e.transzparens);
    const aNy = nyilas.reduce((s, e) => s + e.A, 0);
    const aOssz = elemek.reduce((s, e) => s + e.A, 0);
    if (aOssz > 0 && aNy / aOssz > korlat) {
      if (opak.length === 0) throw new ErvenytelenBemenet(`A(z) ${c} felületen nincs átlátszatlan szerkezet a korláthoz.`, 'REF-006');
      const szorzo = (korlat * aOssz) / aNy;
      for (const e of nyilas) e.A *= szorzo;
      const legnagyobb = opak.reduce((m, e) => (e.A > m.A ? e : m));
      legnagyobb.A += aNy - korlat * aOssz;
    }
  }
  return ki;
}

/** Tömítetlenségi többletlégcsere jó légzárású nyílászárókkal (REF-010; 5. melléklet 1.8.4.; 2. függ. 2.4. táblázat). */
export function referenciaInfiltracio(tobbHomlokzatonVagySzellozokurto: boolean): number {
  const hiv: TablaHivatkozas = 'modszer/profilok#tabla_f2_2_4';
  const sor = sorKeres(
    hiv,
    (s) =>
      s['legzaras'] === 'jó' &&
      s['nyilasok_elhelyezkedese'] === (tobbHomlokzatonVagySzellozokurto ? 'Több homlokzaton vagy szellőzőkürtő' : 'Egy homlokzaton'),
  );
  return szamMezo(sor, 'n_filt_szelvedett', hiv);
}

/**
 * A referenciaépület zónája (REF-005 … REF-012; 5. melléklet 1.7.–1.8.): U = elemi követelmény (épületelemen belüli
 * hőhidakkal), csatlakozási hőhidak ζ-val, talajon fekvő padló 0,3 W/m²K, g⊥ = 0,55, árnyékoló szerkezet nélkül,
 * a tárgyi épület külső akadályaival. A szellőzési tényezőt (jó légzárás, referencia-szellőzés) a hívó adja meg.
 */
export function referenciaZona(b: ReferenciaZonaBemenet, hSzell: NettoZonaBemenet['hSzell']): NettoZonaBemenet {
  const hatarolok = uvegezesiAranyKorlat(b.hatarolok);
  const gN = refParam('g_merolegesen_beeso_futes');
  let hTrD = 0;
  const futetlen: FutetlenHatarolo[] = [];
  const transzparens: Transzparens[] = [];
  for (const h of hatarolok) {
    if (!(h.A >= 0)) throw new ErvenytelenBemenet('Érvénytelen felület.', 'REF-007');
    const k = elemiKovetelmeny({ kod: h.kod, U: 1, ujEpulet: b.ujEpulet, felulet: h.A });
    const U = h.hohid ? hohiddalKorrigaltU(k.uMax, zeta(h.hohid)) : k.uMax;
    if (h.futetlen) futetlen.push({ hTrIx: h.A * U, b: h.futetlen.uvegezes ? { tipus: h.futetlen.tipus, uvegezes: h.futetlen.uvegezes } : { tipus: h.futetlen.tipus } });
    else hTrD += h.A * U;
    if (h.transzparens) {
      if (h.tajolas === undefined) throw new ErvenytelenBemenet('Átlátszó szerkezetnél a tájolás szükséges.', 'REF-011');
      const t: Transzparens = { Au: h.A * (1 - h.transzparens.fKeret), gN, tajolas: h.tajolas, hajlasszog: h.hajlasszog ?? 90 };
      transzparens.push(h.transzparens.fArny ? { ...t, fArny: h.transzparens.fArny } : t);
    }
  }
  return {
    ...b.targy,
    hTrD: { F: hTrD, H: hTrD },
    futetlen,
    hTrT: (b.talajonFekvoPadloA ?? 0) * refParam('talajon_fekvo_padlo_U_egyenerteku'),
    hSzell,
    transzparens,
  };
}

/**
 * A referenciaépület nettó energiaigénye: fűtésnél programozható fűtést feltételezve a σ_F a 2. függ. 2.5. táblázatból
 * az időállandó szerint (REF-013; 5. melléklet 1.8.8.); hűtésnél a σ_H a tárgyi épületé.
 */
export function referenciaNettoEnergiaigeny(zona: NettoZonaBemenet, lakoepulet: boolean): NettoEredmeny {
  const elso = nettoEnergiaigeny({ ...zona, sigmaF: 1 });
  const tau = Math.min(...elso.havi.filter((m) => m.QFnet > 0).map((m) => m.tauF));
  const hiv: TablaHivatkozas = 'modszer/profilok#tabla_f2_2_5';
  const sor = sorKeres(hiv, (s) => s['automatika'] === true && (Number.isFinite(tau) && tau < 24 ? s['eset'] === 'fűtés automatikával programozható, időállandó kisebb mint 24 óra' : s['eset'] === 'fűtés automatikával programozható, időállandó nagyobb mint 24 óra'));
  const sigmaF = szamMezo(sor, lakoepulet ? 'sigma_F_lakoepulet' : 'sigma_F_egyeb', hiv);
  return sigmaF === 1 ? elso : nettoEnergiaigeny({ ...zona, sigmaF });
}

// ---------------------------------------------------------------------------------------------
// Referencia épülettechnikai rendszer (5. melléklet 2.)
// ---------------------------------------------------------------------------------------------

export interface ReferenciaRendszerEredmeny {
  Qveg: number;
  W: number;
  /** Súlyozott energia (f_nren, f_ren, f_tot, f_CO2) [kWh/év, kg/év]. */
  sulyozott: Sulyok;
}

/**
 * Referencia fűtési rendszer (REF-014; 5. melléklet 2.1.): földgáz, központi kondenzációs kazán a tárgyi épület
 * hőtermelőjének helyén, tároló nélkül; a vezetékek a tárgyi épület nyomvonalán (központi fűtés nélkül fűtött
 * térben), 55/45 °C; szabályozás: központi előremenő + helyiségenkénti, külsőfali radiátor, termosztatikus szelep,
 * kétcsöves statikus + csoportos dinamikus beszabályozás; szivattyú EEI 0,23 (D-137).
 */
export function referenciaFutes(b: {
  QFnet: number;
  aRszr: number;
  hotermeloHelye: Elhelyezes;
  /** A tárgyi épület vízszintes elosztóvezetékeinek helye; `null`, ha nincs központi fűtés (2.1.5.). */
  elosztasHelye: Elhelyezes | null;
  /** A hőleadók száma (a 8.12. táblázat oszlopválasztásához; a tárgyi épületével azonos, 1.7.2.). */
  hoeladokSzama: number;
}): ReferenciaRendszerEredmeny {
  const h = { elore: 55, vissza: 45 };
  const kazan = futesiHotermelo({ tipus: 'kazan', kazan: 'kondenzacios', elhelyezes: b.hotermeloHelye }, b.aRszr);
  const epsSzab = vizesSzabalyozasiTenyezo({
    hoelado: 'szabad',
    alap: 'Szabályozás referencia helyiségre, PI-szabályozó\nKözponti előremenő hőmérséklet szabályozás helyiségenkénti hőmérséklet szabályozással',
    korrekcio1: { alcsoport: 'kétcsöves fűtés és modernizált egycsöves fűtés', leiras: '55 °C/45 °C' },
    korrekcio2: 'külsőfali radiátor',
    korrekcio3: 'különálló, képes önálló be-kikapcsolásra (pl. termosztatikus szelep)',
    beszabalyozas: {
      rendszer: 'Kétcsöves rendszer',
      kialakitas: 'fűtőtestenként /fűtőfelületenként statikus-beállítás csoportos dinamikus beszabályozással (pl. nyomáskülönbség-szabályozókkal)',
      hoeladokSzama: b.hoeladokSzama,
    },
  });
  const e = futesiAlrendszer({
    QFnet: b.QFnet,
    epsSzab,
    Qszall: hoelosztasVesztesege(b.elosztasHelye ?? 'futott_terben', h, b.aRszr).ertek,
    Qtar: 0,
    epsF: kazan.epsF,
    // 2.1.8.: EEI 0,23 → a 8.16. táblázat „EC, EEI = 0,23” oszlopa
    Wsziv: szivattyuSegedenergia(refParam('futes_szivattyu_EEI') <= 0.17 ? 'ec_eei_017' : 'ec_eei_023', 'szabad', 10, b.aRszr).ertek,
    Wtar: 0,
    Wterm: kazan.Wterm,
  });
  return {
    Qveg: e.QFveg,
    W: e.WFveg,
    sulyozott: celSulyozottEnergia({ ho: [{ Qveg: e.QFveg, hordozo: 'fosszilis_gaz' }], W: e.WFveg }).sulyozott,
  };
}

/**
 * Referencia HMV-rendszer (REF-015; 5. melléklet 2.2.): földgáztüzelésű központi kondenzációs kazán, fűtött térben
 * elhelyezett indirekt tároló, a vezetékek a tárgyi épület nyomvonalán (központi melegvíz-ellátás nélkül fűtött
 * térben), cirkulációval, EEI 0,23 cirkulációs szivattyúval (D-136).
 */
export function referenciaHmv(b: { QHMVnet: number; aRszr: number; elosztasHelye: Elhelyezes | null }): ReferenciaRendszerEredmeny {
  const kazan = hmvHotermelo({ tipus: 'kazan', kazan: 'kondenzacios' }, b.aRszr);
  const hely = b.elosztasHelye ?? 'futott_terben';
  const e = hmvRendszer({
    QHMVnet: b.QHMVnet,
    Qszall: hmvElosztasiVesztesege(true, hely, b.aRszr, b.QHMVnet).ertek,
    Qtar: hmvTarolasiVesztesege('indirekt', 'futott_terben', b.aRszr, b.QHMVnet).ertek,
    epsHMV: kazan.epsHMV,
    Wcirk: cirkulaciosSegedenergia(refParam('hmv_cirkulacios_szivattyu_EEI'), b.aRszr).ertek,
    Wterm: kazan.Wterm,
  });
  return {
    Qveg: e.QHMVveg,
    W: e.WHMVveg,
    sulyozott: celSulyozottEnergia({ ho: [{ Qveg: e.QHMVveg, hordozo: 'fosszilis_gaz' }], W: e.WHMVveg }).sulyozott,
  };
}

/**
 * Rendszerminősítés mutatója [%] (176/2008 5. melléklet 2. pont; TAN-009): fűtésnél és hűtésnél a nettó igényhez
 * mért E_nren aránya, (E/Q)/(E_REF/Q_REF); HMV-nél, szellőzésnél és világításnál E/E_REF.
 */
export function rendszerMinositesiArany(E: number, Eref: number, Q?: number, Qref?: number): number {
  if (!(Eref > 0)) throw new ErvenytelenBemenet('A referencia-energiaigény pozitív kell legyen.', 'TAN-009');
  if (Q === undefined || Qref === undefined) return (100 * E) / Eref;
  if (!(Q > 0) || !(Qref > 0)) throw new ErvenytelenBemenet('Érvénytelen nettó igény.', 'TAN-009');
  return (100 * (E / Q)) / (Eref / Qref);
}
