import { ErvenytelenBemenet, ReszletesModszerSzukseges } from '../hibak.js';
import { alapertek, alapertekLista, type TablaHivatkozas } from '../normativ/index.js';
import type { Honap } from './eghajlat.js';

const ALAP_6: TablaHivatkozas = 'modszer/netto_energiaigeny#alapertekek_6_fejezet';

/** A levegő térfogati hőkapacitása [Wh/m³K] (SZ-002, 1. függ. 6.2.1, 43. o.). */
export function levegoHokapacitas(): number {
  return alapertek(ALAP_6, 'levego_terfogati_hokapacitas');
}

/** Egy szellőzési mód a (6.8)-hoz. */
export interface SzellozesiMod {
  /** Hőmérséklet-korrekciós tényező (1, ha a befújt levegő a külsővel azonos hőmérsékletű) [-]. */
  bSzell: number;
  /** Légcsereszám a mód működése alatt [1/h]. */
  n: number;
  /** Szellőztetett térfogat [m³]. */
  V: number;
  /** A mód működési ideje a vizsgált időszakban [h]. */
  dtK: number;
}

/**
 * Általános szellőzési hőátviteli tényező [W/K]: H = 0,35 · Σ (b_szell,k · n_k · V_k · Δt_k / Δt), (6.8)
 * (SZ-001, SZ-003; 1. függ. 6.2.1, 42–43. o.).
 * @param dt a vizsgált időszak (hónap) hossza [h]
 */
export function altalanosSzellozes(modok: readonly SzellozesiMod[], dt: number): number {
  if (!(dt > 0)) throw new ErvenytelenBemenet('Érvénytelen időszakhossz.', 'SZ-001');
  for (const k of modok) {
    if (!(k.bSzell >= 0) || !(k.n >= 0) || !(k.V >= 0) || !(k.dtK >= 0) || k.dtK > dt) {
      throw new ErvenytelenBemenet('Érvénytelen szellőzési mód.', 'SZ-001');
    }
  }
  return levegoHokapacitas() * modok.reduce((s, k) => s + (k.bSzell * k.n * k.V * k.dtK) / dt, 0);
}

/** Szükséges légcsereszám a térfogatáramból: n_szüks = V̇_LT / V [1/h] (SZ-004, 1. függ. 6.2.1, 43. o.). */
export function szuksegesLegcsere(vLT: number, V: number): number {
  if (!(vLT >= 0) || !(V > 0)) throw new ErvenytelenBemenet('Érvénytelen térfogatáram vagy térfogat.', 'SZ-004');
  return vLT / V;
}

/**
 * Hőmérséklet-korrekciós tényező eltérő befúvási hőmérsékletnél: b_szell = (θ_i − θ_bef) / (θ_i − θ_e),
 * (6.9) (SZ-005, SZ-007). Légfűtésnél vagy léghűtésnél nem alkalmazható.
 */
export function bSzellKorrekcio(thetaI: number, thetaBef: number, thetaE: number, legfutesVagyLeghutes = false): number {
  if (legfutesVagyLeghutes) {
    throw new ReszletesModszerSzukseges('A b_szell korrekció légfűtés vagy léghűtés esetén nem alkalmazható.', 'SZ-007');
  }
  if (thetaI === thetaE) throw new ErvenytelenBemenet('θ_i = θ_e esetén a b_szell nem értelmezett.', 'SZ-005');
  return (thetaI - thetaBef) / (thetaI - thetaE);
}

/**
 * Tisztán természetes szellőzésű épület: H = 0,35 · (n_szüks · Δt_term/Δt + n_filt) · V, (6.10)
 * (SZ-009, SZ-019; 1. függ. 6.2.2, 43. o.).
 * @param termIdoarany Δt_term / Δt – a természetes szellőzésű használati idő aránya
 */
export function termeszetesSzellozes(nSzuks: number, termIdoarany: number, nFilt: number, V: number): number {
  if (!(nSzuks >= 0) || !(termIdoarany >= 0 && termIdoarany <= 1) || !(nFilt >= 0) || !(V >= 0)) {
    throw new ErvenytelenBemenet('Érvénytelen természetes szellőzési adat.', 'SZ-009');
  }
  return levegoHokapacitas() * (nSzuks * termIdoarany + nFilt) * V;
}

export interface EjszakaiSzellozesFeltetelek {
  /** Tűréshatárt meg nem haladó utcai zaj- és porterhelés. */
  zajPorRendben: boolean;
  /** Nincs vagyonvédelmi kockázat. */
  nincsVagyonvedelmiKockazat: boolean;
  /** Egyéb rendeltetésnél: automatikus nyitás/zárás (lakóépületnél nem feltétel). */
  automatikusNyitasVagyLako: boolean;
  /** Az éjszakai szellőztetést szellőző rendszer biztosítja – ekkor a (6.11) nem alkalmazható (SZ-017). */
  gepiEjszakaiSzellozes?: boolean;
}

/**
 * Éjszakai többletszellőztetés hőátviteli tényező-növekménye [W/K] hűtési üzemben, május–szeptember:
 * H = 0,35 · (b_éjjel · 7/24 · n_éjjel) · V, (6.11) (SZ-012 … SZ-017; 1. függ. 6.2.3, 44. o.).
 * Más hónapban, illetve ha a feltételek nem teljesülnek, 0.
 * @param bEjjel ha nincs megadva, az egyszerűsített 1,5 (SZ-015)
 */
export function ejszakaiTobbletSzellozes(
  m: Honap,
  nEjjel: number,
  V: number,
  felt: EjszakaiSzellozesFeltetelek,
  bEjjel?: number,
): number {
  if (felt.gepiEjszakaiSzellozes) {
    throw new ReszletesModszerSzukseges(
      'Ha az éjszakai szellőztetést szellőző rendszer biztosítja, a (6.11) egyszerűsített módszer nem alkalmazható.',
      'SZ-017',
    );
  }
  if (!alapertekLista(ALAP_6, 'ejszakai_szellozes_honapok').includes(m)) return 0;
  if (!(felt.zajPorRendben && felt.nincsVagyonvedelmiKockazat && felt.automatikusNyitasVagyLako)) return 0;
  if (!(nEjjel >= 0) || !(V >= 0)) throw new ErvenytelenBemenet('Érvénytelen éjszakai légcsere.', 'SZ-014');
  const b = bEjjel ?? alapertek(ALAP_6, 'b_ejjel_egyszerusitett');
  return levegoHokapacitas() * (b * alapertek(ALAP_6, 'ejszakai_szellozes_idoarany') * nEjjel) * V;
}

/**
 * Folyamatos, hővisszanyerős, állandó térfogatáramú gépi szellőzés fűtési módban (előfűtés és talajhőcserélő
 * nélkül, külső beszívással): H = 0,35 · (V̇_LT,friss · (1 − η_r) + n_filt · V), (6.12) (SZ-020).
 */
export function folyamatosHovisszanyerosSzellozesF(vFriss: number, etaR: number, nFilt: number, V: number): number {
  if (!(vFriss >= 0) || !(etaR >= 0 && etaR < 1) || !(nFilt >= 0) || !(V >= 0)) {
    throw new ErvenytelenBemenet('Érvénytelen gépi szellőzési adat.', 'SZ-020');
  }
  return levegoHokapacitas() * (vFriss * (1 - etaR) + nFilt * V);
}

/** Gépi szellőzés egy fokozata (n. üzemmód) a (6.13)–(6.18)-hoz. */
export interface GepiFokozat {
  /** Friss levegős térfogatáram [m³/h]. */
  vFriss: number;
  /** Üzemidő a vizsgált időszakban [h]. */
  dtLT: number;
  /** Hővisszanyerő hatásfoka [-] (csak fűtés). */
  etaR?: number;
  /** Fagyvédelmi előfűtés: a −4 °C alatti üzemidő [h] és az átlagos külső hőmérséklet ekkor [°C] (6.17). */
  fagyvedelem?: { dtEF: number; thetaE4: number };
  /** Talajkollektoros előmelegítés: a kilépő levegő átlaghőmérséklete [°C] (6.18). */
  talajkollektorTheta?: number;
}

/**
 * A gépi szellőzés n. fokozatának hőátviteli tényezője [W/K] (SZ-023 … SZ-028; 1. függ. 6.2.4, 45. o.):
 * - hűtésnél és hővisszanyerő nélkül: 0,35 · V̇ · Δt_LT/Δt, (6.15);
 * - fűtés, hővisszanyerővel: × (1 − η_r), (6.16);
 * - fűtés, fagyvédelmi előfűtéssel és hővisszanyerővel: (6.17);
 * - fűtés, talajkollektorral és hővisszanyerővel: (6.18).
 * Egyszerűsített módszerben a hűtési üzemmódot mindig a (6.15) szerint kell számolni (SZ-024).
 */
export function gepiFokozat(
  f: GepiFokozat,
  uzem: 'F' | 'H',
  dt: number,
  thetaIF: number,
  thetaEAtlag: number,
): number {
  if (!(dt > 0) || !(f.vFriss >= 0) || !(f.dtLT >= 0) || f.dtLT > dt) {
    throw new ErvenytelenBemenet('Érvénytelen gépi szellőzési fokozat.', 'SZ-023');
  }
  const c = levegoHokapacitas();
  const etaR = f.etaR ?? 0;
  if (!(etaR >= 0 && etaR < 1)) throw new ErvenytelenBemenet('Érvénytelen hővisszanyerő-hatásfok.', 'SZ-025');
  if (uzem === 'H' || (etaR === 0 && !f.fagyvedelem && f.talajkollektorTheta === undefined)) {
    return (c * f.vFriss * f.dtLT) / dt;
  }
  if (f.fagyvedelem && f.talajkollektorTheta !== undefined) {
    throw new ErvenytelenBemenet('Fagyvédelmi előfűtés és talajkollektor együtt nem adható meg.', 'SZ-026');
  }
  if (thetaIF === thetaEAtlag) throw new ErvenytelenBemenet('θ_i,F = θ_e,átlag esetén nem értelmezett.', 'SZ-026');
  if (f.fagyvedelem) {
    const hatar = alapertek(ALAP_6, 'fagyvedelmi_elofutes_hatar');
    const { dtEF, thetaE4 } = f.fagyvedelem;
    if (!(dtEF >= 0) || dtEF > f.dtLT) throw new ErvenytelenBemenet('Érvénytelen előfűtési idő.', 'SZ-026');
    const nev = thetaIF - thetaEAtlag;
    return (
      ((c * f.vFriss) / dt) *
      (((f.dtLT - dtEF) + (dtEF * (thetaIF - hatar)) / nev) * (1 - etaR) + (dtEF * (hatar - thetaE4)) / nev)
    );
  }
  if (f.talajkollektorTheta !== undefined) {
    return ((c * f.vFriss * f.dtLT) / dt) * ((thetaIF - f.talajkollektorTheta) / (thetaIF - thetaEAtlag)) * (1 - etaR);
  }
  return ((c * f.vFriss * f.dtLT) / dt) * (1 - etaR);
}

/**
 * Szakaszos gépi szellőzés (használati időben kikapcsolt gépi szellőzés idejére természetes szellőzés):
 * H_term = 0,35 · n_szüks · (Δt_term/Δt) · V, (6.14) (SZ-022). A (6.14)-ben a szöveg n_term-et említ,
 * a képlet n_szüks-t – a program a képletet követi.
 */
export function szakaszosTermeszetesTag(nSzuks: number, dtTerm: number, dt: number, V: number): number {
  if (!(nSzuks >= 0) || !(dtTerm >= 0) || !(dt > 0) || dtTerm > dt || !(V >= 0)) {
    throw new ErvenytelenBemenet('Érvénytelen bemenet.', 'SZ-022');
  }
  return levegoHokapacitas() * nSzuks * (dtTerm / dt) * V;
}

/** Infiltrációs tag: H_filt = 0,35 · n_filt · V, (6.19) (SZ-029). */
export function infiltracio(nFilt: number, V: number): number {
  if (!(nFilt >= 0) || !(V >= 0)) throw new ErvenytelenBemenet('Érvénytelen bemenet.', 'SZ-029');
  return levegoHokapacitas() * nFilt * V;
}

/** Szakaszos gépi szellőzés teljes hőátviteli tényezője: H = H_term + Σ H_LT,n + H_filt, (6.13) (SZ-021). */
export function szakaszosGepiSzellozes(hTerm: number, hLT: readonly number[], hFilt: number): number {
  return hTerm + hLT.reduce((s, h) => s + h, 0) + hFilt;
}
