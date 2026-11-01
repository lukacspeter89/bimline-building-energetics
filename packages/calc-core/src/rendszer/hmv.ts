import { ErvenytelenBemenet, ReszletesModszerSzukseges, SzamitasiHiba } from '../hibak.js';
import { linearisInterpolacio } from '../kozos/interpolacio.js';
import { sorKeres, szamMezo, tabla, type TablaHivatkozas } from '../normativ/index.js';
import { alapteruletTablaErtek, type Jelolt } from './kozos.js';
import type { Elhelyezes } from './futes.js';

const T = (id: string): TablaHivatkozas => `modszer/hmv#${id}`;

// ---------------------------------------------------------------------------------------------
// Nettó igény (9.1)
// ---------------------------------------------------------------------------------------------

export type LakoHmvFunkcio = 'Családi ház*' | 'Egyéb lakóépület*';

/**
 * Lakóépület nettó HMV hőigénye [kWh/év] a 2. Függelék 2.2. táblázatának kötelező fajlagos értékéből
 * (HMV-001 … HMV-003; 1. függ. 9.1, 68. o.). Egyéb rendeltetésnél az érték ajánlott, a tervező adja meg.
 */
export function lakoHmvNettoIgeny(funkcio: LakoHmvFunkcio, AN: number): number {
  if (!(AN > 0)) throw new ErvenytelenBemenet('Érvénytelen hasznos alapterület.', 'HMV-003');
  const hiv: TablaHivatkozas = 'modszer/profilok#tabla_f2_2_2';
  return szamMezo(sorKeres(hiv, (s) => s['funkcio'] === funkcio && s['kotelezo'] === true), 'hmv_hoigeny', hiv) * AN;
}

// ---------------------------------------------------------------------------------------------
// Hőtermelők (9.3)
// ---------------------------------------------------------------------------------------------

export type HmvKazanTipus = 'allando' | 'alacsony' | 'kondenzacios' | 'kombi' | 'kondenzacios_kombi';
export type HmvSzilardKazan = 'Vegyes tüzelésű kazán' | 'Tűzifa (hasábfa) tüzelésű kazán' | 'Pellettüzelésű kazán' | 'Faelgázosító kazán';

export type HmvHotermelo =
  /** ErP, nem elektromos készülék: ε = 1/η_s, (9.8), (9.10); segédenergia nélkül (HMV-025 … HMV-027, HMV-038, HMV-039). */
  | { tipus: 'erp'; etaS: number }
  /** ErP elektromos készülék: ε = 1/(2,5·η_s), (9.9); segédenergia nélkül (HMV-034 … HMV-036; D-123). */
  | { tipus: 'erp_elektromos'; etaS: number }
  /** Nem ErP kazán, 9.4. táblázat (HMV-028 … HMV-031). Kombikazánnál a hőcserélő/tároló térfogata [l] kell. */
  | { tipus: 'kazan'; kazan: HmvKazanTipus; terfogatL?: number }
  /** Nem ErP szilárd- és biomassza kazán, 9.5–9.6. táblázat (HMV-032, HMV-033). */
  | { tipus: 'szilard'; kazan: HmvSzilardKazan }
  /** Nem ErP elektromos készülék, 9.7. táblázat (HMV-037): `csoport` és hőszivattyúnál `rendszer` a táblázat szövege. */
  | { tipus: 'elektromos'; csoport: string; rendszer?: string }
  /** Nem ErP egyéb készülék, 9.8. táblázat (HMV-040). */
  | { tipus: 'egyeb'; rendszer: 'Gázüzemű bojler' | 'Átfolyós gáz-vízmelegítő' | 'Szilárdtüzelésű fürdőhenger' }
  /** Távhő: ε = 1,01, 265 kWh/év hőközpontonként (HMV-041, HMV-042; D-124). */
  | { tipus: 'tavho'; hokozpontokSzama: number }
  /** Alulméretezett rendszer nem fedezett hányada: ε = 1 (RA-010). */
  | { tipus: 'alulmeretezett' };

export interface HmvHotermeloEredmeny {
  epsHMV: number;
  /** A hőtermelő villamos segédenergiája W_HMV,term [kWh/év]. */
  Wterm: number;
  jelzesek: string[];
}

function kombiOszlop(kazan: 'kombi' | 'kondenzacios_kombi', V: number | undefined): string {
  // ÁF: V < 2 l, KT: 2 < V < 10 l (9.4. táblázat alatti szöveg); a V = 2 l és V ≥ 10 l esetet a módszer nem határozza meg.
  if (V === undefined || !(V >= 0)) throw new ErvenytelenBemenet('Kombikazánnál a hőcserélő/tároló térfogata szükséges.', 'HMV-029');
  let resz: 'AF' | 'KT';
  if (V < 2) resz = 'AF';
  else if (V > 2 && V < 10) resz = 'KT';
  else throw new SzamitasiHiba(`A ${V} l térfogatú kombikazánt a 9.4. táblázat nem sorolja be (ÁF: V < 2 l, KT: 2 < V < 10 l).`, 'HMV-029');
  return `${kazan === 'kombi' ? 'eps_kombi' : 'eps_kondenz_kombi'}_${resz}`;
}

/**
 * HMV hőtermelő teljesítménytényezője és segédenergiája (1. függ. 9.3, 70–73. o.).
 * @param aRszr a hőtermelő által ellátott rendszer-alapterület [m²]
 * @param arany a fedezett igény hányada (RA-023)
 */
export function hmvHotermelo(h: HmvHotermelo, aRszr: number, arany = 1): HmvHotermeloEredmeny {
  if (!(arany >= 0 && arany <= 1)) throw new ErvenytelenBemenet('A fedezett hányad 0 és 1 között adható meg.', 'RA-023');
  const pozitiv = (x: number, id: string): number => {
    if (!(x > 0)) throw new ErvenytelenBemenet('Érvénytelen hatásfok vagy szám.', id);
    return x;
  };
  switch (h.tipus) {
    case 'erp':
      return { epsHMV: 1 / pozitiv(h.etaS, 'HMV-026'), Wterm: 0, jelzesek: [] };
    case 'erp_elektromos':
      return { epsHMV: 1 / (2.5 * pozitiv(h.etaS, 'HMV-035')), Wterm: 0, jelzesek: [] };
    case 'kazan': {
      const hiv = T('tabla_9_4');
      const oszlop =
        h.kazan === 'kombi' || h.kazan === 'kondenzacios_kombi'
          ? kombiOszlop(h.kazan, h.terfogatL)
          : { allando: 'eps_allando_hom', alacsony: 'eps_alacsony_hom', kondenzacios: 'eps_kondenz' }[h.kazan];
      const wOszlop = h.kazan === 'kombi' || h.kazan === 'kondenzacios_kombi' ? 'W_term_kombi' : 'W_term_mas';
      const eps = alapteruletTablaErtek(hiv, oszlop, aRszr);
      const w = alapteruletTablaErtek(hiv, wOszlop, aRszr);
      return { epsHMV: eps.ertek, Wterm: w.ertek * aRszr * arany, jelzesek: [...eps.jelzesek, ...w.jelzesek] };
    }
    case 'szilard': {
      const epsHMV = szamMezo(sorKeres(T('tabla_9_5'), (s) => s['kazan'] === h.kazan), 'eps_HMV', T('tabla_9_5'));
      const oszlop = {
        'Vegyes tüzelésű kazán': 'W_vegyes',
        'Tűzifa (hasábfa) tüzelésű kazán': 'W_tuzifa_faelgaz',
        'Faelgázosító kazán': 'W_tuzifa_faelgaz',
        'Pellettüzelésű kazán': 'W_pellet',
      }[h.kazan];
      const w = alapteruletTablaErtek(T('tabla_9_6'), oszlop, aRszr);
      return { epsHMV, Wterm: w.ertek * aRszr * arany, jelzesek: w.jelzesek };
    }
    case 'elektromos': {
      const sor = sorKeres(T('tabla_9_7'), (s) => s['csoport'] === h.csoport && (s['rendszer'] ?? undefined) === h.rendszer);
      return {
        epsHMV: szamMezo(sor, 'eps_HMV', T('tabla_9_7')),
        Wterm: 0,
        jelzesek: ['HMV-037: ErP hatályán kívüli elektromos készülék segédenergiájára a módszer nem ad értéket (NYITOTT_KERDESEK B.4/10).'],
      };
    }
    case 'egyeb': {
      const sor = sorKeres(T('tabla_9_8'), (s) => s['rendszer'] === h.rendszer);
      return { epsHMV: szamMezo(sor, 'eps_HMV', T('tabla_9_8')), Wterm: szamMezo(sor, 'W_term', T('tabla_9_8')) * aRszr * arany, jelzesek: [] };
    }
    case 'tavho': {
      if (!(Number.isInteger(h.hokozpontokSzama) && h.hokozpontokSzama >= 1)) {
        throw new ErvenytelenBemenet('A hőközpontok száma pozitív egész.', 'HMV-042');
      }
      const hiv = T('alapertek_9_3_4_tavho');
      const ertek = (p: string): number => szamMezo(sorKeres(hiv, (s) => s['parameter'] === p), 'ertek', hiv);
      return {
        epsHMV: ertek('teljesítménytényező'),
        Wterm: ertek('villamos segédenergia igény hőközpontonként') * h.hokozpontokSzama * arany,
        jelzesek: [],
      };
    }
    case 'alulmeretezett':
      return { epsHMV: 1, Wterm: 0, jelzesek: [] };
  }
}

// ---------------------------------------------------------------------------------------------
// Tárolás (9.4), elosztás (9.5), szivattyúk (9.6)
// ---------------------------------------------------------------------------------------------

export type HmvTarolo = 'indirekt' | 'el_csucson_kivuli' | 'el_nappali' | 'gaz_bojler';

/**
 * Tárolási veszteség [kWh/év] a nettó igény százalékában (HMV-044 … HMV-047; 9.9–9.10. táblázat, 73–74. o.).
 * Tároló nélküli rendszernél `null` → 0 (D-125).
 */
export function hmvTarolasiVesztesege(tarolo: HmvTarolo | null, elhelyezes: Elhelyezes, aRszr: number, QHMVnet: number): Jelolt<number> {
  if (!(QHMVnet >= 0)) throw new ErvenytelenBemenet('Érvénytelen nettó HMV igény.', 'HMV-045');
  if (tarolo === null) return { ertek: 0, jelzesek: [] };
  const v = alapteruletTablaErtek(T(elhelyezes === 'futott_terben' ? 'tabla_9_9' : 'tabla_9_10'), tarolo, aRszr);
  return { ertek: (v.ertek / 100) * QHMVnet, jelzesek: v.jelzesek };
}

/** Elosztási (és cirkulációs) veszteség [kWh/év] a nettó igény százalékában (HMV-050, HMV-051; 9.11. táblázat, 74. o.). */
export function hmvElosztasiVesztesege(cirkulacio: boolean, elhelyezes: Elhelyezes, aRszr: number, QHMVnet: number): Jelolt<number> {
  if (!(QHMVnet >= 0)) throw new ErvenytelenBemenet('Érvénytelen nettó HMV igény.', 'HMV-050');
  const oszlop = `${cirkulacio ? 'cirk' : 'nocirk'}_${elhelyezes === 'futott_terben' ? 'belul' : 'kivul'}`;
  const v = alapteruletTablaErtek(T('tabla_9_11'), oszlop, aRszr);
  return { ertek: (v.ertek / 100) * QHMVnet, jelzesek: v.jelzesek };
}

/**
 * Cirkulációs szivattyú segédenergiája [kWh/év] (HMV-053 … HMV-055; 9.12. táblázat, 75. o.).
 * Az EEI-oszlop: ≤ 0,17 → „0,17”; ≤ 0,23 → „0,23”; különben vagy ismeretlennél „nem ismert” (D-126).
 * @param eei a szivattyú energiahatékonysági mutatója, `null`, ha nem ismert; `false`: nincs cirkuláció
 */
export function cirkulaciosSegedenergia(eei: number | null | false, aRszr: number, arany = 1): Jelolt<number> {
  if (eei === false) return { ertek: 0, jelzesek: [] };
  if (eei !== null && !(eei > 0)) throw new ErvenytelenBemenet('Érvénytelen EEI.', 'HMV-053');
  const oszlop = eei === null || eei > 0.23 ? 'EEI_nem_ismert' : eei > 0.17 ? 'EEI_0_23' : 'EEI_0_17';
  const v = alapteruletTablaErtek(T('tabla_9_12'), oszlop, aRszr);
  return { ertek: v.ertek * aRszr * arany, jelzesek: v.jelzesek };
}

/** Szolárköri szivattyú segédenergiája: W = 2·(25 + 2·A_koll) [kWh/év], (9.13) (HMV-056). */
export function szolarSzivattyuSegedenergia(AkollBrutto: number): number {
  if (!(AkollBrutto > 0)) throw new ErvenytelenBemenet('Érvénytelen kollektorfelület.', 'HMV-056');
  const hiv = T('keplet_9_13_szolar_szivattyu');
  const c = (k: string): number => szamMezo(sorKeres(hiv, (s) => s['konstans'] === k), 'ertek', hiv);
  return c('szorzó') * (c('alapérték') + c('kollektorfelület-szorzó') * AkollBrutto);
}

// ---------------------------------------------------------------------------------------------
// Napkollektor, egyszerűsített módszer (9.2.1.1)
// ---------------------------------------------------------------------------------------------

/**
 * Teljesítménycsökkentő tényező, (9.7) (HMV-015, HMV-016): 0° ≤ α_m ≤ 90°, −90° (K) ≤ γ_m ≤ +90° (Ny).
 */
export function kollektorTeljesitmenyTenyezo(alfaM: number, gammaM: number): number {
  if (!(alfaM >= 0 && alfaM <= 90) || !(gammaM >= -90 && gammaM <= 90)) {
    throw new ErvenytelenBemenet('A (9.7) képlet 0–90° hajlásszögre és −90…+90° tájolásra érvényes.', 'HMV-016');
  }
  const hiv = T('keplet_9_7_k_egyutthatok');
  const tag = (nev: string): number => {
    const s = sorKeres(hiv, (r) => r['tag'] === nev);
    return szamMezo(s, 'c_alfa2', hiv) * alfaM ** 2 + szamMezo(s, 'c_alfa1', hiv) * alfaM + szamMezo(s, 'c_alfa0', hiv);
  };
  return tag('γm² szorzója') * gammaM ** 2 + tag('γm szorzója') * gammaM + tag('konstans tag');
}

/**
 * Maximális kollektortermelés Q_koll,max [kWh/év] a 9.1. (sík) / 9.2. (vákuumcsöves) táblázatból (HMV-012 … HMV-014):
 * köztes értéknél kétirányú lineáris interpoláció; a táblázat tartományán kívül részletes módszer kell (D-127).
 */
export function kollektorMaxTermeles(kollektor: 'sik' | 'vakuumcsoves', AkollBrutto: number, aRszr: number): number {
  const hiv = T(kollektor === 'sik' ? 'tabla_9_1' : 'tabla_9_2');
  const sorok = tabla(hiv).sorok;
  const oszlopok = Object.keys(sorok[0]!)
    .filter((k) => k.startsWith('A_rszr_'))
    .map((k) => [Number(k.slice('A_rszr_'.length)), k] as const)
    .sort((a, b) => a[0] - b[0]);
  const ak = sorok.map((s) => szamMezo(s, 'A_koll_brutto', hiv));
  const tartomanyban = (x: number, min: number, max: number): boolean => x >= min && x <= max;
  if (!tartomanyban(AkollBrutto, ak[0]!, ak[ak.length - 1]!) || !tartomanyban(aRszr, oszlopok[0]![0], oszlopok[oszlopok.length - 1]![0])) {
    throw new ReszletesModszerSzukseges(
      `A ${hiv} táblázat ${ak[0]}–${ak[ak.length - 1]} m² kollektorfelületre és ${oszlopok[0]![0]}–${oszlopok[oszlopok.length - 1]![0]} m² alapterületre ad értéket.`,
      'HMV-014',
    );
  }
  const soronkent = sorok.map((s) => linearisInterpolacio(oszlopok.map(([x, k]) => [x, szamMezo(s, k, hiv)] as const), aRszr));
  return linearisInterpolacio(ak.map((x, i) => [x, soronkent[i]!] as const), AkollBrutto);
}

export interface HmvNapkollektor {
  kollektor: 'sik' | 'vakuumcsoves';
  AkollBrutto: number;
  /** Hajlásszög α_m [°] és tájolás γ_m [°] (kelet −90, dél 0, nyugat +90). */
  alfaM: number;
  gammaM: number;
  /** A HMV tároló térfogata [l]. */
  VtarL: number;
  lakoepulet: boolean;
}

/**
 * HMV végső energia napkollektorral, egyszerűsített módszer (HMV-008 … HMV-018; 1. függ. 9.2.1.1, 68–69. o.):
 * Q_vég,koll_nélkül = (Q_net + Q_száll + Q_tár)·ε_HMV,2, (9.4); Q_vég,koll = Q_koll,max·k, (9.5);
 * Q_vég,2 = Q_vég,koll_nélkül − Q_vég,koll·ε_HMV,2, (9.6), legalább 0 (D-128).
 */
export function napkollektorosHmv(
  b: { QHMVnet: number; Qszall: number; Qtar: number; eps2: number; aRszr: number },
  k: HmvNapkollektor,
): { Qkoll: number; QHMVveg2: number; jelzesek: string[] } {
  if (!k.lakoepulet) {
    throw new ReszletesModszerSzukseges('Az egyszerűsített napkollektoros módszer csak lakóépület HMV igényére alkalmazható.', 'HMV-008');
  }
  if (!(k.AkollBrutto > 0) || !(k.VtarL / k.AkollBrutto >= 50)) {
    throw new ReszletesModszerSzukseges('A tároló kollektorfelületre vetített térfogata 50 l/m² alatti.', 'HMV-009');
  }
  const kollNelkul = (b.QHMVnet + b.Qszall + b.Qtar) * b.eps2;
  const Qkoll = kollektorMaxTermeles(k.kollektor, k.AkollBrutto, b.aRszr) * kollektorTeljesitmenyTenyezo(k.alfaM, k.gammaM);
  const nyers = kollNelkul - Qkoll * b.eps2;
  return {
    Qkoll,
    QHMVveg2: Math.max(0, nyers),
    jelzesek: nyers < 0 ? ['D-128: a kollektortermelés meghaladja az igényt; a másik hőtermelő végső energiája 0.'] : [],
  };
}

// ---------------------------------------------------------------------------------------------
// Végső energia (9.1–9.3)
// ---------------------------------------------------------------------------------------------

/**
 * Egy HMV-rendszer végső energiaigénye (HMV-004 … HMV-007; 1. függ. 9.2, 68. o.):
 * Q_HMV,vég = (Q_net + Q_száll + Q_tár)·ε_HMV, (9.1); W_HMV,vég = W_sziv + W_term, (9.2);
 * W_sziv = W_cirk + W_szol + W_talaj, (9.3).
 */
export function hmvRendszer(b: {
  QHMVnet: number;
  Qszall: number;
  Qtar: number;
  epsHMV: number;
  Wcirk: number;
  Wszol?: number;
  Wtalaj?: number;
  Wterm: number;
}): { QHMVveg: number; WHMVveg: number } {
  for (const [kulcs, v] of Object.entries(b)) {
    if (v !== undefined && (!Number.isFinite(v) || v < 0)) throw new ErvenytelenBemenet(`Érvénytelen ${kulcs}: ${v}`, 'HMV-004');
  }
  return {
    QHMVveg: (b.QHMVnet + b.Qszall + b.Qtar) * b.epsHMV,
    WHMVveg: b.Wcirk + (b.Wszol ?? 0) + (b.Wtalaj ?? 0) + b.Wterm,
  };
}
