// Méretezési hőterhelés – MSZ EN 12831-1:2017, 6. fejezet (szabványos módszer), D, E melléklet.
// Forrás: docs/szabvany/EN12831-1_implementacios_spec.md (F-12), ellenőrizve az OCR-kivonattal (F-13).
// A B melléklet tájékoztató alapértékei a data/normativ/szabvany/msz_en_12831_1.json-ból (nemzeti melléklet nincs, D-146).
import { ErvenytelenBemenet, ReszletesModszerSzukseges } from '../hibak.js';
import { alapertek, sorKeres, szamMezo, tabla, type TablaHivatkozas } from '../normativ/index.js';

const N = (id: string): TablaHivatkozas => `szabvany/msz_en_12831_1#${id}`;
const B = (kulcs: string): number => alapertek(N('alapertekek'), kulcs);
const veges = (x: number): boolean => Number.isFinite(x);

// ---------------------------------------------------------------------------------------------
// Alapértékek (B melléklet)
// ---------------------------------------------------------------------------------------------

export type HohidKategoria = 'uj_igazolt' | 'uj_altalanos' | 'belso_szigeteles' | 'egyeb';
/** ΔU_TB a B.1. táblázatból (HL-030). */
export const hohidPotlek = (k: HohidKategoria): number => szamMezo(sorKeres(N('tabla_B1'), (s) => s['kulcs'] === k), 'dU_TB', N('tabla_B1'));

export type FutetlenF1 =
  | 'helyiseg_1kulso'
  | 'helyiseg_2kulso_ajto_nelkul'
  | 'helyiseg_2kulso_ajtoval'
  | 'helyiseg_3kulso'
  | 'pince_nyilas_nelkul'
  | 'pince_nyilassal'
  | 'padlas_nagy_legcsere'
  | 'padlas_szigeteletlen'
  | 'padlas_szigetelt'
  | 'kozlekedo_belso'
  | 'kozlekedo_szabad'
  | 'padlo_maszoter';
/** f_1 fűtetlen tér felé a B.2. táblázatból, < 4 m belmagasságnál (HL-031). */
export const futetlenF1 = (k: FutetlenF1): number => szamMezo(sorKeres(N('tabla_B2'), (s) => s['kulcs'] === k), 'f1', N('tabla_B2'));

export type HoleadoMagas = 'meleglegos' | 'meleglegos_destrat' | 'mennyezeti_panel' | 'sotetsugarzo' | 'vilagito_sugarzo' | 'feluletfutes' | 'radiator';
export interface HoleadoJellemzo {
  Gair: number;
  dTrad: number;
  dTsurf: { padlo: number; fal: number; menny: number };
}
/** Hőleadási jellemzők magas helyiségekben, B.3. táblázat (HL-032). */
export function holeadoJellemzo(k: HoleadoMagas): HoleadoJellemzo {
  const s = sorKeres(N('tabla_B3'), (x) => x['kulcs'] === k);
  const m = (f: string): number => szamMezo(s, f, N('tabla_B3'));
  return { Gair: m('G_air'), dTrad: m('dT_rad'), dTsurf: { padlo: m('dT_surf_padlo'), fal: m('dT_surf_fal'), menny: m('dT_surf_menny') } };
}

export type HotaroloKat12831 = 'alacsony' | 'kozepes_magas';
/** c_eff a B.4. táblázatból [Wh/(m³K)] (HL-033). */
export const fajlagosHotarolo = (k: HotaroloKat12831): number => szamMezo(sorKeres(N('tabla_B4'), (s) => s['kulcs'] === k), 'c_eff', N('tabla_B4'));

/** f_i-z a B.5. táblázatból: 1 helyiségnél 1, többnél 0,5 (HL-034). */
export function helyisegZonaArany(helyisegekSzama: number): number {
  if (!(helyisegekSzama >= 1)) throw new ErvenytelenBemenet('A zónában legalább egy helyiség kell.', 'HL-034');
  const sorok = [...tabla(N('tabla_B5')).sorok].sort((x, y) => (y['helyisegek_min'] as number) - (x['helyisegek_min'] as number));
  const sor = sorok.find((x) => helyisegekSzama >= (x['helyisegek_min'] as number))!;
  return szamMezo(sor, 'f_i_z', N('tabla_B5'));
}

export type LegtomorsegiOsztaly = 'I' | 'II' | 'III' | 'IV';
/** q_env,50 a B.6. táblázatból [m³/(m²h)] (HL-035). */
export const legatereszto = (o: LegtomorsegiOsztaly): number => szamMezo(sorKeres(N('tabla_B6'), (s) => s['osztaly'] === o), 'q_env50', N('tabla_B6'));

export type NMinTipus = 'allando' | 'vizes_ablakos' | 'mellek_belso';
/** n_min a B.7. táblázatból [1/h] (HL-036). */
export const minimalisLegcsere = (k: NMinTipus): number => szamMezo(sorKeres(N('tabla_B7'), (s) => s['kulcs'] === k), 'n_min', N('tabla_B7'));

export type Arnyekoltsag = 'intenziv' | 'normal' | 'nincs';
/** f_qv,z a B.8. táblázatból (HL-037). Δh_z: a zóna függőleges kiterjedése [m]; h_gz: a zóna magassága a terep felett [m]. */
export function terfogataramTenyezo(b: { tobbHomlokzat: boolean; hgz: number; arnyekoltsag: Arnyekoltsag; dhz: number }): number {
  if (!(b.dhz >= 0) || !(b.hgz >= 0)) throw new ErvenytelenBemenet('Érvénytelen zónamagasság.', 'HL-037');
  const sor = sorKeres(N('tabla_B8'), (s) =>
    !b.tobbHomlokzat ? s['homlokzat'] === 'egy' : b.hgz > 50 ? s['hgz'] === 'gt50' : s['hgz'] === 'le50' && s['arnyekoltsag'] === b.arnyekoltsag,
  );
  const oszlop = b.dhz <= 5 ? 'dh5' : b.dhz <= 10 ? 'dh10' : b.dhz <= 20 ? 'dh20' : 'dhtobb';
  return szamMezo(sor, oszlop, N('tabla_B8'));
}

/** f_fac,z a B.9. táblázatból (HL-038). */
export const homlokzatszamTenyezo = (tobbHomlokzat: boolean): number =>
  szamMezo(sorKeres(N('tabla_B9'), (s) => s['homlokzat'] === (tobbHomlokzat ? 'tobb' : 'egy')), 'f_fac', N('tabla_B9'));

export type BelsoTipus12831 = 'egyszemelyes_iroda' | 'egyteru_iroda' | 'targyalo' | 'eloadoterem' | 'etterem' | 'tanterem' | 'bolcsode' | 'aruhaz' | 'lakas' | 'furdo' | 'templom' | 'muzeum';
/** θ_int,i a B.14. táblázatból [°C] (HL-039). */
export const belsoMeretezesiHomerseklet = (k: BelsoTipus12831): number => szamMezo(sorKeres(N('tabla_B14'), (s) => s['kulcs'] === k), 'theta_int', N('tabla_B14'));

// ---------------------------------------------------------------------------------------------
// 6.3.2 Transzmisszió
// ---------------------------------------------------------------------------------------------

/**
 * Hőmérséklet-korrekciós tényező (HL-005): f_ix,k = f_1 + f_2, (9);
 * f_1 = (θ_int,i − θ_x)/(θ_int,i − θ_e), (10); f_2 = (θ*_int,k − θ_int,i)/(θ_int,i − θ_e), (11).
 * Ha f_1 közvetlenül adott (fűtetlen tér, B.2. táblázat), azt használja.
 */
export function homersekletKorrekcio(b: { thetaInt: number; thetaE: number; thetaX?: number; f1?: number; thetaStarK?: number }): number {
  const d = b.thetaInt - b.thetaE;
  if (!(Math.abs(d) > 1e-9)) throw new ErvenytelenBemenet('A belső és a külső méretezési hőmérséklet nem lehet egyenlő (nullával osztás).', 'HL-005');
  let f1: number;
  if (b.f1 !== undefined) f1 = b.f1;
  else if (b.thetaX !== undefined) f1 = (b.thetaInt - b.thetaX) / d;
  else throw new ErvenytelenBemenet('A szomszédos tér hőmérséklete vagy f_1 szükséges.', 'HL-005');
  const f2 = b.thetaStarK === undefined ? 0 : (b.thetaStarK - b.thetaInt) / d;
  return f1 + f2;
}

/** A határoló szerkezet túloldala a 6.3.2 szerint. */
export type HlTuloldal =
  /** külső tér (e), 6.3.2.2 */
  | { x: 'e' }
  /** másik fűtött helyiség ugyanabban az épületrészben (a): θ_x = θ_int,a */
  | { x: 'a'; thetaX: number }
  /** másik épületrész (aBE): θ_x = θ_u (D melléklet) */
  | { x: 'aBE'; thetaX: number }
  /** fűtetlen tér (ae): ismert hőmérséklet, vagy f_1 a B.2. táblázatból */
  | { x: 'ae'; thetaX: number }
  | { x: 'ae'; f1: number }
  /** szomszédos épület (ae): θ_x = max(θ_e,m; 5 °C), 7. táblázat */
  | { x: 'epulet' }
  /** talaj (g): θ_x = θ_e,m; U_equiv és f_GW */
  | { x: 'g'; fGW: number };

export interface HlElem {
  nev?: string;
  /** Felület [m²]. */
  A: number;
  /** Hőátbocsátási tényező [W/(m²K)]; talajnál az egyenértékű U_equiv,k. */
  U: number;
  tuloldal: HlTuloldal;
  /** Magas helyiségben (h ≥ 4 m) a szerkezet átlagos belső felületi hőmérséklete θ*_int,k [°C], (48). */
  thetaStarK?: number;
}

export interface HlHelyisegTranszmisszio {
  thetaInt: number;
  elemek: readonly HlElem[];
}

export interface HlKornyezet {
  /** Külső méretezési hőmérséklet θ_e [°C], (45). */
  thetaE: number;
  /** Éves átlagos külső hőmérséklet θ_e,m [°C] (talaj, szomszéd épület). */
  thetaEm: number;
  /** ΔU_TB [W/(m²K)] (B.1). */
  dUTB: number;
  /** f_U,k (B.2.2). */
  fU?: number;
  /** f_θ,ann (B.2.3). */
  fThetaAnn?: number;
}

export interface TranszmisszioEredmeny {
  H: { ie: number; ia: number; iae: number; iaBE: number; ig: number };
  /** Φ_T,i [W], (4). */
  Phi: number;
  /** Φ_T,ix [W], (5). */
  reszek: { ie: number; ia: number; iae: number; iaBE: number; ig: number };
}

/**
 * Fűtött helyiség méretezési transzmissziós hővesztesége (HL-004 … HL-009):
 * Φ_T,i = (H_T,ie + H_T,ia + H_T,iae + H_T,iaBE + H_T,ig)·(θ_int,i − θ_e), (4);
 * H_T,ie = Σ A·(U + ΔU_TB)·f_U·f_ie, (6); H_T,ia(...) = Σ A·U·f_ia, (7);
 * H_T,ig = f_θ,ann·Σ A·U_equiv·f_ig·f_GW, (8), f_ig-ben θ_x = θ_e,m.
 */
export function transzmisszio(h: HlHelyisegTranszmisszio, k: HlKornyezet): TranszmisszioEredmeny {
  const fU = k.fU ?? B('f_U_k');
  const fAnn = k.fThetaAnn ?? B('f_theta_ann');
  const H = { ie: 0, ia: 0, iae: 0, iaBE: 0, ig: 0 };
  for (const e of h.elemek) {
    if (!(e.A >= 0) || !(e.U >= 0)) throw new ErvenytelenBemenet(`Érvénytelen felület vagy U: ${e.nev ?? ''}`, 'HL-006');
    const t = e.tuloldal;
    const kor = (x: { thetaX?: number; f1?: number }): number =>
      homersekletKorrekcio({ thetaInt: h.thetaInt, thetaE: k.thetaE, ...x, ...(e.thetaStarK !== undefined ? { thetaStarK: e.thetaStarK } : {}) });
    switch (t.x) {
      case 'e':
        H.ie += e.A * (e.U + k.dUTB) * fU * kor({ f1: 1 });
        break;
      case 'a':
        H.ia += e.A * e.U * kor({ thetaX: t.thetaX });
        break;
      case 'aBE':
        H.iaBE += e.A * e.U * kor({ thetaX: t.thetaX });
        break;
      case 'ae':
        H.iae += e.A * e.U * kor('f1' in t ? { f1: t.f1 } : { thetaX: t.thetaX });
        break;
      case 'epulet':
        H.iae += e.A * e.U * kor({ thetaX: Math.max(k.thetaEm, B('theta_j_min_futetlen_min')) });
        break;
      case 'g':
        H.ig += fAnn * e.A * e.U * kor({ thetaX: k.thetaEm }) * t.fGW;
        break;
    }
  }
  const dT = h.thetaInt - k.thetaE;
  const reszek = { ie: H.ie * dT, ia: H.ia * dT, iae: H.iae * dT, iaBE: H.iaBE * dT, ig: H.ig * dT };
  return { H, reszek, Phi: reszek.ie + reszek.ia + reszek.iae + reszek.iaBE + reszek.ig };
}

// ---------------------------------------------------------------------------------------------
// E melléklet – talajjal érintkező szerkezetek egyenértékű U-ja
// ---------------------------------------------------------------------------------------------

/** B′ = A_G / (0,5·P), (E.2) (HL-040). */
export function talajGeometria(AG: number, P: number): number {
  if (!(AG > 0) || !(P > 0)) throw new ErvenytelenBemenet('A padlólemez területe és szabad kerülete pozitív kell legyen.', 'HL-040');
  return AG / (0.5 * P);
}

/**
 * U_equiv,k = a / (b + (c1 + B′)^n1 + (c2 + z)^n2 + (c3 + U_k + ΔU_TB)^n3) + d, (E.1), E.1. táblázat (HL-041).
 * Érvényesség: U_padló ≤ 4, U_pincefal ≤ 3 W/(m²K), 2 ≤ B′ ≤ 50 m, 0 ≤ z ≤ 5 m, pincefalnál z > 0; ezen kívül
 * MSZ EN ISO 13370 szerinti részletes számítás kell.
 */
export function egyenertekuUTalaj(b: { szerkezet: 'padlo' | 'pincefal'; B: number; z: number; U: number; dUTB: number }): number {
  const Umax = B(b.szerkezet === 'padlo' ? 'E_padlo_U_max' : 'E_pincefal_U_max');
  if (!(b.U > 0) || b.U > Umax) throw new ReszletesModszerSzukseges(`Az E melléklet csak U ≤ ${Umax} W/(m²K) szerkezetre alkalmazható; MSZ EN ISO 13370.`, 'HL-041');
  if (b.B < B('E_B_min') || b.B > B('E_B_max')) throw new ReszletesModszerSzukseges(`Az E melléklet csak 2 m ≤ B′ ≤ 50 m esetén alkalmazható (B′ = ${b.B.toFixed(2)} m); MSZ EN ISO 13370.`, 'HL-041');
  if (b.z < 0 || b.z > B('E_z_max') || (b.szerkezet === 'pincefal' && !(b.z > 0))) {
    throw new ReszletesModszerSzukseges('Az E melléklet csak 0 ≤ z ≤ 5 m (pincefalnál z > 0) esetén alkalmazható; MSZ EN ISO 13370.', 'HL-041');
  }
  const s = sorKeres(N('tabla_E1'), (x) => x['szerkezet'] === b.szerkezet);
  const p = (k: string): number => szamMezo(s, k, N('tabla_E1'));
  const nev = p('b') + (p('c1') + b.B) ** p('n1') + (p('c2') + b.z) ** p('n2') + (p('c3') + b.U + b.dUTB) ** p('n3');
  return p('a') / nev + p('d');
}

// ---------------------------------------------------------------------------------------------
// 6.3.7 Külső méretezési hőmérséklet, 6.3.5 időállandó
// ---------------------------------------------------------------------------------------------

/**
 * θ_e,0 = θ_e,Ref + G_θ,Ref·(h_build − h_Ref), (46); Δθ_e,τ = max(min(k_τ·τ + Δθ_e,τ,0; Δθ_e,τ,max); Δθ_e,τ,min), (47);
 * θ_e = θ_e,0 + Δθ_e,τ, (45) (HL-010 … HL-012). Magassági korrekció csak a nemzeti adatokkal (G, h_Ref); időállandó-
 * korrekció a B.13. táblázattal, ha τ adott.
 */
export function kulsoMeretezesiHomerseklet(b: { thetaERef: number; magassag?: { G: number; hBuild: number; hRef: number }; tau?: number }): { thetaE0: number; dTau: number; thetaE: number } {
  if (!veges(b.thetaERef)) throw new ErvenytelenBemenet('A külső méretezési hőmérséklet (θ_e,Ref) szükséges.', 'HL-010');
  const thetaE0 = b.thetaERef + (b.magassag ? b.magassag.G * (b.magassag.hBuild - b.magassag.hRef) : 0);
  const dTau = b.tau === undefined ? 0 : Math.max(Math.min(B('k_tau') * b.tau + B('dtheta_e_tau_0'), B('dtheta_e_tau_max')), B('dtheta_e_tau_min'));
  return { thetaE0, dTau, thetaE: thetaE0 + dTau };
}

/** τ = C_eff / H, (40); C_eff = c_eff·V_e, (41) (HL-013). */
export function idoallando(cEff: number, Ve: number, H: number): number {
  if (!(cEff > 0) || !(Ve > 0) || !(H > 0)) throw new ErvenytelenBemenet('Érvénytelen c_eff, V_e vagy H.', 'HL-013');
  return (cEff * Ve) / H;
}

// ---------------------------------------------------------------------------------------------
// 6.3.8 Magas helyiségek
// ---------------------------------------------------------------------------------------------

/** θ*_int,k = θ_int,i + G_θ,air,i·(h_k − h_occup,i) + Δθ_surf,k, (48) (HL-014). */
export const magasFeluletiHomerseklet = (b: { thetaInt: number; Gair: number; hk: number; hOccup: number; dTsurf: number }): number =>
  b.thetaInt + b.Gair * (b.hk - b.hOccup) + b.dTsurf;

/** θ*_int,i = θ_int,i + G_θ,air,i·(h_i/2 − h_occup,i) − Δθ_rad, (49) (HL-015). */
export const magasLeghomerseklet = (b: { thetaInt: number; Gair: number; hi: number; hOccup: number; dTrad: number }): number =>
  b.thetaInt + b.Gair * (b.hi / 2 - b.hOccup) - b.dTrad;

// ---------------------------------------------------------------------------------------------
// 6.3.3 Szellőzés – általános modell
// ---------------------------------------------------------------------------------------------

export interface HlSzellozesHelyiseg {
  /** Belső térfogat V_i [m³]. */
  V: number;
  /** Burokfelület A_env,i [m²], (36). */
  Aenv: number;
  /** q_v,min,i = n_min,i·V_i, (33) [m³/h]. */
  qMin: number;
  /** θ*_int,i [°C]: < 4 m belmagasságnál θ_int,i. */
  thetaStar: number;
  qSup?: number;
  qExh?: number;
  qComb?: number;
  qOpen?: number;
  qAtdDesign?: number;
  atadas?: readonly { q: number; theta: number }[];
}

export interface HlSzellozesZona {
  helyisegek: readonly HlSzellozesHelyiseg[];
  thetaE: number;
  /** q_env,50 [m³/(m²h)] (B.6, vagy (31) n50-ből). */
  qEnv50: number;
  /** f_qv,z (B.8). */
  fqv: number;
  /** f_fac,z (B.9). */
  ffac: number;
  /** θ_rec,z [°C], (37); csak befúvásnál. */
  thetaRec?: number;
}

export interface SzellozesEredmeny {
  /** Φ_V,i [W], (17). */
  helyisegek: { Phi: number; qEnv: number; qLeakAtd: number; qTechn: number; qKulsoZona: number }[];
  /** Φ_V,z [W], (16). */
  zona: number;
  qEnvZ: number;
  qInfAdd: number;
}

/**
 * Általános szellőzési modell (HL-016 … HL-028): (16)–(30), (33). Az ATD-légáramot a zóna összegéből (B.1) veszi,
 * Δp_ATD és v_leak a B melléklet alapértéke. A ρ·c_p = 0,34 Wh/(m³K) (B.2.8).
 */
export function szellozesAltalanos(z: HlSzellozesZona): SzellozesEredmeny {
  const rc = B('rho_cp');
  const hs = z.helyisegek;
  const sum = (f: (h: HlSzellozesHelyiseg) => number): number => hs.reduce((s, h) => s + f(h), 0);
  const AenvZ = sum((h) => h.Aenv);
  const qExhZ = sum((h) => h.qExh ?? 0); // (25)
  const qCombZ = sum((h) => h.qComb ?? 0); // (26)
  const qSupZ = sum((h) => h.qSup ?? 0); // (27)
  const qAtdDesignZ = sum((h) => h.qAtdDesign ?? 0); // (B.1)
  const qAtd50 = qAtdDesignZ > 0 ? qAtdDesignZ * (50 / B('dp_ATD_design')) ** B('v_leak') : 0; // (30)
  const nevezo = z.qEnv50 * AenvZ + qAtd50;
  const kiegy = qExhZ + qCombZ - qSupZ;
  const fe = nevezo > 0 ? 1 / (1 + (z.ffac / z.fqv) * (kiegy / nevezo) ** 2) : 1; // (29)
  const qInfAdd = nevezo * z.fqv * fe; // (28)
  const qEnvZ = Math.max(kiegy, 0) + qInfAdd; // (24)
  const aAtd = nevezo > 0 ? qAtd50 / nevezo : 0; // (22)
  const qLeakZ = (1 - aAtd) * qEnvZ; // (20)
  const qAtdZ = aAtd * qEnvZ; // (21)
  const fiz = helyisegZonaArany(hs.length);
  const fdir = B('f_dir');
  let zona = 0;
  const eredmeny = hs.map((h) => {
    const qLeakAtd = (AenvZ > 0 ? qLeakZ * (h.Aenv / AenvZ) : 0) + (qAtdDesignZ > 0 ? qAtdZ * ((h.qAtdDesign ?? 0) / qAtdDesignZ) : 0); // (19)
    const qEnv = qEnvZ > 0 ? (qInfAdd / qEnvZ) * Math.min(qEnvZ, qLeakAtd * fdir) + ((qEnvZ - qInfAdd) / qEnvZ) * qLeakAtd : 0; // (18)
    const qTr = (h.atadas ?? []).reduce((s, a) => s + a.q, 0);
    const qTechn = Math.max((h.qSup ?? 0) + qTr, (h.qExh ?? 0) + (h.qComb ?? 0)); // (23)
    const qSup = h.qSup ?? 0;
    if (qSup > 0 && z.thetaRec === undefined) throw new ErvenytelenBemenet('Befúvásnál a θ_rec,z szükséges (37).', 'HL-024');
    const befuvas = qSup * (h.thetaStar - (z.thetaRec ?? 0));
    const atadas = (h.atadas ?? []).reduce((s, a) => s + a.q * (h.thetaStar - a.theta), 0);
    const Phi = rc * (Math.max(qEnv + (h.qOpen ?? 0), h.qMin - qTechn) * (h.thetaStar - z.thetaE) + befuvas + atadas); // (17)
    const qKulsoZona = Math.max(qLeakAtd + (h.qOpen ?? 0), fiz * h.qMin - qTechn);
    zona += qKulsoZona * (h.thetaStar - z.thetaE) + befuvas + atadas; // (16)
    return { Phi, qEnv, qLeakAtd, qTechn, qKulsoZona };
  });
  return { helyisegek: eredmeny, zona: rc * zona, qEnvZ, qInfAdd };
}

/** q_env,50 = n_50·V_build / A_env,build, (31) (HL-026). */
export function legatereszto50(n50: number, Vbuild: number, AenvBuild: number): number {
  if (!(n50 >= 0) || !(Vbuild > 0) || !(AenvBuild > 0)) throw new ErvenytelenBemenet('Érvénytelen n50, V vagy A_env.', 'HL-026');
  return (n50 * Vbuild) / AenvBuild;
}

/** θ_rec,z = θ_e,0 + η_rec,z·(θ_exh,z − θ_e,0), (37); θ_exh,z = Σ q_exh,i·θ*_int,i / Σ q_exh,i, (38) (HL-027). */
export function befujtHomerseklet(b: { thetaE0: number; etaRec: number; elszivas: readonly { q: number; thetaStar: number }[] }): number {
  const q = b.elszivas.reduce((s, x) => s + x.q, 0);
  if (!(q > 0)) throw new ErvenytelenBemenet('Az elszívott légáram összege pozitív kell legyen.', 'HL-027');
  const thetaExh = b.elszivas.reduce((s, x) => s + x.q * x.thetaStar, 0) / q;
  return b.thetaE0 + b.etaRec * (thetaExh - b.thetaE0);
}

// ---------------------------------------------------------------------------------------------
// 6.3.4 felfűtés, 6.3.1 összegzés
// ---------------------------------------------------------------------------------------------

/** Φ_hu,i = A_i·φ_hu,i, (39) (HL-029). */
export const felfutesiTobblet = (A: number, phiHu: number): number => A * phiHu;

/** Φ_HL,i = Φ_T,i + Φ_V,i + Φ_hu,i − Φ_gain,i, (3) (HL-003). */
export const helyisegHoterheles = (b: { PhiT: number; PhiV: number; PhiHu?: number; PhiGain?: number }): number => b.PhiT + b.PhiV + (b.PhiHu ?? 0) - (b.PhiGain ?? B('phi_gain'));

/**
 * Φ_HL,build = Σ(Φ_T,ie + Φ_T,iae + Φ_T,ig) + Φ_V,build + ΣΦ_hu − ΣΦ_gain, (1) (HL-001); Φ_V,build = Σ_z Φ_V,z, (15).
 * A helyiségek egymás közti (ia) és az épületrészek közti (iaBE) tagjai kimaradnak.
 */
export function epuletHoterheles(b: { helyisegek: readonly { reszek: TranszmisszioEredmeny['reszek']; PhiHu?: number; PhiGain?: number }[]; PhiVZonak: readonly number[] }): number {
  return (
    b.helyisegek.reduce((s, h) => s + h.reszek.ie + h.reszek.iae + h.reszek.ig + (h.PhiHu ?? 0) - (h.PhiGain ?? 0), 0) + b.PhiVZonak.reduce((s, x) => s + x, 0)
  );
}
