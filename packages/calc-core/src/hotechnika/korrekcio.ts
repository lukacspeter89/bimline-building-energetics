import { ErvenytelenBemenet, ReszletesModszerSzukseges } from '../hibak.js';
import { alapertek, type TablaHivatkozas } from '../normativ/index.js';

const ALAPERTEKEK_4: TablaHivatkozas = 'modszer/hotechnika#alapertekek_4';

/**
 * A légüreg-korrekció szintje (1. függ. 4.1.6, 27. o.):
 * - `lepcsozetes`: lépcsőzetesen eltolt, egynél több rétegben beépített hőszigetelés – nincs korrekció (HT-050);
 * - `1`: van átmenő hézag, de légáramlás nem jöhet létre – általános esetben ezt kell alkalmazni (HT-049);
 * - `2`: a hőszigetelés hideg és meleg oldala között szabad légáramlás alakulhat ki (HT-048).
 */
export type LeguregSzint = 'lepcsozetes' | 1 | 2;

/** Az R_1 / R_tot arány négyzete; R_tot a hőhídhatás (légüreg, rögzítőelem) nélkül számított eredő ellenállás. */
function aranyNegyzet(r1: number, rTot: number, matrixId: string): number {
  if (!(r1 >= 0) || !(rTot > 0) || r1 > rTot) {
    throw new ErvenytelenBemenet('Érvénytelen R_1 / R_tot érték (0 ≤ R_1 ≤ R_tot kell).', matrixId);
  }
  return (r1 / rTot) ** 2;
}

/**
 * Légüreg-korrekció: ΔU_légüreg = ΔU'' · (R_1 / R_tot)², (4.12) egyenlet (HT-047 … HT-050, 1. függ. 4.1.6, 27. o.).
 * @param r1 a légüreget tartalmazó réteg hővezetési ellenállása [m²K/W]
 * @param rTot a szerkezet eredő ellenállása a légüregek figyelembevétele nélkül [m²K/W]
 */
export function leguregKorrekcio(szint: LeguregSzint, r1: number, rTot: number): number {
  if (szint === 'lepcsozetes') return alapertek(ALAPERTEKEK_4, 'dU2_lepcsozetes');
  const dU2 = alapertek(ALAPERTEKEK_4, szint === 1 ? 'dU2_szint1' : 'dU2_szint2');
  return dU2 * aranyNegyzet(r1, rTot, 'HT-047');
}

export interface RogzitoelemBemenet {
  /** A rögzítőelem hővezetési tényezője [W/mK]. */
  lambdaRogz: number;
  /** Egy rögzítőelem keresztmetszeti területe [m²] – csak az 1 W/mK-nél nagyobb λ-jú rész (HT-058). */
  aRogz: number;
  /** A rögzítőelemek száma négyzetméterenként [db/m²]. */
  nRogz: number;
  /** A hőszigetelő réteget átszúró rögzítőelem hossza a hőszigetelő rétegben [m]. */
  d1: number;
  /** Süllyesztett rögzítőelemnél a rögzítőelemet tartalmazó hőszigetelés vastagsága [m] (HT-054). */
  d0?: number;
  /** A rögzítőelemek által átszúrt hőszigetelő réteg hővezetési ellenállása [m²K/W]. */
  r1: number;
  /** A szerkezet hőhídhatás nélkül számított eredő ellenállása [m²K/W]. */
  rTot: number;
  /** A rögzítőelem légréteget szúr át (HT-057). */
  legretegetSzurAt?: boolean;
  /** Két fémlemezt összekötő fém rögzítőelem, pl. fémfegyverzetű szendvicspanel (HT-059). */
  ketFemlemeztKotOssze?: boolean;
}

/**
 * Mechanikai rögzítőelem korrekciója (egyszerűsített módszer):
 * ΔU_rögz = α · λ_rögz · A_rögz · n_rögz / d_1 · (R_1 / R_tot)², (4.13) egyenlet
 * (HT-052 … HT-059, 1. függ. 4.1.6, 27–28. o.). Süllyesztett elemnél α = 0,8 · d_1 / d_0, és az R_1-et
 * a hívó számítsa d_1 / λ_hőszigetelés alapján (HT-056).
 */
export function rogzitoelemKorrekcio(b: RogzitoelemBemenet): number {
  if (b.ketFemlemeztKotOssze) {
    throw new ReszletesModszerSzukseges(
      'Két fémlemezt összekötő fém rögzítőelemnél (pl. fémfegyverzetű szendvicspanel) részletes számítás kell.',
      'HT-059',
    );
  }
  if (b.legretegetSzurAt || b.lambdaRogz < alapertek(ALAPERTEKEK_4, 'lambda_rogz_kuszob')) return 0;
  if (!(b.aRogz >= 0) || !(b.nRogz >= 0) || !(b.d1 > 0)) {
    throw new ErvenytelenBemenet('Érvénytelen rögzítőelem-adat (A_rögz ≥ 0, n_rögz ≥ 0, d_1 > 0 kell).', 'HT-052');
  }
  let alpha = alapertek(ALAPERTEKEK_4, 'alpha_atmeno');
  if (b.d0 !== undefined) {
    if (!(b.d0 > 0)) throw new ErvenytelenBemenet('Érvénytelen d_0.', 'HT-054');
    alpha = (alapertek(ALAPERTEKEK_4, 'alpha_sullyesztett_szorzo') * b.d1) / b.d0;
  }
  return ((alpha * b.lambdaRogz * b.aRogz * b.nRogz) / b.d1) * aranyNegyzet(b.r1, b.rTot, 'HT-052');
}

export interface ForditottTetoBemenet {
  /** A vízszigetelés fölötti hőszigetelés egy rétegben van. */
  egyreteguHoszigeteles: boolean;
  /** A hőszigetelő táblák tompa illesztésűek. */
  tompaIllesztes: boolean;
  /** A hőszigetelés fölötti réteg jó vízáteresztő (pl. kavics). */
  vizateresztoFedoreteg: boolean;
}

/**
 * Fordított tető korrekciója (HT-060, HT-061, 1. függ. 4.1.6, 28. o.). Általános esetben elhanyagolható (0).
 * Ha mindhárom feltétel teljesül, a korrekciót az MSZ EN ISO 6946 F melléklete szerint, p = 1,3 mm/nap mellett
 * kell számítani; a módszer a képletet nem adja meg, ezért ilyenkor részletes számítás szükséges (DONTESEK.md D-002).
 */
export function forditottTetoKorrekcio(b: ForditottTetoBemenet): number {
  if (b.egyreteguHoszigeteles && b.tompaIllesztes && b.vizateresztoFedoreteg) {
    const p = alapertek(ALAPERTEKEK_4, 'forditott_teto_p');
    throw new ReszletesModszerSzukseges(
      `Fordított tetőnél a csapadék hatását az MSZ EN ISO 6946 F melléklete szerint kell számítani (p = ${p} mm/nap); add meg a ΔU_ford értéket forrással.`,
      'HT-061',
    );
  }
  return 0;
}

/**
 * Korrigált hőátbocsátási tényező: U = U_0 + ΔU, ΔU = ΔU_légüreg + ΔU_rögz + ΔU_ford,
 * (4.10)–(4.11) egyenlet (HT-044, HT-045, 1. függ. 4.1.6, 26. o.).
 * A 3%-os elhanyagolási lehetőséget a program nem alkalmazza (DONTESEK.md D-102).
 */
export function korrigaltU(u0: number, korrekciok: { legureg?: number; rogz?: number; ford?: number }): number {
  if (!(u0 > 0)) throw new ErvenytelenBemenet(`Érvénytelen U_0: ${u0}`, 'HT-044');
  return u0 + (korrekciok.legureg ?? 0) + (korrekciok.rogz ?? 0) + (korrekciok.ford ?? 0);
}
