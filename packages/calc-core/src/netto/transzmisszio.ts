import { ErvenytelenBemenet, ReszletesModszerSzukseges } from '../hibak.js';
import { alapertek, alapertekLista, sorKeres, szamMezo, tabla, type TablaHivatkozas } from '../normativ/index.js';
import type { Honap } from './eghajlat.js';

const TABLA_6_1: TablaHivatkozas = 'modszer/netto_energiaigeny#tabla_6_1';
const TABLA_6_2: TablaHivatkozas = 'modszer/netto_energiaigeny#tabla_6_2';
const TABLA_6_3: TablaHivatkozas = 'modszer/netto_energiaigeny#tabla_6_3';
const TABLA_6_4: TablaHivatkozas = 'modszer/netto_energiaigeny#tabla_6_4';
const ALAP_6: TablaHivatkozas = 'modszer/netto_energiaigeny#alapertekek_6_fejezet';

/** Felület, hőátbocsátási tényező, vonal- és pontszerű hőhidak a (6.1)-hez. */
export interface DirektTranszmisszioBemenet {
  elemek: readonly { A: number; U: number }[];
  vonalak?: readonly { l: number; psi: number }[];
  pontok?: readonly { chi: number }[];
}

/**
 * Direkt transzmissziós hőátviteli tényező [W/K] külső térrel határos szerkezetekre, részletes hőhíd-kezeléssel:
 * H_tr,D = Σ A·U + Σ l·Ψ + Σ χ, (6.1) (TR-001, 1. függ. 6.1.1, 38. o.). Az elem átlagos U-jában már
 * figyelembe vett hőhidakat itt nem szabad újra megadni (TR-003).
 */
export function direktTranszmisszio(b: DirektTranszmisszioBemenet): number {
  for (const e of b.elemek) {
    if (!(e.A >= 0) || !(e.U >= 0)) throw new ErvenytelenBemenet('Érvénytelen felület vagy U.', 'TR-001');
  }
  return (
    b.elemek.reduce((s, e) => s + e.A * e.U, 0) +
    (b.vonalak ?? []).reduce((s, v) => s + v.l * v.psi, 0) +
    (b.pontok ?? []).reduce((s, p) => s + p.chi, 0)
  );
}

/** A 6.1. táblázat szerkezetcsoportjai (a `szerkezet` cella szövege). */
export type HohidSzerkezet =
  | 'Külső falak'
  | 'Lapostetők'
  | 'Beépített tetőteret határoló szerkezetek'
  | 'Padlásfödémek'
  | 'Árkádfödémek'
  | 'Pincefödémek'
  | 'Fűtött és fűtetlen terek közötti falak, fűtött pincetereket határoló, külső oldalon hőszigetelt falak';

export type Hohidassag = 'gyengén hőhidas' | 'közepesen hőhidas' | 'erősen hőhidas';

export interface ZetaBemenet {
  szerkezet: HohidSzerkezet;
  /** Külső falnál: „külső oldali, vagy szerkezeten belüli megszakítatlan hőszigeteléssel” / „egyéb külső falak”;
   *  pincefödémnél: „szerkezeten belüli hőszigeteléssel” / „alsó oldali hőszigeteléssel”. */
  alcsoport?: string;
  hohidassag?: Hohidassag;
  /** Belső oldali hőszigetelés – ilyenkor a ζ nem használható (TR-011). */
  belsoOldaliHoszigeteles?: boolean;
}

/**
 * A csatlakozási hőhidak hatását kifejező korrekciós tényező ζ a 6.1. táblázatból (TR-008, TR-011;
 * 1. függ. 6.1.2, 39–40. o.).
 */
export function zeta(b: ZetaBemenet): number {
  if (b.belsoOldaliHoszigeteles) {
    throw new ReszletesModszerSzukseges(
      'Belső oldali hőszigetelésnél a ζ korrekciós tényező nem használható; részletes hőhídmodell kell.',
      'TR-011',
    );
  }
  const sor = sorKeres(
    TABLA_6_1,
    (s) =>
      s['szerkezet'] === b.szerkezet &&
      (s['alcsoport'] === null || s['alcsoport'] === b.alcsoport) &&
      (s['besorolas'] === null || s['besorolas'] === b.hohidassag),
  );
  return szamMezo(sor, 'zeta', TABLA_6_1);
}

/** Hőhíddal korrigált hőátbocsátási tényező: U_R = U · (1 + ζ), (6.3) (TR-007, 1. függ. 6.1.2, 39. o.). */
export function hohiddalKorrigaltU(U: number, z: number): number {
  if (!(U >= 0) || !(z >= 0)) throw new ErvenytelenBemenet('Érvénytelen U vagy ζ.', 'TR-007');
  return U * (1 + z);
}

/**
 * Tájékoztató hőhidasság-besorolás a hőhidak fajlagos hossza alapján (TR-009, 6.2. táblázat, 40. o.).
 * A határérték a közepes sávba esik (a táblázat „0,8 - 1,0” jelölése szerint).
 */
export function hohidassagBesorolas(
  szerkezet: 'Külső falak' | 'Lapostetők' | 'Beépített tetőtereket határoló szerkezetek',
  fajlagosHossz: number,
): Hohidassag {
  if (!(fajlagosHossz >= 0)) throw new ErvenytelenBemenet('Érvénytelen fajlagos hossz.', 'TR-009');
  const sorok = tabla(TABLA_6_2).sorok.filter((s) => s['szerkezet'] === szerkezet);
  const kozepes = sorok.find((s) => s['besorolas'] === 'közepesen hőhidas')!;
  const min = szamMezo(kozepes, 'min', TABLA_6_2);
  const max = szamMezo(kozepes, 'max', TABLA_6_2);
  if (fajlagosHossz < min) return 'gyengén hőhidas';
  if (fajlagosHossz <= max) return 'közepesen hőhidas';
  return 'erősen hőhidas';
}

/** A 6.3. táblázat sorai (a `szerkezet` cella szövege). */
export type FutetlenTerTipus =
  | 'Padlástérrel határos födém vagy fal'
  | 'Zárt, fűtetlen pincével határos födém vagy fal'
  | 'Zárt, fűtetlen mélygarázzsal határos födém vagy fal'
  | 'Zárt, fűtetlen garázzsal határos födém vagy fal'
  | 'Fűtetlen/ hűtés nélküli helyiséggel határos födém vagy fal'
  | 'Fűtetlen, külső homlokzattal rendelkező lépcsőházzal határos fal'
  | 'Naptérrel vagy fűtetlen átriummal határos fal, ha az üvegezett szerkezet';

export type NapterUvegezes = 'egyrétegű' | 'kétrétegű' | 'hőszigetelő üvegezésű';

/**
 * A gyengén kapcsolt fűtetlen tér miatti b módosító tényező az adott hónapra, a 6.3. táblázatból
 * (TR-013, TR-015, TR-016; 1. függ. 6.1.3, 40–41. o.): októbertől áprilisig b_tél, májustól szeptemberig b_nyár,
 * fűtésnél és hűtésnél is. Csak 18–22 °C fűtési és 24–28 °C hűtési parancsolt hőmérsékletnél alkalmazható.
 */
export function bTenyezo(
  tipus: FutetlenTerTipus,
  m: Honap,
  thetaIF: number,
  thetaIH: number,
  uvegezes?: NapterUvegezes,
): number {
  if (
    thetaIF < alapertek(ALAP_6, 'b_egyszerusitett_theta_i_F_min') ||
    thetaIF > alapertek(ALAP_6, 'b_egyszerusitett_theta_i_F_max') ||
    thetaIH < alapertek(ALAP_6, 'b_egyszerusitett_theta_i_H_min') ||
    thetaIH > alapertek(ALAP_6, 'b_egyszerusitett_theta_i_H_max')
  ) {
    throw new ReszletesModszerSzukseges(
      'A 6.3. táblázat b értékei csak 18–22 °C fűtési és 24–28 °C hűtési parancsolt hőmérsékletnél alkalmazhatók; egyébként MSZ EN ISO 13789.',
      'TR-016',
    );
  }
  const sor = sorKeres(TABLA_6_3, (s) => s['szerkezet'] === tipus && (s['uvegezes'] ?? undefined) === uvegezes);
  const tel = alapertekLista(ALAP_6, 'b_tel_honapok');
  return szamMezo(sor, tel.includes(m) ? 'b_tel' : 'b_nyar', TABLA_6_3);
}

/** Nem kondicionált térrel határos szerkezetek hőátviteli tényezője: H_tr,x = b · H_tr,ix, (6.4) (TR-013). */
export function futetlenTerHatarolo(b: number, hTrIx: number): number {
  if (!(b >= 0) || !(hTrIx >= 0)) throw new ErvenytelenBemenet('Érvénytelen b vagy H_tr,ix.', 'TR-013');
  return b * hTrIx;
}

export interface PsiPfBemenet {
  /** A külső falat alkotó vakolatlan falazat egyenértékű hővezetési tényezője [W/mK]. */
  lambdaFalazat: number;
  kulsoFalKialakitasa: 'külső oldali, megszakítatlan hőszigeteléssel' | 'hőszigetelés nélkül';
  labazatiFal:
    | 'Lábazati fal hőszigeteletlen'
    | 'Lábazati fal csak a terepszintig hőszigetelt'
    | 'Lábazati fal a terepszint alatt 0,5 m-ig hőszigetelt';
  /** A padlóban lévő legnagyobb hőszigetelő réteg ellenállása [m²K/W]; „hőszigetelt”, ha ≥ 1,25 (TR-025). */
  padloHoszigetelesR: number;
}

/**
 * Padló–fal csatlakozás vonalmenti hőátbocsátási tényezője Ψ_p,f [W/mK] a 6.4. táblázatból
 * (TR-024, TR-025; 1. függ. 6.1.4.3 b), 42. o.). A λ-sávok határán a táblázat nem egyértelmű; a program a
 * 0,15 és 0,45 W/mK értéket a középső sávba sorolja.
 */
export function psiPf(b: PsiPfBemenet): number {
  if (!(b.lambdaFalazat > 0) || !(b.padloHoszigetelesR >= 0)) {
    throw new ErvenytelenBemenet('Érvénytelen λ vagy R.', 'TR-024');
  }
  const padlo =
    b.padloHoszigetelesR >= alapertek(ALAP_6, 'psi_pf_hoszigetelt_R_min') ? 'Padló hőszigetelt' : 'Padló hőszigeteletlen';
  const sor = sorKeres(TABLA_6_4, (s) => {
    const min = s['lambda_min'] as number | null;
    const max = s['lambda_max'] as number | null;
    const sav =
      min !== null && max !== null
        ? b.lambdaFalazat >= min && b.lambdaFalazat <= max
        : min !== null
          ? b.lambdaFalazat > min
          : b.lambdaFalazat < (max as number);
    return sav && s['kulso_fal_kialakitasa'] === b.kulsoFalKialakitasa && s['labazati_fal'] === b.labazatiFal && s['padlo'] === padlo;
  });
  return szamMezo(sor, 'psi_pf', TABLA_6_4);
}

/**
 * Terepszint közelében vagy felett fekvő padló hőátviteli tényezője [W/K]: H = A·U_T,p + P·Ψ_p,f, (6.5) (TR-019).
 * Fűtött pincénél: H = A·U_T,p + z·P·U_T,pf + P·Ψ_p,f, (6.6) (TR-021), z = a pincepadló mélysége.
 */
export function talajHoatvitel(A: number, uTp: number, P: number, psi: number, pince?: { z: number; uTpf: number }): number {
  if (!(A >= 0) || !(uTp >= 0) || !(P >= 0)) throw new ErvenytelenBemenet('Érvénytelen bemenet.', 'TR-019');
  return A * uTp + (pince ? pince.z * P * pince.uTpf : 0) + P * psi;
}
