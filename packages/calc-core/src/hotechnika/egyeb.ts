import { ErvenytelenBemenet, NormativAdatHiba } from '../hibak.js';
import { szamMezo, tabla, type TablaHivatkozas } from '../normativ/index.js';
import type { FeluletU } from './nyilaszaro.js';

const TABLA_F2_4_6: TablaHivatkozas = 'modszer/nyilaszarok#tabla_f2_4_6';

/** A 2. függ. 4.6. táblázat kiegészítő hőszigetelés-oszlopai (a mértékegység a forrásban hiányzik, valószínűleg cm). */
export type PanelKiegeszitoHoszigeteles = 0 | 4 | 8 | 12 | 16 | 20;

/**
 * 1992 előtt épült házgyári panelos homlokzati fal átlagos hőátbocsátási tényezője a 2. függ. 4.6. táblázatából
 * (HT-062, HT-063; 1. függ. 4.1.7, 28. o.; 2. függ. 4.3, 28–30. o.). Az érték az elemen belüli hőhidakat
 * tartalmazza, a csatlakozási hőhidakat nem.
 * @param gyartasiIdo a táblázat „gyártási idő” cellája szó szerint, pl. "1971-1983"
 */
export function panelosFalU(hazgyar: string, gyartasiIdo: string, kiegeszito: PanelKiegeszitoHoszigeteles): number {
  const talalat = tabla(TABLA_F2_4_6).sorok.filter(
    (s) => s['hazgyar'] === hazgyar && (s['gyartasi_ido'] as { eredeti?: string } | undefined)?.eredeti === gyartasiIdo,
  );
  if (talalat.length !== 1) {
    throw new NormativAdatHiba(
      `A panelos táblázatban ${talalat.length} sor felel meg: ${hazgyar}, ${gyartasiIdo}.`,
      'HT-062',
    );
  }
  return szamMezo(talalat[0]!, `U_${kiegeszito}`, TABLA_F2_4_6);
}

/**
 * Függönyfal hőátbocsátási tényezője az elemek felületarányos átlagaként: U_FF = Σ(U·A) / ΣA,
 * (4.14) egyenlet (HT-067, 1. függ. 4.2, 28. o.). Az elemek U-ja a (4.15) helyett kézzel adható meg,
 * forrással (DONTESEK.md D-104).
 */
export function fuggonyfalU(elemek: readonly FeluletU[]): number {
  const aOssz = elemek.reduce((s, e) => s + e.A, 0);
  if (elemek.some((e) => !(e.A >= 0) || !(e.U >= 0)) || !(aOssz > 0)) {
    throw new ErvenytelenBemenet('Érvénytelen függönyfal-elem.', 'HT-067');
  }
  return elemek.reduce((s, e) => s + e.U * e.A, 0) / aOssz;
}
