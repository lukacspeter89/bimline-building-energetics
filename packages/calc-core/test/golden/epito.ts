// Golden tesztek: a tests/golden/inputs/Gx.json (WinWatt-független bemenet) átalakítása a számítási mag hívásaivá.
// A WinWatt-eredmény referencia, nem igazság (tests/golden/README.md); az eltéréseket a docs/ELTERESEK_WINWATT.md rögzíti.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  egyhejuNyilaszaroU,
  feluletiEllenallas,
  homogenRtot,
  hoatbocsatasiTenyezo,
  retegEllenallas,
  talajonFekvoPadlo,
  type HoaramIrany,
  type Tajolas,
} from '../../src/index.js';

const GYOKER = fileURLToPath(new URL('../../../../tests/golden/', import.meta.url));

export interface GoldenAnyag {
  rho: number;
  lambda: number;
  c_kJkgK: number;
  mu: number;
}
export interface GoldenPanel {
  type: string;
  code: number;
  Rsi: number;
  Rse: number;
  layers: { name: string; d_cm: number }[];
}
export interface GoldenFal {
  side: 'N' | 'E' | 'S' | 'W';
  compass: number;
  x: number;
  y: number;
  A: number;
  MinA: number;
}
export interface GoldenHelyiseg {
  name: string;
  area: number;
  height: number;
  temp: number;
  walls: GoldenFal[];
  windows: Partial<Record<GoldenFal['side'], [number, number, number][]>>;
  door: [GoldenFal['side'], number, number] | null;
  roof?: { panel: string; A: number };
  floor?: { panel: string; A: number; P: number; x: number };
  attic?: { panel: string; A: number; t_over: number; Bu: number };
  basement?: { panel: string; A: number; t_over: number; Bu: number };
  garage_wall?: { panel: string; x: number; y: number; A: number; t_over: number; Bu: number };
  ceiling_internal?: { panel: string; A: number };
}
export interface GoldenBemenet {
  id: string;
  rooms: GoldenHelyiseg[];
  heated_area: number;
  systems: Record<string, unknown>;
  iso: { A: number; P: number; w: number } | null;
  materials_used: Record<string, GoldenAnyag>;
  panels: Record<string, GoldenPanel>;
  window: { Ug: number; g: number; Uf: number; frame_mm: number };
  door: { U: number };
}

/** A tests/golden/expected/Gx_expected.json tesztekben használt része. */
export interface GoldenVart {
  oeny_etanusitas: { AV_arany: number; Ep_kWh_m2a: number; CO2_kg_m2a: number; q_fajlagos_hoveszteseg_W_m3K: number; besorolas_Ep: string };
  winwatt_projekt: {
    panelek: Record<string, { k: number; kFromLayers: number | null }>;
    epulet: { EPBD_rendszerek: Record<string, { Name: string; WFinal: number }[]> } & Record<string, unknown>;
  };
}

export function betolt(eset: string): { be: GoldenBemenet; vart: GoldenVart } {
  return {
    be: JSON.parse(readFileSync(`${GYOKER}inputs/${eset}.json`, 'utf8')) as GoldenBemenet,
    vart: JSON.parse(readFileSync(`${GYOKER}expected/${eset}_expected.json`, 'utf8')) as GoldenVart,
  };
}

/** A panel rétegeinek hővezetési ellenállása [m²K/W] (felületi ellenállások nélkül). */
export function retegekR(be: GoldenBemenet, panel: string): number {
  const p = be.panels[panel]!;
  return p.layers.reduce((s, r) => s + retegEllenallas(r.d_cm / 100, be.materials_used[r.name]!.lambda), 0);
}

/** Rétegtervi U a módszer 4.1. táblázatának felületi ellenállásaival (a bemenet R_si/R_se mezőit nem használjuk). */
export function retegtervU(be: GoldenBemenet, panel: string, irany: HoaramIrany, mindketOldalBelso = false): number {
  const p = be.panels[panel]!;
  const f = feluletiEllenallas({ irany, mindketOldalBelso });
  return hoatbocsatasiTenyezo(
    homogenRtot(
      f,
      p.layers.map((r) => ({ tipus: 'homogen' as const, d: r.d_cm / 100, lambda: be.materials_used[r.name]!.lambda })),
    ),
  );
}

/** Egyhéjú ablak U-értéke (4.16) a keretszélességgel körben, Ψ = 0 (a golden bemenet szerint). */
export function ablakU(be: GoldenBemenet, x: number, y: number): { U: number; Au: number } {
  const k = be.window.frame_mm / 1000;
  const Au = Math.max(0, x - 2 * k) * Math.max(0, y - 2 * k);
  const Ak = x * y - Au;
  return { U: egyhejuNyilaszaroU({ uvegezes: [{ A: Au, U: be.window.Ug }], keret: [{ A: Ak, U: be.window.Uf }] }), Au };
}

/** Talajon fekvő padló egyenértékű U-értéke (4.20–4.23). */
export function padloU(be: GoldenBemenet, panel: string, A: number, P: number, df: number) {
  return talajonFekvoPadlo({ A, P, df, rP: retegekR(be, panel), melyseg: 0 });
}

export const TAJOLAS: Record<GoldenFal['side'], Tajolas> = { N: 'É', E: 'K', S: 'D', W: 'Ny' };
