import { ErvenytelenBemenet, SzamitasiHiba } from '../hibak.js';
import { alapertek, sorKeres, szamMezo, type TablaHivatkozas } from '../normativ/index.js';

const SULYOK: TablaHivatkozas = 'rendelet/9_2023_EKM_7_melleklet_sulyozo_tenyezok#sulyozo_tenyezok';
const F_FE_EH: TablaHivatkozas = 'modszer/energiahordozok#tabla_f2_3_1';

/** Energiahordozó a 9/2023 ÉKM 7. melléklet 2. pontja szerint (a táblázat `kod` mezője). */
export type Energiahordozo =
  | 'fosszilis_szilard'
  | 'fosszilis_folyekony'
  | 'fosszilis_gaz'
  | 'bio_szilard'
  | 'bio_szilard_kedvezmenyes'
  | 'bio_folyekony'
  | 'bio_gaz'
  | 'villamos'
  | 'tavho_alapertelmezett'
  | 'tavhutes_alapertelmezett'
  | 'hulladekho'
  | 'nap_pv'
  | 'nap_termikus'
  | 'szel'
  | 'kornyezeti_ho';

/** Súlyozó tényezők (IND-008 … IND-010): f_nren, f_ren, f_tot [-] és f_CO2 [kg/kWh]. */
export interface Sulyok {
  nren: number;
  ren: number;
  tot: number;
  co2: number;
}

const NULLA: Sulyok = { nren: 0, ren: 0, tot: 0, co2: 0 };
const osszeg = (a: Sulyok, b: Sulyok): Sulyok => ({ nren: a.nren + b.nren, ren: a.ren + b.ren, tot: a.tot + b.tot, co2: a.co2 + b.co2 });
const szor = (a: Sulyok, k: number): Sulyok => ({ nren: a.nren * k, ren: a.ren * k, tot: a.tot * k, co2: a.co2 * k });

/**
 * A fűtőértéken számított végsőenergia súlyozó tényezői (9/2023 ÉKM 7. melléklet 2. pont; IND-009, IND-010).
 * A távhő/távhűtés táblázati értéke csak a 8. § (1) szerinti kötelezettség elmulasztásakor alkalmazható (IND-013);
 * egyébként a szolgáltató 8. melléklet szerinti tényezőit kell megadni (`egyedi`).
 */
export function sulyozoTenyezok(hordozo: Energiahordozo | 'export_halozatba' | 'export_nem_szabalyozott_fogyasztonak', egyedi?: Sulyok): Sulyok {
  if (egyedi) {
    for (const v of Object.values(egyedi)) if (!(v >= 0)) throw new ErvenytelenBemenet('Érvénytelen súlyozó tényező.', 'IND-013');
    return egyedi;
  }
  const sor = sorKeres(SULYOK, (s) => s['kod'] === hordozo);
  return {
    nren: szamMezo(sor, 'f_nren', SULYOK),
    ren: szamMezo(sor, 'f_ren', SULYOK),
    tot: szamMezo(sor, 'f_tot', SULYOK),
    co2: szamMezo(sor, 'f_co2eq_g_kWh', SULYOK) / 1000,
  };
}

/**
 * Fűtőérték/égéshő hányados F_fé/éh (2. függ. 3.1. táblázat; IND-007). A bio folyékony és bio gáz
 * tüzelőanyagra a táblázat nem ad értéket, ezért azt meg kell adni (D-132).
 */
export function fuetoertekEgeshoHanyados(hordozo: Energiahordozo, megadott?: number): number {
  if (megadott !== undefined) {
    if (!(megadott > 0 && megadott <= 1)) throw new ErvenytelenBemenet('Érvénytelen F_fé/éh.', 'IND-007');
    return megadott;
  }
  const kulcs: Partial<Record<Energiahordozo, string>> = {
    fosszilis_gaz: 'foldgaz',
    fosszilis_folyekony: 'olaj',
    fosszilis_szilard: 'szen',
    bio_szilard: 'fa_biomassza',
    bio_szilard_kedvezmenyes: 'fa_biomassza',
  };
  if (hordozo === 'bio_folyekony' || hordozo === 'bio_gaz') {
    throw new SzamitasiHiba('Bio folyékony és bio gáz tüzelőanyagra a 3.1. táblázat nem ad F_fé/éh értéket; add meg forrással.', 'IND-007');
  }
  const k = kulcs[hordozo] ?? 'nem_egheto';
  return szamMezo(sorKeres(F_FE_EH, (s) => s['kulcs'] === k), 'F_fe_eh', F_FE_EH);
}

/** Egy felhasználási cél (fűtés, HMV, légtechnika, hűtés) egy hőtermelőjének végsőenergia-tétele. */
export interface HoTetel {
  /** Végső hőenergia [kWh/év] – éghető energiahordozónál égéshő alapon, hőszivattyúnál a villamos energia. */
  Qveg: number;
  hordozo: Energiahordozo;
  /** Szolgáltatói vagy egyedi súlyozó tényezők (távhő, IND-013). */
  egyediSulyok?: Sulyok;
  /** Bio folyékony / gáz tüzelőanyag F_fé/éh értéke (D-132). */
  fFeEh?: number;
  /** Hőszivattyú teljesítménytényezője: a környezeti hő Q·(1/ε − 1), ha ε ≤ 0,37 (IND-027, IND-028). */
  hoszivattyuEps?: number;
}

export interface CelEnergia {
  ho: readonly HoTetel[];
  /** Villamos segédenergia [kWh/év]. */
  W: number;
  /** A W energiahordozója (alapesetben hálózati villamos energia). */
  Whordozo?: Energiahordozo;
}

export interface CelEredmeny {
  sulyozott: Sulyok;
  /** Hőszivattyúval hasznosított környezeti hő [kWh/év] (IND-027). */
  kornyezetiHo: number;
}

/**
 * Felhasználási cél súlyozott energiaigénye (IND-002 … IND-006; 1. függ. 14, (14.2)–(14.6), 89. o.):
 * E = Σ Q_vég,i·F_fé/éh·f_i + Σ W_vég,i·f_i. Hőszivattyúnál a környezeti hő a 14.3 szerint, a „környezeti hő”
 * energiahordozó tényezőivel kerül be.
 */
export function celSulyozottEnergia(c: CelEnergia): CelEredmeny {
  if (!(c.W >= 0)) throw new ErvenytelenBemenet('Érvénytelen segédenergia.', 'IND-002');
  let e = szor(sulyozoTenyezok(c.Whordozo ?? 'villamos'), c.W);
  let kornyezetiHo = 0;
  const epsMax = alapertek('modszer/indikatorok#alapertekek_14', 'eps_HP_max_megujulo');
  for (const t of c.ho) {
    if (!(t.Qveg >= 0)) throw new ErvenytelenBemenet('Érvénytelen végső energia.', 'IND-002');
    e = osszeg(e, szor(sulyozoTenyezok(t.hordozo, t.egyediSulyok), t.Qveg * fuetoertekEgeshoHanyados(t.hordozo, t.fFeEh)));
    if (t.hoszivattyuEps !== undefined) {
      if (!(t.hoszivattyuEps > 0)) throw new ErvenytelenBemenet('Érvénytelen hőszivattyú-teljesítménytényező.', 'IND-027');
      if (t.hoszivattyuEps <= epsMax) {
        const q = t.Qveg * (1 / t.hoszivattyuEps - 1);
        kornyezetiHo += q;
        e = osszeg(e, szor(sulyozoTenyezok('kornyezeti_ho'), q));
      }
    }
  }
  return { sulyozott: e, kornyezetiHo };
}

/**
 * Exportált (kiváltott) energia súlyozott értéke, (14.7) (IND-014, IND-015): E_exp = Σ W_exp·(f_exp − f_term).
 * A (14.1) összegben levonandó.
 */
export function exportSulyozottEnergia(
  tetelek: readonly { Wexp: number; termelo: Energiahordozo; cel: 'export_halozatba' | 'export_nem_szabalyozott_fogyasztonak' }[],
): Sulyok {
  return tetelek.reduce((e, t) => {
    if (!(t.Wexp >= 0)) throw new ErvenytelenBemenet('Érvénytelen exportált energia.', 'IND-014');
    const fExp = sulyozoTenyezok(t.cel);
    const fTerm = sulyozoTenyezok(t.termelo);
    return osszeg(e, {
      nren: t.Wexp * (fExp.nren - fTerm.nren),
      ren: t.Wexp * (fExp.ren - fTerm.ren),
      tot: t.Wexp * (fExp.tot - fTerm.tot),
      co2: t.Wexp * (fExp.co2 - fTerm.co2),
    });
  }, NULLA);
}

export type FelhasznalasiCel = 'F' | 'HMV' | 'LT' | 'H' | 'V';

export interface OsszesitettEredmeny {
  /** Célonkénti fajlagos súlyozott energia [kWh/m²év, kg/m²év], (14.9)–(14.13). */
  celonkent: Partial<Record<FelhasznalasiCel, Sulyok>>;
  /** Az exportált energia fajlagos súlyozott értéke, (14.14). */
  exp: Sulyok;
  /** E_súlyozott,fajl, (14.1), (14.8): E_nren,fajl az összesített energetikai jellemző (IND-020), co2 az E_CO2,fajl (IND-021). */
  fajlagos: Sulyok;
  /** Hőszivattyúval hasznosított környezeti hő összesen [kWh/év]. */
  kornyezetiHo: number;
}

/**
 * Összesített súlyozott energetikai teljesítmény (IND-001, IND-018 … IND-021; 1. függ. 14, (14.1), (14.8)–(14.14)):
 * E = E_F + E_HMV + E_LT + E_H + E_V − E_exp, fajlagosan A_N-re.
 */
export function osszesitettEnergetikaiJellemzo(
  celok: Partial<Record<FelhasznalasiCel, CelEnergia>>,
  exportTetelek: Parameters<typeof exportSulyozottEnergia>[0],
  AN: number,
): OsszesitettEredmeny {
  if (!(AN > 0)) throw new ErvenytelenBemenet('Érvénytelen hasznos alapterület.', 'IND-018');
  const celonkent: Partial<Record<FelhasznalasiCel, Sulyok>> = {};
  let ossz = NULLA;
  let kornyezetiHo = 0;
  for (const [cel, c] of Object.entries(celok) as [FelhasznalasiCel, CelEnergia][]) {
    const r = celSulyozottEnergia(c);
    celonkent[cel] = szor(r.sulyozott, 1 / AN);
    ossz = osszeg(ossz, r.sulyozott);
    kornyezetiHo += r.kornyezetiHo;
  }
  const exp = exportSulyozottEnergia(exportTetelek);
  return { celonkent, exp: szor(exp, 1 / AN), fajlagos: szor(osszeg(ossz, szor(exp, -1)), 1 / AN), kornyezetiHo };
}
