/**
 * @bimline/calc-core – épületenergetikai számítási mag.
 * Normatív alap: 9/2023. (V. 25.) ÉKM rendelet és a 7. § (1) a) szerinti számítási módszer;
 * 176/2008. (VI. 30.) Korm. rendelet. Minden függvény a docs/KOVETELMENYMATRIX.md egy-egy sorát valósítja meg.
 */

/** A megvalósított számítási módszer változata (kormany.hu közzététel dátuma) – DONTESEK.md D-004. */
export const MODSZER_VERZIO = '2023-07-27';

export * from './hibak.js';
export * from './normativ/index.js';
export * from './kozos/interpolacio.js';
export * from './hotechnika/feluleti.js';
export * from './hotechnika/legreteg.js';
export * from './hotechnika/retegrend.js';
export * from './hotechnika/korrekcio.js';
export * from './hotechnika/nyilaszaro.js';
export * from './hotechnika/talaj.js';
export * from './hotechnika/egyeb.js';
export * from './kovetelmeny/index.js';
export * from './netto/eghajlat.js';
export * from './netto/transzmisszio.js';
export * from './netto/szellozes.js';
export * from './netto/nyereseg.js';
export * from './netto/merleg.js';
export * from './rendszer/kozos.js';
export * from './rendszer/futes.js';
export * from './rendszer/hmv.js';
export * from './rendszer/indikatorok.js';
