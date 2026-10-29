// Golden tesztek: a tests/golden/inputs/Gx.json (WinWatt-független bemenet) átalakítása a számítási mag hívásaivá.
// A WinWatt-eredmény referencia, nem igazság (tests/golden/README.md); az eltéréseket a docs/ELTERESEK_WINWATT.md rögzíti.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  HONAPOK,
  direktTranszmisszio,
  egyhejuNyilaszaroU,
  ejszakaiTobbletSzellozes,
  hotaroloKepesseg,
  psiPf,
  talajHoatvitel,
  termeszetesSzellozes,
  feluletiEllenallas,
  homogenRtot,
  hoatbocsatasiTenyezo,
  retegEllenallas,
  talajonFekvoPadlo,
  type FutetlenHatarolo,
  type FutetlenTerTipus,
  type HoaramIrany,
  type HotaroloKategoria,
  type NettoZonaBemenet,
  type PsiPfBemenet,
  type Tajolas,
  type Transzparens,
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

export interface ZonaEpitesOpciok {
  /** Feltevés a 6.4. táblázathoz: a lábazati fal kialakítása (a golden bemenet nem adja meg). */
  labazatiFal: PsiPfBemenet['labazatiFal'];
  /** A 6.5. táblázat kategóriája. */
  cmKategoria: HotaroloKategoria;
}

export interface ZonaEpites {
  zona: NettoZonaBemenet;
  elemek: { A: number; U: number }[];
  /** A fűtött teret határoló összes felület [m²] (A/V-hez). */
  Aossz: number;
  padlo?: ReturnType<typeof padloU>;
}

/**
 * A golden bemenet összes helyiségéből egyetlen zóna (lakóépület, 20/26 °C, n = 0,5 1/h, n_filt = 0,06 1/h,
 * q_b = 5 W/m², σ = 1; 2. függ. 2.1., 2.4. táblázat). Hőhíd-korrekció nincs (README: dU_tb = 0).
 */
export function zonaEpit(be: GoldenBemenet, o: ZonaEpitesOpciok): ZonaEpites {
  const elemek: { A: number; U: number }[] = [];
  const transzparens: Transzparens[] = [];
  const futetlen: FutetlenHatarolo[] = [];
  let Aossz = 0;
  let V = 0;
  let padlo: ReturnType<typeof padloU> | undefined;
  let hTrT = 0;
  const falazat = be.materials_used['Kerámia falazóblokk 30 (teszt)']!.lambda;
  const uFal = retegtervU(be, 'R1./ Külső fal', 'vizszintes');
  for (const h of be.rooms) {
    V += h.area * h.height;
    for (const fal of h.walls) {
      let nyilasok = 0;
      for (const [x, y, db] of h.windows[fal.side] ?? []) {
        const a = ablakU(be, x, y);
        elemek.push({ A: x * y * db, U: a.U });
        transzparens.push({ Au: a.Au * db, gN: be.window.g, tajolas: TAJOLAS[fal.side], hajlasszog: 90, fArny: { F: 1, H: 1 } });
        nyilasok += x * y * db;
      }
      if (h.door && h.door[0] === fal.side) {
        elemek.push({ A: h.door[1] * h.door[2], U: be.door.U });
        nyilasok += h.door[1] * h.door[2];
      }
      elemek.push({ A: fal.A - nyilasok, U: uFal });
      Aossz += fal.A;
    }
    if (h.roof) {
      elemek.push({ A: h.roof.A, U: retegtervU(be, h.roof.panel, 'felfele') });
      Aossz += h.roof.A;
    }
    const fut = (panel: string, A: number, irany: HoaramIrany, tipus: FutetlenTerTipus): void => {
      futetlen.push({ hTrIx: A * retegtervU(be, panel, irany, true), b: { tipus } });
      Aossz += A;
    };
    if (h.attic) fut(h.attic.panel, h.attic.A, 'felfele', 'Padlástérrel határos födém vagy fal');
    if (h.basement) fut(h.basement.panel, h.basement.A, 'lefele', 'Zárt, fűtetlen pincével határos födém vagy fal');
    if (h.garage_wall) fut(h.garage_wall.panel, h.garage_wall.A, 'vizszintes', 'Zárt, fűtetlen garázzsal határos födém vagy fal');
    if (h.floor) {
      padlo = padloU(be, h.floor.panel, h.floor.A, h.floor.P, be.iso!.w);
      const psi = psiPf({
        lambdaFalazat: falazat,
        kulsoFalKialakitasa: 'külső oldali, megszakítatlan hőszigeteléssel',
        labazatiFal: o.labazatiFal,
        padloHoszigetelesR: retegekR(be, h.floor.panel),
      });
      hTrT += talajHoatvitel(h.floor.A, padlo.U, h.floor.P, psi);
      Aossz += h.floor.A;
    }
  }
  const hTrD = direktTranszmisszio({ elemek });
  const hSzF = termeszetesSzellozes(0.5, 1, 0.06, V);
  const ej = { zajPorRendben: true, nincsVagyonvedelmiKockazat: true, automatikusNyitasVagyLako: true };
  const zona: NettoZonaBemenet = {
    aN: be.heated_area,
    V,
    thetaIF: 20,
    thetaIH: 26,
    cmEff: hotaroloKepesseg(o.cmKategoria, be.heated_area),
    hTrD: { F: hTrD, H: hTrD },
    futetlen,
    hTrT,
    hSzell: { F: hSzF, H: HONAPOK.map((m) => hSzF + ejszakaiTobbletSzellozes(m, 6, V, ej)) },
    transzparens,
    qb: 5,
    sigmaF: 1,
    sigmaH: 1,
  };
  return padlo ? { zona, elemek, Aossz, padlo } : { zona, elemek, Aossz };
}

export const relativ = (a: number, b: number): number => Math.abs(a - b) / Math.abs(b);
