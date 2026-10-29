import { ErvenytelenBemenet, NormativAdatHiba } from '../hibak.js';
import { sorKeres, szamMezo, tabla, type NormativSor, type TablaHivatkozas } from '../normativ/index.js';

const U_KOV: TablaHivatkozas = 'rendelet/9_2023_EKM_1_melleklet#u_kovetelmeny';
const KNZE_QM: TablaHivatkozas = 'rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek#knze_qm_max';
const KNZE_E: TablaHivatkozas = 'rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek#knze_enren_co2_max';
const JF_QM: TablaHivatkozas = 'rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek#jelentos_felujitas_qm_max';
const JF_E: TablaHivatkozas = 'rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek#jelentos_felujitas_enren_max';
const REF_LAKO: TablaHivatkozas = 'rendelet/9_2023_EKM_2_3_5_melleklet_kovetelmenyek#referencia_lako_rogzitett';
const BESOROLAS: TablaHivatkozas = 'rendelet/176_2008_Korm_besorolas#energetikai_besorolas';
const SZERK_OSZT: TablaHivatkozas = 'rendelet/176_2008_Korm_besorolas#szerkezet_ertekelesi_osztalyok';
const RENDSZ_OSZT: TablaHivatkozas = 'rendelet/176_2008_Korm_besorolas#rendszer_ertekelesi_osztalyok';

// ---------------------------------------------------------------------------------------------
// Elemi U-követelmény (KOV-020 … KOV-023)
// ---------------------------------------------------------------------------------------------

export interface ElemiEllenorzes {
  /** A szerkezettípus programbeli kódja (9_2023_EKM_1_melleklet.json#u_kovetelmeny, `kod`). */
  kod: string;
  /** Átlagos hőátbocsátási tényező [W/m²K]; nyílászárónál a társított árnyékoló hatása nélkül (KOV-021). */
  U: number;
  /** Új épület – a talajjal érintkező fal és a talajon fekvő padló követelménye csak itt érvényes (KOV-023). */
  ujEpulet: boolean;
  /** A nyílászáró felülete [m²]; a > 0,5 m²-es sorokhoz szükséges (KOV-022). */
  felulet?: number;
}

export interface ElemiEredmeny {
  /** A rendeleti táblázat sora. */
  sor: number;
  uMax: number;
  /** Az adott esetre vonatkozik-e követelmény. */
  alkalmazando: boolean;
  /** `alkalmazando` esetén: U ≤ U_max. */
  megfelel: boolean;
}

/**
 * Szerkezetenkénti elemi követelmény: U ≤ U_max (KOV-020 … KOV-023; 9/2023 ÉKM 1. melléklet 1.1.).
 */
export function elemiKovetelmeny(e: ElemiEllenorzes): ElemiEredmeny {
  if (!(e.U > 0)) throw new ErvenytelenBemenet(`Érvénytelen U: ${e.U}`, 'KOV-020');
  const sor = sorKeres(U_KOV, (s) => s['kod'] === e.kod);
  const uMax = szamMezo(sor, 'u_max', U_KOV);
  let alkalmazando = true;
  if (sor['csak_uj_epulet'] === true && !e.ujEpulet) alkalmazando = false;
  const minA = sor['min_felulet_m2'];
  if (typeof minA === 'number') {
    if (e.felulet === undefined) throw new ErvenytelenBemenet('A nyílászáró felülete szükséges.', 'KOV-022');
    if (!(e.felulet > minA)) alkalmazando = false;
  }
  return { sor: szamMezo(sor, 'sor', U_KOV), uMax, alkalmazando, megfelel: !alkalmazando || e.U <= uMax };
}

// ---------------------------------------------------------------------------------------------
// Összesített követelmények (KOV-060 … KOV-068)
// ---------------------------------------------------------------------------------------------

/** Követelményszint: közel nulla energiaigényű (új épület), illetve jelentős felújítás. */
export type KovetelmenySzint = 'kozel_nulla' | 'jelentos_felujitas';

/** Az A/V-függő, szakaszonként lineáris követelmény (av_min, av_max, allando, meredekseg oszlop). */
function avFuggo(hiv: TablaHivatkozas, av: number): number {
  if (!(av > 0)) throw new ErvenytelenBemenet(`Érvénytelen felület-térfogat arány: ${av}`, 'KOV-060');
  const sor = tabla(hiv).sorok.find((s) => {
    const min = s['av_min'] as number | null;
    const max = s['av_max'] as number | null;
    return (min === null || av >= min) && (max === null || av <= max);
  });
  if (!sor) throw new NormativAdatHiba(`A/V = ${av} egyik sávba sem esik: ${hiv}`, hiv);
  return szamMezo(sor, 'allando', hiv) + szamMezo(sor, 'meredekseg', hiv) * av;
}

/**
 * A fajlagos hőveszteség-tényező megengedett legnagyobb értéke [W/m³K]
 * (KOV-060: 9/2023 ÉKM 2. melléklet 1.2–1.3., DONTESEK.md D-010; KOV-064: 3. melléklet 1.2.).
 */
export function qmMax(av: number, szint: KovetelmenySzint): number {
  return avFuggo(szint === 'kozel_nulla' ? KNZE_QM : JF_QM, av);
}

function knzeSor(rendeltetes: string, indikator: string): NormativSor {
  return sorKeres(KNZE_E, (s) => s['rendeltetes'] === rendeltetes && s['indikator'] === indikator);
}

/**
 * Lakó és szállás jellegű épület összesített energetikai jellemzőjének követelményértéke [kWh/m²év],
 * világítás nélkül (KOV-061: 2. melléklet 2.1. = 0,8 · 95; KOV-065: 3. melléklet 2.2.).
 */
export function enrenMaxLako(av: number, szint: KovetelmenySzint): number {
  if (szint === 'jelentos_felujitas') return avFuggo(JF_E, av);
  const szorzo = szamMezo(knzeSor('lako_szallas', 'Enren_fajl'), 'szorzo_ref', KNZE_E);
  const ref = szamMezo(sorKeres(REF_LAKO, (s) => s['indikator'] === 'Enren_fajl_REF'), 'ertek', REF_LAKO);
  return szorzo * ref;
}

/**
 * Lakó és szállás jellegű épület fajlagos CO2-kibocsátásának követelményértéke [kg/m²év] (KOV-062:
 * 2. melléklet 3.1. = 0,8 · 25). A 3. melléklet (jelentős felújítás) CO2-követelményt nem tartalmaz: null.
 */
export function co2MaxLako(szint: KovetelmenySzint): number | null {
  if (szint === 'jelentos_felujitas') return null;
  const szorzo = szamMezo(knzeSor('lako_szallas', 'ECO2_fajl'), 'szorzo_ref', KNZE_E);
  const ref = szamMezo(sorKeres(REF_LAKO, (s) => s['indikator'] === 'ECO2_fajl_REF'), 'ertek', REF_LAKO);
  return szorzo * ref;
}

/**
 * Egyéb rendeltetésű épület (és lakó, dinamikus szimulációnál) követelményértéke a tárgyi épületen alapuló
 * referenciaépület értékéből (KOV-063: 0,8 · E_REF; KOV-066: 1,0 · E_REF).
 */
export function kovetelmenyReferenciabol(eRef: number, szint: KovetelmenySzint, indikator: 'Enren_fajl' | 'ECO2_fajl'): number | null {
  if (!(eRef >= 0)) throw new ErvenytelenBemenet('Érvénytelen referenciaérték.', 'KOV-063');
  if (szint === 'jelentos_felujitas') {
    if (indikator === 'ECO2_fajl') return null;
    const sz = tabla(JF_E) as unknown as { egyeb_rendeltetes_szorzo_ref?: number };
    if (typeof sz.egyeb_rendeltetes_szorzo_ref !== 'number') throw new NormativAdatHiba('Hiányzó szorzó.', JF_E);
    return sz.egyeb_rendeltetes_szorzo_ref * eRef;
  }
  return szamMezo(knzeSor('egyeb', indikator), 'szorzo_ref', KNZE_E) * eRef;
}

// ---------------------------------------------------------------------------------------------
// Besorolás (TAN-003 … TAN-005)
// ---------------------------------------------------------------------------------------------

/**
 * Az energetikai minőség, ill. a CO2-kibocsátás aránya [%]: a vizsgált érték és az új épületre megengedett
 * követelményérték hányadosa (TAN-003, TAN-004; 176/2008 3. melléklet 1.1–1.2.).
 */
export function arany(ertek: number, ujEpuletKovetelmeny: number): number {
  if (!(ujEpuletKovetelmeny > 0)) throw new ErvenytelenBemenet('A követelményérték pozitív kell legyen.', 'TAN-003');
  return (100 * ertek) / ujEpuletKovetelmeny;
}

/** Besorolás az arány [%] alapján: A+++2023 … I2023 (TAN-005; 176/2008 3. melléklet 2. pont). */
export function besorolas(aranySzazalek: number): string {
  if (!Number.isFinite(aranySzazalek)) throw new ErvenytelenBemenet('Érvénytelen arány.', 'TAN-005');
  const sor = tabla(BESOROLAS).sorok.find((s) => {
    const also = s['also_hatar_kizart'] as number | null;
    const felso = s['felso_hatar'] as number | null;
    return (also === null || aranySzazalek > also) && (felso === null || aranySzazalek <= felso);
  });
  if (!sor) throw new NormativAdatHiba(`Az arány (${aranySzazalek}) egyik osztályba sem esik.`, BESOROLAS);
  return String(sor['osztaly']);
}

// ---------------------------------------------------------------------------------------------
// Szerkezet- és rendszerminősítés (TAN-008, TAN-009)
// ---------------------------------------------------------------------------------------------

export type Minosites = 'rossz' | 'gyenge' | 'kozepes' | 'jo' | 'kivalo';

function minosit(sor: NormativSor, x: number, hiv: string): Minosites {
  const [h1, h2, h3, h4] = ['h1', 'h2', 'h3', 'h4'].map((k) => szamMezo(sor, k, hiv)) as [number, number, number, number];
  if (x > h1) return 'rossz';
  if (x > h2) return 'gyenge';
  if (x > h3) return 'kozepes';
  if (x > h4) return 'jo';
  return 'kivalo';
}

/** A 176/2008 4. mellékletének szerkezetsorai (a `szerkezet` cella szövege). */
export type MinositettSzerkezet =
  | 'homlokzati fal'
  | 'padlásfödém'
  | 'talajjal érintkező fal'
  | 'talajon fekvő padló egyenértékű hőátbocsátási tényezője'
  | 'pincefödém'
  | 'magastető, lapostető'
  | 'nyílászáró'
  | 'tetősík ablakok';

/**
 * A 9/2023 ÉKM szerkezettípus-kódjából a 4. melléklet sora (DONTESEK.md D-012). `null`: a rendelet nem ad
 * osztályt (ajtó, kapu, fűtött–fűtetlen fal stb.).
 */
export function minositesiSor(kod: string): MinositettSzerkezet | null {
  const terkep: Record<string, MinositettSzerkezet> = {
    homlokzati_fal: 'homlokzati fal',
    padlasfodem: 'padlásfödém',
    talajjal_erintkezo_fal: 'talajjal érintkező fal',
    talajon_fekvo_padlo: 'talajon fekvő padló egyenértékű hőátbocsátási tényezője',
    also_zarofodem_futetlen_felett: 'pincefödém',
    arkad_athajto_feletti_fodem: 'pincefödém',
    lapos_teto: 'magastető, lapostető',
    futott_tetoter_hatarolo: 'magastető, lapostető',
    ablak_fa_pvc: 'nyílászáró',
    ablak_fem: 'nyílászáró',
    tetosik_ablak: 'tetősík ablakok',
  };
  return terkep[kod] ?? null;
}

/** Szerkezetminősítés az átlagos U alapján (TAN-008; 176/2008 4. melléklet). */
export function szerkezetMinosites(U: number, szerkezet: MinositettSzerkezet): Minosites {
  if (!(U > 0)) throw new ErvenytelenBemenet(`Érvénytelen U: ${U}`, 'TAN-008');
  return minosit(sorKeres(SZERK_OSZT, (s) => s['szerkezet'] === szerkezet), U, SZERK_OSZT);
}

export type MinositettRendszer = 'futes' | 'futes_es_szellozes' | 'hmv' | 'hutes_legkondicionalas' | 'beepitett_vilagitas';

/**
 * Rendszerminősítés a referenciaépülethez viszonyított mutató alapján [%] (TAN-009; 176/2008 5. melléklet).
 * A mutató kiszámítása (pl. fűtésnél (E/Q)/(E_REF/Q_REF)) a hívó feladata.
 */
export function rendszerMinosites(aranySzazalek: number, rendszer: MinositettRendszer): Minosites {
  if (!(aranySzazalek >= 0)) throw new ErvenytelenBemenet('Érvénytelen arány.', 'TAN-009');
  return minosit(sorKeres(RENDSZ_OSZT, (s) => s['rendszer'] === rendszer), aranySzazalek, RENDSZ_OSZT);
}
