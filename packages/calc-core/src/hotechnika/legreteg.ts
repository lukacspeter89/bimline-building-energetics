import { ErvenytelenBemenet, ReszletesModszerSzukseges } from '../hibak.js';
import { linearisInterpolacio } from '../kozos/interpolacio.js';
import { alapertek, szamMezo, tabla, type TablaHivatkozas } from '../normativ/index.js';
import type { HoaramIrany } from './feluleti.js';

const TABLA_4_2: TablaHivatkozas = 'modszer/hotechnika#tabla_4_2';
const ALAPERTEKEK_4: TablaHivatkozas = 'modszer/hotechnika#alapertekek_4';

export interface LegretegGeometria {
  /** A légréteg vastagsága [m]. */
  d: number;
  /** A légréteget határoló felületek emissziós tényezője [-]. */
  emisszio: number;
  /** A légréteg másik két irányú mérete [m] (a kisebbik számít). */
  szelesseg: number;
  magassag: number;
  /** A légréteg kapcsolatban van-e a belső környezettel. */
  belsoKornyezettelKapcsolatban: boolean;
}

/**
 * Az egyszerűsített légréteg-módszer alkalmazhatósága (HT-017 … HT-021, 1. függ. 4.1.3 a)–b), 24. o.).
 * Ha bármelyik feltétel nem teljesül, a részletes módszer (MSZ EN ISO 6946 D melléklet) kötelező.
 */
export function legretegEgyszerusitettEllenorzes(g: LegretegGeometria): void {
  if (!(g.d >= 0) || !(g.szelesseg > 0) || !(g.magassag > 0)) {
    throw new ErvenytelenBemenet('A légréteg méretei pozitív számok kell legyenek.', 'HT-020');
  }
  const dMax = alapertek(ALAPERTEKEK_4, 'legreteg_max_vastagsag');
  if (g.d > dMax) {
    throw new ReszletesModszerSzukseges(
      `${dMax} m-nél vastagabb légréteg a hőátbocsátási tényezőben nem vehető figyelembe; a hőáramokat hőegyensúly alapján kell számítani.`,
      'HT-018',
    );
  }
  if (g.emisszio < alapertek(ALAPERTEKEK_4, 'legreteg_min_emisszio')) {
    throw new ReszletesModszerSzukseges('A légréteget határoló felületek emissziós tényezője kisebb 0,8-nál.', 'HT-019');
  }
  const arany = alapertek(ALAPERTEKEK_4, 'legreteg_max_vastagsag_arany');
  if (g.d > arany * Math.min(g.szelesseg, g.magassag)) {
    throw new ReszletesModszerSzukseges(
      'A légréteg vastagsága nagyobb, mint a másik két irányú méret bármelyikének 0,1-szerese.',
      'HT-020',
    );
  }
  if (g.belsoKornyezettelKapcsolatban) {
    throw new ReszletesModszerSzukseges('A légréteg kapcsolatban van a belső környezettel.', 'HT-021');
  }
}

/**
 * Zárt, nagy emissziós tényezőjű felületekkel határolt légréteg hővezetési ellenállása [m²K/W],
 * közbenső vastagságnál lineáris interpolációval (HT-023, 1. függ. 4.2. táblázat, 25. o.).
 * @param d a légréteg vastagsága [m]
 */
export function zartLegretegEllenallas(d: number, irany: HoaramIrany): number {
  if (!(d >= 0)) throw new ErvenytelenBemenet(`Érvénytelen légréteg-vastagság: ${d}`, 'HT-023');
  const dMax = alapertek(ALAPERTEKEK_4, 'legreteg_max_vastagsag');
  if (d > dMax) {
    throw new ReszletesModszerSzukseges(
      `${dMax} m-nél vastagabb légréteg a hőátbocsátási tényezőben nem vehető figyelembe.`,
      'HT-018',
    );
  }
  const pontok = tabla(TABLA_4_2).sorok.map(
    (s) => [szamMezo(s, 'd_mm', TABLA_4_2), szamMezo(s, irany, TABLA_4_2)] as const,
  );
  return linearisInterpolacio(pontok, d * 1000);
}

export type LegretegSzellozes = 'zart' | 'kismerteku' | 'intenziv';

/**
 * A légréteg kiszellőztetésének mértéke a nyílások fajlagos területe alapján (HT-024, HT-025, HT-027).
 * @param aSzell a nyílások területe [mm²] 1 m alapélre (függőleges réteg) vagy 1 m² felületre (vízszintes réteg)
 */
export function legretegSzellozes(aSzell: number): LegretegSzellozes {
  if (!(aSzell >= 0)) throw new ErvenytelenBemenet(`Érvénytelen nyílásterület: ${aSzell}`, 'HT-024');
  if (aSzell <= alapertek(ALAPERTEKEK_4, 'A_szell_zart_max')) return 'zart';
  if (aSzell < alapertek(ALAPERTEKEK_4, 'A_szell_intenziv_min')) return 'kismerteku';
  return 'intenziv';
}

/**
 * Kismértékben kiszellőztetett légréteget tartalmazó szerkezet eredő hővezetési ellenállása,
 * (4.4) egyenlet (HT-026, 1. függ. 4.1.3, 25. o.):
 * R_tot = (1500 − A_szell)/1000 · R_tot,zárt + (A_szell − 500)/1000 · R_tot,szell
 * @param aSzell a nyílások fajlagos területe [mm²/m, ill. mm²/m²]; a (4.4) képlet állandói mm²-ben értendők
 */
export function kismertekbenSzellozottRtot(aSzell: number, rTotZart: number, rTotSzell: number): number {
  if (legretegSzellozes(aSzell) !== 'kismerteku') {
    throw new ErvenytelenBemenet('A (4.4) képlet csak 500 < A_szell < 1500 mm² esetén alkalmazható.', 'HT-025');
  }
  const also = alapertek(ALAPERTEKEK_4, 'A_szell_zart_max');
  const felso = alapertek(ALAPERTEKEK_4, 'A_szell_intenziv_min');
  const tartomany = felso - also;
  return ((felso - aSzell) / tartomany) * rTotZart + ((aSzell - also) / tartomany) * rTotSzell;
}
