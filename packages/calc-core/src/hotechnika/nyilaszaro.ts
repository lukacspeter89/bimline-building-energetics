import { ErvenytelenBemenet, SzamitasiHiba } from '../hibak.js';
import { alapertek, sorKeres, szamMezo, type TablaHivatkozas } from '../normativ/index.js';
import { feluletiEllenallas } from './feluleti.js';

const ALAPERTEKEK_4: TablaHivatkozas = 'modszer/hotechnika#alapertekek_4';
const TABLA_4_3: TablaHivatkozas = 'modszer/hotechnika#tabla_4_3';
const TABLA_4_4: TablaHivatkozas = 'modszer/hotechnika#tabla_4_4';
const TABLA_4_5: TablaHivatkozas = 'modszer/hotechnika#tabla_4_5';

/** Felület és hőátbocsátási tényező párja [m², W/m²K]. */
export interface FeluletU {
  A: number;
  U: number;
}

/** Vonalmenti hőhíd: hossz és vonalmenti hőátbocsátási tényező [m, W/mK]. */
export interface VonalHohid {
  l: number;
  psi: number;
}

export interface EgyhejuNyilaszaro {
  /** Üvegezések (A_ü, U_ü). */
  uvegezes: readonly FeluletU[];
  /** Átlátszatlan panelek (A_p, U_p). */
  panel?: readonly FeluletU[];
  /** Keret (tok és szárny) a belső oldalról nézve (A_k, U_k). */
  keret: readonly FeluletU[];
  /** Keret–üvegezés csatlakozás (l_k,ü, ψ_k,ü). */
  keretUveg?: readonly VonalHohid[];
  /** Keret–panel csatlakozás (l_k,p, ψ_k,p). */
  keretPanel?: readonly VonalHohid[];
  /** Merevítőprofil–üvegezés csatlakozás (l_m,ü, ψ_m,ü). */
  merevitoUveg?: readonly VonalHohid[];
}

function ellenoriz(f: readonly FeluletU[], matrixId: string): void {
  for (const x of f) {
    if (!(x.A >= 0) || !(x.U >= 0)) throw new ErvenytelenBemenet('Érvénytelen felület vagy U-érték.', matrixId);
  }
}

/**
 * Egyhéjú nyílászáró (ablak, ajtó) átlagos hőátbocsátási tényezője, (4.16) egyenlet
 * (HT-072, 1. függ. 4.3.1, 29. o.):
 * U_ny,e = (ΣA_ü·U_ü + ΣA_p·U_p + ΣA_k·U_k + Σl_k,ü·ψ_k,ü + Σl_k,p·ψ_k,p + Σl_m,ü·ψ_m,ü) / (ΣA_ü + ΣA_p + ΣA_k)
 */
export function egyhejuNyilaszaroU(n: EgyhejuNyilaszaro): number {
  const feluletek = [...n.uvegezes, ...(n.panel ?? []), ...n.keret];
  ellenoriz(feluletek, 'HT-072');
  const aOssz = feluletek.reduce((s, x) => s + x.A, 0);
  if (!(aOssz > 0)) throw new ErvenytelenBemenet('A nyílászáró teljes felülete pozitív kell legyen.', 'HT-072');
  const vonalak = [...(n.keretUveg ?? []), ...(n.keretPanel ?? []), ...(n.merevitoUveg ?? [])];
  for (const v of vonalak) {
    if (!(v.l >= 0) || !Number.isFinite(v.psi)) throw new ErvenytelenBemenet('Érvénytelen vonalmenti hőhíd.', 'HT-072');
  }
  const szamlalo = feluletek.reduce((s, x) => s + x.A * x.U, 0) + vonalak.reduce((s, v) => s + v.l * v.psi, 0);
  return szamlalo / aOssz;
}

/**
 * Kéthéjú (átszellőztetés nélküli, kapcsolt) nyílászáró hőátbocsátási tényezője, (4.17) egyenlet
 * (HT-073, 1. függ. 4.3.2, 30. o.): U_ny,k = 1 / (1/U_ny,1 − R_si + R_l − R_se + 1/U_ny,2).
 * R_si és R_se a 4.1. táblázat vízszintes hőáramhoz tartozó értéke (függőleges nyílászáró).
 * @param rL a két héj közötti légréteg egyenértékű hővezetési ellenállása [m²K/W]
 */
export function kethejuNyilaszaroU(uNy1: number, uNy2: number, rL: number): number {
  if (!(uNy1 > 0) || !(uNy2 > 0) || !(rL >= 0)) {
    throw new ErvenytelenBemenet('Érvénytelen kéthéjú nyílászáró adat.', 'HT-073');
  }
  const { Rsi, Rse } = feluletiEllenallas({ irany: 'vizszintes' });
  return 1 / (1 / uNy1 - Rsi + rL - Rse + 1 / uNy2);
}

/** Effektív teljes hézagosság: b_eth = b_ha + b_hf + b_ho [mm], (4.19) egyenlet (HT-077, 1. függ. 4.3.3, 30. o.). */
export function effektivHezagossag(bHa: number, bHf: number, bHo: number): number {
  if (![bHa, bHf, bHo].every((x) => x >= 0)) throw new ErvenytelenBemenet('Érvénytelen hézagméret.', 'HT-077');
  return bHa + bHf + bHo;
}

export type LegateresztesiOsztaly = 1 | 2 | 3 | 4 | 5;

/**
 * Árnyékoló légáteresztési osztálya a 4.3. táblázat szerint (HT-078, 1. függ. 4.3.3, 30. o.).
 * Az 1–3. osztály elsőbbséget kap; a 3 < b_eth < 8 mm tartományt a táblázat nem fedi le, ekkor a hívónak
 * kell az osztályt megadnia (DONTESEK.md D-103).
 */
export function legateresztesiOsztaly(bHa: number, bHf: number, bHo: number): LegateresztesiOsztaly {
  const b = effektivHezagossag(bHa, bHf, bHo);
  const hatar = (osztaly: number): { min: number | null; max: number | null } => {
    const s = sorKeres(TABLA_4_3, (x) => x['osztaly'] === osztaly)['b_eth'] as { min: number | null; max: number | null };
    return { min: s.min, max: s.max };
  };
  for (const o of [1, 2, 3] as const) {
    const { min, max } = hatar(o);
    if (min !== null && b >= min && (max === null || b < max)) return o;
  }
  const max5 = hatar(5).max;
  if (max5 !== null && b <= max5 && (bHa + bHo === 0 || bHf + bHo === 0)) return 5;
  throw new SzamitasiHiba(
    `A ${b} mm effektív hézagosság a 4.3. táblázat alapján nem sorolható be egyértelműen; add meg az osztályt.`,
    'HT-078',
  );
}

/**
 * Többlet hővezetési ellenállás ΔR [m²K/W] ismert R_árny esetén a 4.4. táblázat szerint
 * (HT-079, 1. függ. 4.3.3, 31. o.): ΔR = a · R_árny + b.
 */
export function tobbletEllenallasIsmertRarny(osztaly: LegateresztesiOsztaly, rArny: number): number {
  if (!(rArny >= 0)) throw new ErvenytelenBemenet('Érvénytelen R_árny.', 'HT-079');
  const sor = sorKeres(TABLA_4_4, (s) => s['osztaly'] === osztaly);
  return szamMezo(sor, 'a', TABLA_4_4) * rArny + szamMezo(sor, 'b', TABLA_4_4);
}

/** A 4.5. táblázat árnyékolótípusai, a táblázat szövegével azonos sorrendben. */
export const ARNYEKOLO_TIPUSOK_4_5 = [
  'Alumínium redőny',
  'Fa vagy műanyag redőny habkitöltés nélküli lamellákkal',
  'Redőny habkitöltéses lamellákkal',
  '25-30 mm-es fa lamellák',
] as const;
export type ArnyekoloTipus45 = (typeof ARNYEKOLO_TIPUSOK_4_5)[number];

/**
 * Közelítő többlet hővezetési ellenállás ΔR [m²K/W], ha R_árny nem ismert, a 4.5. táblázat szerint
 * (HT-080, 1. függ. 4.3.3, 31. o.).
 */
export function tobbletEllenallasKozelito(tipus: ArnyekoloTipus45, osztaly: LegateresztesiOsztaly): number {
  const sor = sorKeres(TABLA_4_5, (s) => s['tipus'] === tipus);
  const oszlop = osztaly <= 2 ? 'dR_1_2' : osztaly === 3 ? 'dR_3' : 'dR_4_5';
  return szamMezo(sor, oszlop, TABLA_4_5);
}

/**
 * Társított árnyékolóval ellátott nyílászáró hőátbocsátási tényezője a fűtési energiaigény számításához,
 * (4.18) egyenlet (HT-075, 1. függ. 4.3.3, 30. o.): U_Ny,t = 0,7·U_Ny + 0,3 · 1/(1/U_Ny + ΔR).
 * Az elemi követelmény ellenőrzésénél ez NEM használható (HT-074; 9/2023 ÉKM 1. melléklet 1.1. (**)).
 */
export function arnyekolosNyilaszaroU(uNy: number, deltaR: number): number {
  if (!(uNy > 0) || !(deltaR >= 0)) throw new ErvenytelenBemenet('Érvénytelen U_Ny vagy ΔR.', 'HT-075');
  const wU = alapertek(ALAPERTEKEK_4, 'U_ny_t_suly_U');
  const wA = alapertek(ALAPERTEKEK_4, 'U_ny_t_suly_arnyekolo');
  return wU * uNy + wA * (1 / (1 / uNy + deltaR));
}
