import { ErvenytelenBemenet, ReszletesModszerSzukseges } from '../hibak.js';
import { alapertek, sorKeres, szamMezo, type TablaHivatkozas } from '../normativ/index.js';
import { feluletiEllenallas } from './feluleti.js';

const TABLA_4_6: TablaHivatkozas = 'modszer/hotechnika#tabla_4_6';
const ALAPERTEKEK_4: TablaHivatkozas = 'modszer/hotechnika#alapertekek_4';

export type TalajTipus = 1 | 2 | 3;

/**
 * A talaj hővezetési tényezője a 4.6. táblázatból [W/mK]; ismeretlen talajnál a 2. típus
 * (HT-083, HT-084, 1. függ. 4.4.1, 4.6. táblázat, 31–32. o.).
 */
export function talajLambda(tipus?: TalajTipus): number {
  const t = tipus ?? alapertek(ALAPERTEKEK_4, 'talaj_alapertelmezett_tipus');
  return szamMezo(sorKeres(TABLA_4_6, (s) => s['talajtipus'] === t), 'lambda_talaj', TABLA_4_6);
}

/**
 * A padló terepszinthez mért mélysége a számításban: ±0,5 m szintkülönbségen belül z = 0 (HT-096, 4.4.2, 33. o.).
 * @param mélység a padló terepszint alatti mélysége [m] (változó mélységnél az átlag, HT-095)
 */
export function szamitasiMelyseg(melyseg: number): number {
  if (!Number.isFinite(melyseg)) throw new ErvenytelenBemenet('Érvénytelen mélység.', 'HT-096');
  return Math.abs(melyseg) <= alapertek(ALAPERTEKEK_4, 'terepszint_kozeli_tures') ? 0 : melyseg;
}

/**
 * A talajon fekvő padló karakterisztikus mérete: B = A / (0,5·P), (4.20) egyenlet (HT-088, 4.4.2, 32. o.).
 * @param A a kondicionált tér padlójának területe [m²]
 * @param P a padló kitett kerülete, a szomszédos fűtetlen tér felé eső csatlakozásokkal együtt [m]
 */
export function karakterisztikusMeret(A: number, P: number): number {
  if (!(A > 0) || !(P > 0)) throw new ErvenytelenBemenet('A padló területe és kitett kerülete pozitív kell legyen.', 'HT-088');
  return A / (alapertek(ALAPERTEKEK_4, 'B_karakterisztikus_kerulet_szorzo') * P);
}

/**
 * A padló egyenértékű vastagsága: d_p = d_f + λ_talaj · (R_si + R_p + R_se), (4.21) egyenlet (HT-089, 4.4.2, 32. o.).
 * R_si a 4.1. táblázat lefelé irányú értéke, R_se = 0,04 (DONTESEK.md D-101). Az R_p-be a szemcsés ágyazat
 * ellenállása nem számítható (HT-090).
 * @param df a csatlakozó külső falak teljes vastagsága [m]
 * @param rP a padlószerkezet hővezetési ellenállása [m²K/W]
 */
export function padloEgyenertekuVastagsag(df: number, lambdaTalaj: number, rP: number): number {
  if (!(df >= 0) || !(lambdaTalaj > 0) || !(rP >= 0)) {
    throw new ErvenytelenBemenet('Érvénytelen d_f, λ_talaj vagy R_p.', 'HT-089');
  }
  const { Rsi, Rse } = feluletiEllenallas({ irany: 'lefele' });
  return df + lambdaTalaj * (Rsi + rP + Rse);
}

export interface TalajonFekvoPadloBemenet {
  /** A kondicionált tér padlójának területe [m²]. */
  A: number;
  /** Kitett kerület [m]. */
  P: number;
  /** A csatlakozó külső falak teljes vastagsága [m]. */
  df: number;
  /** A padlószerkezet hővezetési ellenállása [m²K/W]. */
  rP: number;
  /** A padló terepszint alatti mélysége [m]; ±0,5 m-en belül 0. */
  melyseg: number;
  talajTipus?: TalajTipus;
}

export interface TalajonFekvoPadloEredmeny {
  B: number;
  dp: number;
  z: number;
  lambdaTalaj: number;
  /** A talaj hatását is tartalmazó egyenértékű hőátbocsátási tényező [W/m²K]. */
  U: number;
  keplet: '4.22' | '4.23';
}

/**
 * Talajon fekvő padló egyenértékű hőátbocsátási tényezője (HT-088 … HT-096, 1. függ. 4.4.2, 32–33. o.):
 * - ha (d_p + 0,5z) < B: U = 2λ/(πB + d_p + 0,5z) · ln(πB/(d_p + 0,5z) + 1), (4.22);
 * - egyébként: U = λ / (0,457·B + d_p + 0,5z), (4.23).
 * A B a teljes, összefüggő padlóra számítandó, nem helyiségenként (ELTERESEK_WINWATT.md E-02).
 */
export function talajonFekvoPadlo(b: TalajonFekvoPadloBemenet): TalajonFekvoPadloEredmeny {
  const lambdaTalaj = talajLambda(b.talajTipus);
  const B = karakterisztikusMeret(b.A, b.P);
  const dp = padloEgyenertekuVastagsag(b.df, lambdaTalaj, b.rP);
  const z = szamitasiMelyseg(b.melyseg);
  if (z < 0) throw new ErvenytelenBemenet('A padló mélysége a terepszint alatt pozitív számként adandó meg.', 'HT-095');
  const dz = dp + 0.5 * z;
  if (dz < B) {
    const U = ((2 * lambdaTalaj) / (Math.PI * B + dz)) * Math.log((Math.PI * B) / dz + 1);
    return { B, dp, z, lambdaTalaj, U, keplet: '4.22' };
  }
  const U = lambdaTalaj / (alapertek(ALAPERTEKEK_4, 'U_Tp_jol_szigetelt_B_szorzo') * B + dz);
  return { B, dp, z, lambdaTalaj, U, keplet: '4.23' };
}

/** Talajtól elemelt (búvóteres) padló: a módszer az MSZ EN ISO 13370-re utal (HT-097, DONTESEK.md D-002). */
export function elemeltPadlo(): never {
  throw new ReszletesModszerSzukseges(
    'Talajtól elemelt (búvóteres) padló hőveszteségét az MSZ EN ISO 13370 szerint kell számítani; add meg az egyenértékű U-t forrással.',
    'HT-097',
  );
}

export interface TerepszintFelettiPadloBemenet {
  /** A padlószerkezet területe [m²]. */
  A: number;
  /** Kitett kerület [m]. */
  P: number;
  /** A padlószerkezet hőátbocsátási tényezője a felületi ellenállásokkal [W/m²K]. */
  Up: number;
  /** A lábazati fal hőátbocsátási tényezője a felületi ellenállásokkal [W/m²K]. */
  Ulf: number;
  /** A lábazati fal teljes vastagsága [m]. */
  dlf: number;
  /** A padlószerkezet felső szintjének magassága a külső terepszint felett [m]. */
  m: number;
  talajTipus?: TalajTipus;
}

/**
 * Terepszint feletti padlószerkezet egyenértékű U-ja (HT-098 … HT-101, 1. függ. 4.4.3, 33. o.):
 * U_T,p = 1 / (1/U_p + 1/(U_talaj + U_T,lf)), (4.24);
 * U_talaj = 2λ/(πB + d_lf + m) · ln(πB/(d_lf + m) + 1), (4.25); U_T,lf = 2·m·U_lf / B, (4.26).
 * Alkalmazható, ha A ≤ 250 m² és m > 0,5 m (DONTESEK.md D-105); egyébként MSZ EN ISO 13370.
 */
export function terepszintFelettiPadlo(b: TerepszintFelettiPadloBemenet): number {
  if (!(b.Up > 0) || !(b.Ulf > 0) || !(b.dlf >= 0)) throw new ErvenytelenBemenet('Érvénytelen bemenet.', 'HT-099');
  if (b.A > alapertek(ALAPERTEKEK_4, 'terepszint_feletti_padlo_max_terulet') ||
      !(b.m > alapertek(ALAPERTEKEK_4, 'terepszint_feletti_padlo_min_m'))) {
    throw new ReszletesModszerSzukseges(
      'A (4.24) összefüggés csak 250 m²-nél nem nagyobb padlóterületre és 0,5 m-nél nagyobb m-re alkalmazható; egyébként MSZ EN ISO 13370.',
      'HT-098',
    );
  }
  const lambda = talajLambda(b.talajTipus);
  const B = karakterisztikusMeret(b.A, b.P);
  const uTalaj = ((2 * lambda) / (Math.PI * B + b.dlf + b.m)) * Math.log((Math.PI * B) / (b.dlf + b.m) + 1);
  const uTlf = (2 * b.m * b.Ulf) / B;
  return 1 / (1 / b.Up + 1 / (uTalaj + uTlf));
}

export interface FutottPinceFalBemenet {
  /** A pincepadló terepszint alatti mélysége [m]. */
  z: number;
  /** A pincepadló egyenértékű vastagsága [m] (4.21). */
  dp: number;
  /** A pincefal hővezetési ellenállása valamennyi réteggel [m²K/W]. */
  rPf: number;
  talajTipus?: TalajTipus;
}

/**
 * Fűtött pince talajjal érintkező falának egyenértékű U-ja (HT-103 … HT-105, 1. függ. 4.4.4, 33–34. o.):
 * d_pf = λ(R_si + R_pf + R_se), (4.27); U_T,pf = 2λ/(πz) · (1 + 0,5·d_p/(d_p + z)) · ln(z/d_pf + 1), (4.28);
 * ha d_pf < d_p, a (4.28)-ban d_p helyett d_pf (HT-105). R_si és R_se a vízszintes hőáramhoz tartozó érték.
 */
export function futottPinceFal(b: FutottPinceFalBemenet): number {
  if (!(b.z > 0) || !(b.dp > 0) || !(b.rPf >= 0)) throw new ErvenytelenBemenet('Érvénytelen bemenet.', 'HT-104');
  const lambda = talajLambda(b.talajTipus);
  const { Rsi, Rse } = feluletiEllenallas({ irany: 'vizszintes' });
  const dpf = lambda * (Rsi + b.rPf + Rse);
  const dp = dpf < b.dp ? dpf : b.dp;
  return ((2 * lambda) / (Math.PI * b.z)) * (1 + (0.5 * dp) / (dp + b.z)) * Math.log(b.z / dpf + 1);
}

export interface PeremHoszigetelesBemenet {
  elhelyezes: 'vizszintes' | 'fuggoleges';
  /** Vízszintesnél a szélesség a csatlakozó falszerkezet szélétől, függőlegesnél a mélység a terepszint alatt [m]. */
  D: number;
  /** A perem hőszigetelés hővezetési ellenállása [m²K/W]. */
  rPsz: number;
  /** A perem hőszigetelés vastagsága [m]. */
  dPsz: number;
  /** A padló egyenértékű vastagsága [m] (4.21). */
  dp: number;
  talajTipus?: TalajTipus;
}

/**
 * Perem hőszigetelés vonalmenti hőátbocsátási tényezője [W/mK] (negatív) (HT-108 … HT-113, 1. függ. 4.4.5, 34. o.):
 * R' = R_psz − d_psz/λ, (4.30); d' = R'·λ, (4.29);
 * vízszintes: Ψ = −λ/π · [ln(D/d_p + 1) − ln(D/(d_p + d') + 1)], (4.31);
 * függőleges: Ψ = −λ/π · [ln(2D/d_p + 1) − ln(2D/(d_p + d') + 1)], (4.32).
 */
export function peremHoszigetelesPsi(b: PeremHoszigetelesBemenet): number {
  if (!(b.D > 0) || !(b.rPsz >= 0) || !(b.dPsz >= 0) || !(b.dp > 0)) {
    throw new ErvenytelenBemenet('Érvénytelen perem hőszigetelés adat.', 'HT-112');
  }
  const lambda = talajLambda(b.talajTipus);
  const rVesszo = b.rPsz - b.dPsz / lambda;
  const dVesszo = rVesszo * lambda;
  const x = b.elhelyezes === 'vizszintes' ? b.D : 2 * b.D;
  return (-lambda / Math.PI) * (Math.log(x / b.dp + 1) - Math.log(x / (b.dp + dVesszo) + 1));
}

/** Több perem hőszigetelésnél a legnagyobb csökkenést adó (legkisebb Ψ) vehető figyelembe (HT-109). */
export function mertekadoPeremPsi(psik: readonly number[]): number {
  if (psik.length === 0) throw new ErvenytelenBemenet('Nincs perem hőszigetelés.', 'HT-109');
  return Math.min(...psik);
}

/** A perem hőszigetelés hatása a padló U-jában: U_T,p = U_T,p,0 + P_psz·Ψ_psz / A, (4.33) (HT-114, 34. o.). */
export function padloUPeremmel(uTp0: number, pPsz: number, psiPsz: number, A: number): number {
  if (!(uTp0 > 0) || !(pPsz >= 0) || !(A > 0)) throw new ErvenytelenBemenet('Érvénytelen bemenet.', 'HT-114');
  return uTp0 + (pPsz * psiPsz) / A;
}

/**
 * Részlegesen alápincézett épület megengedett közelítése: teljes alápincézés, a mélység a tényleges
 * mélység fele (HT-106, 1. függ. 4.4.4, 34. o.).
 */
export function reszlegesenAlapincezettMelyseg(tenylegesMelyseg: number): number {
  if (!(tenylegesMelyseg > 0)) throw new ErvenytelenBemenet('Érvénytelen mélység.', 'HT-106');
  return alapertek(ALAPERTEKEK_4, 'reszleges_pince_melyseg_szorzo') * tenylegesMelyseg;
}
