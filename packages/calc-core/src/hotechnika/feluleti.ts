import { ErvenytelenBemenet, ReszletesModszerSzukseges } from '../hibak.js';
import { alapertek, sorKeres, szamMezo, type TablaHivatkozas } from '../normativ/index.js';

const TABLA_4_1: TablaHivatkozas = 'modszer/hotechnika#tabla_4_1';
const ALAPERTEKEK_4: TablaHivatkozas = 'modszer/hotechnika#alapertekek_4';

/** A hőáram iránya a 4.1. és 4.2. táblázat oszlopai szerint. */
export type HoaramIrany = 'felfele' | 'vizszintes' | 'lefele';

/**
 * A hőáram iránya a vízszintes síkhoz mért szögéből (felfelé pozitív, lefelé negatív).
 * HT-014: a vízszintes értékek a vízszintes síktól ±30°-ig alkalmazhatók (1. függ. 4.1.2, 24. o.).
 */
export function hoaramIranya(szogFok: number): HoaramIrany {
  if (!Number.isFinite(szogFok) || szogFok < -90 || szogFok > 90) {
    throw new ErvenytelenBemenet(`A hőáram iránya −90° és +90° között adható meg, kapott: ${szogFok}`, 'HT-014');
  }
  const tures = alapertek(ALAPERTEKEK_4, 'legreteg_szog_tures');
  if (Math.abs(szogFok) <= tures) return 'vizszintes';
  return szogFok > 0 ? 'felfele' : 'lefele';
}

export interface FeluletiEllenallasBemenet {
  irany: HoaramIrany;
  /**
   * Belső szerkezet, illetve fűtött és fűtetlen teret elválasztó szerkezet: mindkét oldalon R_si (HT-004).
   */
  mindketOldalBelso?: boolean;
  /** Nem sík felület, alacsony emissziós tényezőjű felület vagy speciális peremfeltétel (HT-015). */
  kulonlegesFelulet?: boolean;
}

export interface FeluletiEllenallas {
  /** Belső oldali felületi hőátadási ellenállás [m²K/W]. */
  Rsi: number;
  /** Külső oldali felületi hőátadási ellenállás [m²K/W]. */
  Rse: number;
}

/**
 * Felületi hőátadási ellenállások a 4.1. táblázatból (HT-010 … HT-013), a HT-004 és HT-015 szabállyal.
 * Forrás: 9/2023 ÉKM 1. függ. 4.1.2, 4.1. táblázat, 24. o.
 */
export function feluletiEllenallas(b: FeluletiEllenallasBemenet): FeluletiEllenallas {
  if (b.kulonlegesFelulet) {
    throw new ReszletesModszerSzukseges(
      'Nem sík vagy alacsony emissziós tényezőjű felületnél, illetve speciális peremfeltételnél a felületi hőátadási ellenállást az MSZ EN ISO 6946 szerint kell meghatározni.',
      'HT-015',
    );
  }
  const Rsi = szamMezo(sorKeres(TABLA_4_1, (s) => s['jeloles'] === 'R_si'), b.irany, TABLA_4_1);
  const Rse = b.mindketOldalBelso
    ? Rsi
    : szamMezo(sorKeres(TABLA_4_1, (s) => s['jeloles'] === 'R_se'), b.irany, TABLA_4_1);
  return { Rsi, Rse };
}
