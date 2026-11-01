import { ErvenytelenBemenet } from '../hibak.js';
import { alapertek, sorKeres, szamMezo, type TablaHivatkozas } from '../normativ/index.js';
import { sugarzas, type Honap, type Tajolas } from './eghajlat.js';

const ALAP_6: TablaHivatkozas = 'modszer/netto_energiaigeny#alapertekek_6_fejezet';
const KERETARANY: TablaHivatkozas = 'modszer/netto_energiaigeny#keretarany_alapertekek';
const TABLA_6_5: TablaHivatkozas = 'modszer/netto_energiaigeny#tabla_6_5';

/** Üvegezett terület: A_ü = A_nyz · (1 − F_keret), (6.23) (NY-003, 1. függ. 6.3.1, 46. o.). */
export function uvegezettTerulet(aNyz: number, fKeret: number): number {
  if (!(aNyz >= 0) || !(fKeret >= 0 && fKeret < 1)) throw new ErvenytelenBemenet('Érvénytelen bemenet.', 'NY-003');
  return aNyz * (1 - fKeret);
}

/** A keretarány-alapértékek esetei (NY-004, 1. függ. 6.3.1, 46. o.) – pontosabb adat hiányában. */
export type KeretaranyEset =
  | 'általában'
  | 'régi (1990 előtti) nyílászárók'
  | 'felülvilágítók és vékony télikert szerkezetek'
  | 'kisméretű (< 0,5 m2) nyílászárók';

export function keretaranyAlapertek(eset: KeretaranyEset): number {
  return szamMezo(sorKeres(KERETARANY, (s) => s['eset'] === eset), 'f_keret', KERETARANY);
}

/** Összesített sugárzásátbocsátás: g = F_ü · g_n, F_ü alapértéke 0,9, (6.24) (NY-005, NY-006). */
export function osszesitettG(gN: number, fU?: number): number {
  if (!(gN >= 0 && gN <= 1)) throw new ErvenytelenBemenet('Érvénytelen g_n.', 'NY-005');
  return (fU ?? alapertek(ALAP_6, 'F_u_beesesi_szog_korrekcio_alapertek')) * gN;
}

/** Egy transzparens szerkezet a direkt szoláris nyereséghez. */
export interface Transzparens {
  /** Üvegezett terület [m²] (6.23). */
  Au: number;
  /** Sugárzásátbocsátás merőleges beesésnél [-]; a program F_ü-vel szorozza (6.24). */
  gN: number;
  tajolas: Tajolas;
  /** Hajlásszög a vízszinteshez [°]: függőleges ablak 90, vízszintes felülvilágító 0. */
  hajlasszog: number;
  /** A társított napvédő szerkezet árnyékolási tényezője hűtéskor [-]; fűtéskor mindig 1 (NY-007). */
  gArnyH?: number;
  /**
   * Külső akadályok miatti árnyékoltsági tényező fűtésre és hűtésre [-] (6.25). Ha nincs megadva, a program
   * a 6.3.1 szerinti egyszerűsítést alkalmazza: fűtésnél az északi tájolás sugárzásával számol, hűtésnél
   * zavartalan benapozással (NY-015).
   */
  fArny?: { F: number; H: number };
}

/**
 * Direkt szoláris nyereség [kWh] az adott hónapra és üzemmódra:
 * Q_sd = Σ A_ü · g · g_árny · F_árny · G_s, (6.22) (NY-002, NY-007, NY-015; 1. függ. 6.3.1, 46–47. o.).
 * Az indirekt nyereség egyszerűsített módszerben elhagyható (NY-018), az opak szerkezetek nyeresége
 * elhanyagolható (NY-016).
 */
export function direktSzolarisNyereseg(elemek: readonly Transzparens[], m: Honap, uzem: 'F' | 'H'): number {
  const gArnyF = alapertek(ALAP_6, 'g_arny_F');
  return elemek.reduce((s, e) => {
    if (!(e.Au >= 0)) throw new ErvenytelenBemenet('Érvénytelen üvegezett terület.', 'NY-002');
    const g = osszesitettG(e.gN);
    const gArny = uzem === 'F' ? gArnyF : (e.gArnyH ?? 1);
    let gs: number;
    let fArny: number;
    if (e.fArny) {
      fArny = uzem === 'F' ? e.fArny.F : e.fArny.H;
      gs = sugarzas(e.tajolas, e.hajlasszog, m);
    } else {
      fArny = 1;
      gs = sugarzas(uzem === 'F' ? 'É' : e.tajolas, e.hajlasszog, m);
    }
    if (!(fArny >= 0 && fArny <= 1) || !(gArny >= 0 && gArny <= 1)) {
      throw new ErvenytelenBemenet('Érvénytelen árnyékolási tényező.', 'NY-002');
    }
    return s + e.Au * g * gArny * fArny * gs;
  }, 0);
}

/** Belső hőnyereség [kWh]: Q_b = A_N · q_b · Δt / 1000, (6.26) (NY-019, NY-022). q_b negatív is lehet. */
export function belsoHonyereseg(aN: number, qb: number, dt: number): number {
  if (!(aN >= 0) || !Number.isFinite(qb) || !(dt > 0)) throw new ErvenytelenBemenet('Érvénytelen bemenet.', 'NY-019');
  return (aN * qb * dt) / 1000;
}

export type HotaroloKategoria = 1 | 2 | 3 | 4;

/** Effektív belső hőtároló képesség [kJ/K]: C_m,eff = (C_m,eff/A_N)_tábla · A_N (NET-016, 6.5. táblázat, 49. o.). */
export function hotaroloKepesseg(kategoria: HotaroloKategoria, aN: number): number {
  if (!(aN > 0)) throw new ErvenytelenBemenet('Érvénytelen alapterület.', 'NET-016');
  return szamMezo(sorKeres(TABLA_6_5, (s) => s['kategoria'] === kategoria), 'cm_eff_per_an', TABLA_6_5) * aN;
}
