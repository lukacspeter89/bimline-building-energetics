import { ErvenytelenBemenet, ReszletesModszerSzukseges } from '../hibak.js';
import { alapertek, type TablaHivatkozas } from '../normativ/index.js';
import type { FeluletiEllenallas } from './feluleti.js';

const ALAPERTEKEK_4: TablaHivatkozas = 'modszer/hotechnika#alapertekek_4';

/** Homogén anyagréteg: vastagság és tervezési hővezetési tényező (HT-005, HT-007). */
export interface HomogenReteg {
  tipus: 'homogen';
  /** Rétegvastagság [m]. Változó vastagságú rétegnél az átlagos vastagság (HT-043). */
  d: number;
  /** Tervezési hővezetési tényező [W/mK]. */
  lambda: number;
}

/** Ellenállásával megadott réteg (pl. zárt légréteg a 4.2. táblázatból) [m²K/W]. */
export interface EllenallasReteg {
  tipus: 'ellenallas';
  R: number;
}

export type Reteg = HomogenReteg | EllenallasReteg;

/** Réteg hővezetési ellenállása: R = d / λ, (4.3) egyenlet (HT-005, 1. függ. 4.1, 23. o.). */
export function retegEllenallas(d: number, lambda: number): number {
  if (!(d >= 0)) throw new ErvenytelenBemenet(`Érvénytelen rétegvastagság: ${d}`, 'HT-005');
  if (!(lambda > 0)) throw new ErvenytelenBemenet(`Érvénytelen hővezetési tényező: ${lambda}`, 'HT-005');
  return d / lambda;
}

function retegR(r: Reteg): number {
  if (r.tipus === 'homogen') return retegEllenallas(r.d, r.lambda);
  if (!(r.R >= 0)) throw new ErvenytelenBemenet(`Érvénytelen rétegellenállás: ${r.R}`, 'HT-003');
  return r.R;
}

/**
 * Homogén rétegekből álló szerkezet eredő hővezetési ellenállása:
 * R_tot = R_si + Σ R_i + R_se, (4.2) egyenlet (HT-003, 1. függ. 4.1, 23. o.).
 */
export function homogenRtot(felulet: FeluletiEllenallas, retegek: readonly Reteg[]): number {
  return felulet.Rsi + retegek.reduce((s, r) => s + retegR(r), 0) + felulet.Rse;
}

/** Hőátbocsátási tényező: U = 1 / R_tot, (4.1) egyenlet (HT-002, 1. függ. 4.1, 23. o.). */
export function hoatbocsatasiTenyezo(rTot: number): number {
  if (!(rTot > 0)) throw new ErvenytelenBemenet(`Az eredő hővezetési ellenállás pozitív kell legyen: ${rTot}`, 'HT-002');
  return 1 / rTot;
}

/**
 * Inhomogén réteg egy szeletben: vagy anyag (λ), vagy ellenállással megadott (pl. légréteg).
 */
export type SzeletAnyag = { lambda: number } | { R: number };

/** Inhomogén szerkezet egy rétege: vastagság és szeletenkénti anyag (a szeletek sorrendje a `szeletArany`-é). */
export interface InhomogenReteg {
  d: number;
  szeletek: readonly SzeletAnyag[];
}

export interface InhomogenSzerkezet {
  felulet: FeluletiEllenallas;
  /** Az egyes szeletek területaránya (f_a … f_q); összegük 1. */
  szeletArany: readonly number[];
  retegek: readonly InhomogenReteg[];
  /** Fém kötőelem átszúrja a hőszigetelést – ilyenkor a (4.13) korrekció kell, az egyszerűsített módszer nem (HT-034). */
  femKotoelemAtszurja?: boolean;
}

export interface InhomogenEredmeny {
  rTotFelso: number;
  rTotAlso: number;
  rTot: number;
  U: number;
}

function szeletR(d: number, a: SzeletAnyag): number {
  return 'lambda' in a ? retegEllenallas(d, a.lambda) : a.R;
}

function szeletLambda(d: number, a: SzeletAnyag): number {
  if ('lambda' in a) return a.lambda;
  if (!(a.R > 0)) throw new ErvenytelenBemenet('Ellenállással megadott szelet ellenállása pozitív kell legyen.', 'HT-039');
  return d / a.R;
}

/**
 * Inhomogén rétegeket tartalmazó szerkezet eredő ellenállása az egyszerűsített módszerrel
 * (1. függ. 4.1.4 b), (4.5)–(4.9), 25–26. o.):
 * - felső határérték (HT-037, (4.6)): 1/R_tot,felső = Σ f_q / R_tot,q, ahol R_tot,q = R_si + Σ_j d_j/λ_qj + R_se;
 * - alsó határérték (HT-038 … HT-040, (4.7)–(4.9)): R_j = d_j / λ_eq,j, λ_eq,j = Σ λ_qj · f_q,
 *   R_tot,alsó = R_si + Σ R_j + R_se (a felületi ellenállások beszámítása: DONTESEK.md D-107);
 * - eredő (HT-035, (4.5)): R_tot = (R_tot,felső + R_tot,alsó) / 2.
 * Ha R_tot,felső / R_tot,alsó > 1,5, vagy fém kötőelem szúrja át a hőszigetelést, az egyszerűsített
 * módszer nem alkalmazható (HT-033, HT-034).
 */
export function inhomogenSzerkezet(sz: InhomogenSzerkezet): InhomogenEredmeny {
  const n = sz.szeletArany.length;
  if (n === 0) throw new ErvenytelenBemenet('Legalább egy szelet kell.', 'HT-037');
  const fOssz = sz.szeletArany.reduce((s, f) => s + f, 0);
  if (sz.szeletArany.some((f) => !(f > 0)) || Math.abs(fOssz - 1) > 1e-9) {
    throw new ErvenytelenBemenet(`A szeletek területarányainak összege 1 kell legyen (most ${fOssz}).`, 'HT-037');
  }
  for (const r of sz.retegek) {
    if (r.szeletek.length !== n) {
      throw new ErvenytelenBemenet('Minden rétegnek minden szeletre meg kell adni az anyagot.', 'HT-036');
    }
    if (!(r.d >= 0)) throw new ErvenytelenBemenet(`Érvénytelen rétegvastagság: ${r.d}`, 'HT-005');
  }
  if (sz.femKotoelemAtszurja) {
    throw new ReszletesModszerSzukseges(
      'A hőszigetelést átszúró fém kötőelemek esetén az egyszerűsített módszer nem alkalmazható; a (4.13) korrekciót kell használni.',
      'HT-034',
    );
  }
  const { Rsi, Rse } = sz.felulet;

  let felsoReciprok = 0;
  sz.szeletArany.forEach((f, q) => {
    const rTotQ = Rsi + sz.retegek.reduce((s, r) => s + szeletR(r.d, r.szeletek[q]!), 0) + Rse;
    felsoReciprok += f / rTotQ;
  });
  const rTotFelso = 1 / felsoReciprok;

  const rTotAlso =
    Rsi +
    sz.retegek.reduce((s, r) => {
      const lambdaEq = r.szeletek.reduce((acc, a, q) => acc + szeletLambda(r.d, a) * sz.szeletArany[q]!, 0);
      return s + retegEllenallas(r.d, lambdaEq);
    }, 0) +
    Rse;

  const aranyMax = alapertek(ALAPERTEKEK_4, 'inhomogen_felso_also_arany_max');
  if (rTotFelso / rTotAlso > aranyMax) {
    throw new ReszletesModszerSzukseges(
      `Az eredő ellenállás felső és alsó határértékének aránya (${(rTotFelso / rTotAlso).toFixed(3)}) meghaladja az ${aranyMax}-et; részletes (numerikus) számítás kell.`,
      'HT-033',
    );
  }
  const rTot = (rTotFelso + rTotAlso) / 2;
  return { rTotFelso, rTotAlso, rTot, U: hoatbocsatasiTenyezo(rTot) };
}
