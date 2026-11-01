import { ErvenytelenBemenet } from '../hibak.js';
import { alapertek, alapertekLista, type TablaHivatkozas } from '../normativ/index.js';
import { HONAPOK, evesKulsoHomerseklet, honapOrak, kulsoHomerseklet, type Honap } from './eghajlat.js';
import { belsoHonyereseg, direktSzolarisNyereseg, type Transzparens } from './nyereseg.js';
import { bTenyezo, futetlenTerHatarolo, type FutetlenTerTipus, type NapterUvegezes } from './transzmisszio.js';

const ALAP_6: TablaHivatkozas = 'modszer/netto_energiaigeny#alapertekek_6_fejezet';

/** Nem kondicionált tér felé néző határolók egy csoportja (6.1.3). */
export interface FutetlenHatarolo {
  /** Transzmissziós hőátviteli tényező a belső és a nem kondicionált tér között, b nélkül [W/K]. */
  hTrIx: number;
  /** A 6.3. táblázat sora (egyszerűsített b), vagy havi b-értékek részletes (MSZ EN ISO 13789) számításból. */
  b: { tipus: FutetlenTerTipus; uvegezes?: NapterUvegezes } | { havi: readonly number[] };
}

/** Havonta változó vagy állandó érték [W/K]. */
export type HaviErtek = number | readonly number[];

/** Egy termikus zóna bemenete a havi mérleghez (1. függ. 6. fejezet, egyszerűsített módszer). */
export interface NettoZonaBemenet {
  /** Hasznos alapterület [m²]. */
  aN: number;
  /** Fűtött (kondicionált) térfogat [m³] – a fajlagos hőveszteség-tényezőhöz (6.53). */
  V: number;
  /** Parancsolt belső hőmérséklet fűtésre és hűtésre [°C] (2. függ. 2.1. táblázat). */
  thetaIF: number;
  thetaIH: number;
  /** Effektív belső hőtároló képesség [kJ/K] (6.5. táblázat × A_N). */
  cmEff: number;
  /** Külső térrel határos szerkezetek direkt transzmissziós tényezője, csatlakozási hőhidakkal [W/K]. */
  hTrD: { F: number; H: number };
  futetlen: readonly FutetlenHatarolo[];
  /** Talajjal érintkező szerkezetek hőátviteli tényezője [W/K] (6.5)–(6.6). */
  hTrT: number;
  /** Szellőzési hőátviteli tényező fűtésre és hűtésre [W/K], havonta vagy állandó (6.8)–(6.19). */
  hSzell: { F: HaviErtek; H: HaviErtek };
  transzparens: readonly Transzparens[];
  /** Fajlagos belső hőnyereség [W/m²] (2. függ. 2.1. táblázat). */
  qb: number;
  /** Szakaszos üzem korrekciós tényezője fűtésre és hűtésre (2. függ. 2.5. és 2.6. táblázat). */
  sigmaF: number;
  sigmaH: number;
  /**
   * A becsült hőszükséglethez (6.54) használt szellőzési tényező [W/K]; ha nincs megadva, a januári
   * fűtési érték (DONTESEK.md D-113).
   */
  hSzellFHoszukseglethez?: number;
}

export interface HaviEredmeny {
  honap: Honap;
  dt: number;
  thetaE: number;
  hTrX: number;
  QtrF: number;
  QtrH: number;
  QszellF: number;
  QszellH: number;
  QsdF: number;
  QsdH: number;
  Qb: number;
  Qveszt: number;
  Qnyer: number;
  Qlead: number;
  Qterh: number;
  tauF: number;
  tauH: number;
  gammaF: number;
  gammaH: number;
  etaF: number;
  etaH: number;
  QFnet: number;
  /** Folyamatos üzemre számított hűtési igény (σ_H nélkül) és a szakaszos üzemmel korrigált érték. */
  QHnetFolyt: number;
  QHnet: number;
}

export interface NettoEredmeny {
  havi: HaviEredmeny[];
  /** Éves nettó fűtési és hűtési energiaigény [kWh/év] (6.41), (6.48). */
  QFnetEv: number;
  QHnetEv: number;
  /** Fajlagos nettó fűtési és hűtési energiaigény [kWh/m²év] (6.42), (6.51). */
  qFnet: number;
  qHnet: number;
  /** Fajlagos hőveszteség-tényező [W/m³K] (6.53). */
  qm: number;
  /** Becsült fűtési hőszükséglet a lefedési arányokhoz [W] (6.54) – rendszerméretezésre nem használható. */
  QFo: number;
}

function haviErtek(v: HaviErtek, m: Honap, matrixId: string): number {
  const x = typeof v === 'number' ? v : v[m - 1];
  if (x === undefined || !Number.isFinite(x) || x < 0) throw new ErvenytelenBemenet('Érvénytelen havi érték.', matrixId);
  return x;
}

/**
 * Fűtési hasznosítási tényező (NET-019 … NET-023; 1. függ. 6.7.1, (6.35)–(6.39), 50. o.).
 */
export function hasznositasiTenyezoF(gamma: number, qNyer: number, tau: number): number {
  const a = alapertek(ALAP_6, 'a_F0') + tau / alapertek(ALAP_6, 'tau_F0');
  if (gamma > 0 && gamma !== 1) return (1 - gamma ** a) / (1 - gamma ** (a + 1));
  if (gamma === 1) return a / (a + 1);
  return qNyer > 0 ? 1 / gamma : 1;
}

/**
 * Hűtési hasznosítási tényező (NET-028 … NET-031; 1. függ. 6.8.1, (6.43)–(6.46), 50–51. o.).
 */
export function hasznositasiTenyezoH(gamma: number, tau: number): number {
  const a = alapertek(ALAP_6, 'a_H0') + tau / alapertek(ALAP_6, 'tau_H0');
  if (gamma > 0 && gamma !== 1) return (1 - gamma ** -a) / (1 - gamma ** -(a + 1));
  if (gamma === 1) return a / (a + 1);
  return 1;
}

/** γ = számláló / nevező, a nullával osztást a ±∞ és a 0/0 = 0 megállapodással kezelve. */
function arany(szamlalo: number, nevezo: number): number {
  if (nevezo !== 0) return szamlalo / nevezo;
  if (szamlalo === 0) return 0;
  return szamlalo > 0 ? Infinity : -Infinity;
}

/**
 * Egy zóna havi nettó fűtési és hűtési energiaigénye az egyszerűsített (havi) módszerrel
 * (1. függ. 6. fejezet, 38–53. o.; NET-002, NET-006 … NET-037, TR-026, SZ-031, NY-001, NY-019, QM-001 … QM-003,
 * HSZ-001, HSZ-002). Értelmezések: DONTESEK.md D-111 (τ), D-112 (σ_F), D-113 (Q_F,o).
 */
export function nettoEnergiaigeny(z: NettoZonaBemenet): NettoEredmeny {
  if (!(z.aN > 0) || !(z.V > 0) || !(z.cmEff > 0)) {
    throw new ErvenytelenBemenet('Az alapterület, a térfogat és a hőtároló képesség pozitív kell legyen.', 'NET-018');
  }
  if (!(z.hTrD.F >= 0) || !(z.hTrD.H >= 0) || !(z.hTrT >= 0)) {
    throw new ErvenytelenBemenet('Érvénytelen transzmissziós tényező.', 'TR-026');
  }
  if (!(z.sigmaF > 0 && z.sigmaF <= 1) || !(z.sigmaH > 0 && z.sigmaH <= 1)) {
    throw new ErvenytelenBemenet('Érvénytelen szakaszos üzemi tényező.', 'NET-013');
  }
  const thetaEv = evesKulsoHomerseklet();
  const cmWh = z.cmEff / alapertek(ALAP_6, 'cm_eff_kJ_per_Wh');
  const gammaFMax = alapertek(ALAP_6, 'gamma_F_max_futesi_igenyhez');
  const invGammaHMax = alapertek(ALAP_6, 'inv_gamma_H_max_hutesi_igenyhez');

  const hTrXHavi = (m: Honap): number =>
    z.futetlen.reduce((s, f) => {
      const b = 'havi' in f.b ? haviErtek(f.b.havi, m, 'TR-014') : bTenyezo(f.b.tipus, m, z.thetaIF, z.thetaIH, f.b.uvegezes);
      return s + futetlenTerHatarolo(b, f.hTrIx);
    }, 0);

  const havi: HaviEredmeny[] = HONAPOK.map((m) => {
    const dt = honapOrak(m);
    const thetaE = kulsoHomerseklet(m);
    const hTrX = hTrXHavi(m);
    const hSzF = haviErtek(z.hSzell.F, m, 'SZ-031');
    const hSzH = haviErtek(z.hSzell.H, m, 'SZ-031');

    // (6.7) transzmisszió, (6.20) szellőzés [kWh]
    const QtrF = ((z.hTrD.F + hTrX) * (z.thetaIF - thetaE) + z.hTrT * (z.thetaIF - thetaEv)) * dt / 1000;
    const QtrH = ((z.hTrD.H + hTrX) * (z.thetaIH - thetaE) + z.hTrT * (z.thetaIH - thetaEv)) * dt / 1000;
    const QszellF = (hSzF * (z.thetaIF - thetaE) * dt) / 1000;
    const QszellH = (hSzH * (z.thetaIH - thetaE) * dt) / 1000;

    // (6.21)–(6.26) nyereségek; Q_sid = 0 (NY-018)
    const QsdF = direktSzolarisNyereseg(z.transzparens, m, 'F');
    const QsdH = direktSzolarisNyereseg(z.transzparens, m, 'H');
    const Qb = belsoHonyereseg(z.aN, z.qb, dt);

    // (6.27)–(6.33)
    const Qveszt = z.sigmaF * (QtrF + QszellF);
    const Qnyer = QsdF + Qb;
    const Qlead = QtrH + QszellH;
    const Qterh = QsdH + Qb;

    // (6.34) időállandó
    const tauF = cmWh / (z.hTrD.F + hTrX + z.hTrT + hSzF);
    const tauH = cmWh / (z.hTrD.H + hTrX + z.hTrT + hSzH);

    // Fűtés (6.31), (6.35)–(6.40) és a nullázó szabályok
    const gammaF = arany(Qnyer, Qveszt);
    // γ → +∞ esetén η → 0 (a (6.35) határértéke), γ → −∞ esetén a (6.37)–(6.38) szerint 0, ill. 1.
    const etaF = Number.isFinite(gammaF)
      ? hasznositasiTenyezoF(gammaF, Qnyer, tauF)
      : gammaF > 0 || Qnyer > 0
        ? 0
        : 1;
    const QFnet = (gammaF <= 0 && Qnyer > 0) || gammaF > gammaFMax ? 0 : Math.max(0, Qveszt - etaF * Qnyer);

    // Hűtés (6.32), (6.43)–(6.47), nullázó szabályok, (6.49)
    const gammaH = arany(Qterh, Qlead);
    const etaH = hasznositasiTenyezoH(gammaH, tauH);
    let QHnetFolyt = Qterh - etaH * Qlead;
    if (arany(1, gammaH) > invGammaHMax || QHnetFolyt < 0) QHnetFolyt = 0;
    const QHnet = z.sigmaH * QHnetFolyt;

    return {
      honap: m, dt, thetaE, hTrX, QtrF, QtrH, QszellF, QszellH, QsdF, QsdH, Qb,
      Qveszt, Qnyer, Qlead, Qterh, tauF, tauH, gammaF, gammaH, etaF, etaH, QFnet, QHnetFolyt, QHnet,
    };
  });

  const QFnetEv = havi.reduce((s, h) => s + h.QFnet, 0);
  const QHnetEv = havi.reduce((s, h) => s + h.QHnet, 0);

  // (6.53) fajlagos hőveszteség-tényező, november–március, Δt = 3624 h
  const qmHonapok = alapertekLista(ALAP_6, 'qm_osszegzes_honapok');
  const qmDt = alapertek(ALAP_6, 'qm_delta_t');
  const qmOsszeg = havi
    .filter((h) => qmHonapok.includes(h.honap))
    .reduce((s, h) => s + (h.QtrF - h.etaF * h.QsdF) / (z.thetaIF - h.thetaE), 0);
  const qm = (1000 / (z.V * qmDt)) * qmOsszeg;

  // (6.54)–(6.55) becsült hőszükséglet
  const jan = havi[0]!;
  const hSzF0 = z.hSzellFHoszukseglethez ?? haviErtek(z.hSzell.F, 1, 'HSZ-001');
  const QFo = (z.hTrD.F + jan.hTrX + z.hTrT + hSzF0) * (z.thetaIF - alapertek(ALAP_6, 'theta_e_o'));

  return { havi, QFnetEv, QHnetEv, qFnet: QFnetEv / z.aN, qHnet: QHnetEv / z.aN, qm, QFo };
}
