/** A normatív táblázatok közös szerkezete (data/normativ/<mappa>/<fájl>.json). */
export interface NormativForras {
  dokumentum: string;
  hely: string;
  oldal?: number | string;
  url?: string;
  idoallapot?: string;
  lekeres?: string;
}

export interface NormativOszlop {
  kulcs: string;
  cim: string;
  egyseg?: string | null;
}

export type NormativSor = Readonly<Record<string, unknown>>;

export interface NormativTabla {
  id: string;
  cim: string;
  forras: NormativForras;
  hatalyos_tol: string;
  megjegyzes: string;
  oszlopok: readonly NormativOszlop[];
  sorok: readonly NormativSor[];
}

export interface NormativFajlTartalom {
  schema_verzio: number;
  tablazatok: readonly NormativTabla[];
}
