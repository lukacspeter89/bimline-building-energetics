// Nyári hőterhelés – egyszerűsített, állandósult óránkénti mérleg a méretezési napon (D-150). NEM a VDI 2078:
// a szerkezetek hőtárolását nem veszi figyelembe, ezért a csúcsterhelést a biztonság javára becsüli.
// Méretezési nap: a 9/2023 módszer Meteo háttéradatának (F-05) legmelegebb napja (07.14.), a hőmérséklet-lefutás
// a megadott csúcsra eltolva; sugárzás tájolás és dőlésszög szerint ugyanabból a napból.
import type { Tajolas } from '../netto/eghajlat.js';
import { osszesitettG } from '../netto/nyereseg.js';
import { ErvenytelenBemenet } from '../hibak.js';
import { alapertek, tabla, type TablaHivatkozas } from '../normativ/index.js';

const NAP: TablaHivatkozas = 'modszer/meteo_meretezesi_nap#nap_07_14';
const DOLESEK = [30, 45, 60, 90] as const;

/** Fizikai állandók (D-150): levegő fajhője, a víz párolgáshője 0 °C-on, normál légnyomás. */
const CP_LEVEGO = 1.006; // kJ/(kg·K)
const R0 = 2501; // kJ/kg
const P_NORMAL = 1013.25; // hPa

/** Telítési gőznyomás víz felett [hPa]: 6,112·exp(17,62·t/(243,12 + t)) – WMO-No. 8, 4.B melléklet (D-150). */
export const telitesiGoznyomas = (t: number): number => 6.112 * Math.exp((17.62 * t) / (243.12 + t));

/** Abszolút nedvességtartalom [g/kg] hőmérsékletből és relatív páratartalomból, normál légnyomáson (NYH-007). */
export function nedvessegtartalom(t: number, rh: number): number {
  if (!(rh >= 0 && rh <= 100)) throw new ErvenytelenBemenet('A relatív páratartalom 0 és 100 % között adandó meg.', 'NYH-007');
  const e = (rh / 100) * telitesiGoznyomas(t);
  return (622 * e) / (P_NORMAL - e);
}

/** A méretezési nap órai külső hőmérséklete: az F-05 legmelegebb napja, a csúcsra eltolva (NYH-001). */
export function meretezesiHomerseklet(csucs: number): number[] {
  const t = tabla(NAP).sorok.map((s) => s['tk'] as number);
  const eltolas = csucs - Math.max(...t);
  return t.map((x) => x + eltolas);
}

/** Globál sugárzás a méretezési nap adott órájában [W/m²] (NYH-002): 15° alatt vízszintes, egyébként a legközelebbi dőlés. */
export function meretezesiSugarzas(ora: number, tajolas: Tajolas | undefined, hajlasszog: number): number {
  const sor = tabla(NAP).sorok[ora];
  if (!sor) throw new ErvenytelenBemenet('Érvénytelen óra.', 'NYH-002');
  if (hajlasszog < 15 || tajolas === undefined) return sor['I_vizszintes'] as number;
  const d = DOLESEK.reduce((m, x) => (Math.abs(x - hajlasszog) < Math.abs(m - hajlasszog) ? x : m), 90);
  return sor[`I_${tajolas}_${d}`] as number;
}

export interface NyhElem {
  /** Felület [m²]; nyílászárónál a teljes felület. */
  A: number;
  U: number;
  tajolas?: Tajolas;
  hajlasszog: number;
  /** Átlátszó szerkezet: üvegezett felület [m²], g⊥, árnyékolási tényező (1: árnyékolás nélkül). */
  atlatszo?: { Au: number; gN: number; fArny?: number };
}

export interface NyhBemenet {
  /** Csak a külső levegővel határos szerkezetek. */
  elemek: readonly NyhElem[];
  thetaI: number;
  /** Külső légáram [m³/h]. */
  qV: number;
  /** Belső hőterhelés óránként [W] (24 elem) vagy állandó érték. */
  belso: number | readonly number[];
  /** Belső látens terhelés [W] (személyek stb.), óránként vagy állandó. */
  belsoLatens?: number | readonly number[];
  thetaEcsucs: number;
  rhE: number;
  /** Belső relatív páratartalom [%]; nélküle nincs látens szellőzési terhelés. */
  rhI?: number;
}

export interface NyhOra {
  ora: number;
  thetaE: number;
  transzmisszio: number;
  napsugarzas: number;
  belso: number;
  szellozes: number;
  erzekelheto: number;
  latens: number;
}

/**
 * Óránkénti hőmérleg (NYH-003 … NYH-006):
 * Q_tr = Σ A·U·(θ_e − θ_i); Q_sug = Σ A_ü·g·F_árny·I, g = F_ü·g⊥ (6.24); Q_szell = 0,34·q·(θ_e − θ_i) (ρ·c_p, MSZ EN 12831-1 B.2.8);
 * Q_lat = ρ·q·r_0·(x_e − x_i)/3,6·10⁶ (ρ = 0,34·3,6/c_p) + belső látens; érzékelhető = Q_tr + Q_sug + Q_belső + Q_szell.
 * A külső páratartalom a megadott értéken állandó (a csúcsórára adott 45 % a biztonság javára).
 */
export function nyariHoterheles(b: NyhBemenet): { orai: NyhOra[]; csucs: NyhOra; csucsLatens: number } {
  const theta = meretezesiHomerseklet(b.thetaEcsucs);
  const rc = alapertek('szabvany/msz_en_12831_1#alapertekek', 'rho_cp'); // Wh/(m³K)
  const rho = (rc * 3.6) / CP_LEVEGO; // kg/m³
  const ora = (x: number | readonly number[] | undefined, h: number): number => (x === undefined ? 0 : typeof x === 'number' ? x : (x[h] ?? 0));
  const orai: NyhOra[] = theta.map((te, h) => {
    const dT = te - b.thetaI;
    let transzmisszio = 0;
    let napsugarzas = 0;
    for (const e of b.elemek) {
      transzmisszio += e.A * e.U * dT;
      if (e.atlatszo) napsugarzas += e.atlatszo.Au * osszesitettG(e.atlatszo.gN) * (e.atlatszo.fArny ?? 1) * meretezesiSugarzas(h, e.tajolas, e.hajlasszog);
    }
    const szellozes = rc * b.qV * dT;
    const belso = ora(b.belso, h);
    const xE = nedvessegtartalom(te, b.rhE);
    const latensSzell = b.rhI === undefined ? 0 : Math.max(0, (rho * b.qV * R0 * (xE - nedvessegtartalom(b.thetaI, b.rhI))) / 3600);
    return { ora: h, thetaE: te, transzmisszio, napsugarzas, belso, szellozes, erzekelheto: transzmisszio + napsugarzas + belso + szellozes, latens: latensSzell + ora(b.belsoLatens, h) };
  });
  const csucs = orai.reduce((m, x) => (x.erzekelheto > m.erzekelheto ? x : m));
  return { orai, csucs, csucsLatens: Math.max(...orai.map((x) => x.latens)) };
}
