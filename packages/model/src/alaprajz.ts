// Rajzolt alaprajz → helyiségadatok. A kontúr belméretű (1. függ. 5., JEL-004, MOD-006): az alapterület a sokszög
// területe, a fal felülete a szabad (más fűtött helyiséggel nem közös) élhossz × belmagasság, a tájolás az él kifelé
// mutató normálisából és az északi irányból.
import type { Tajolas } from '@bimline/calc-core';
import type { Hatarolo, Helyiseg, Pont, Projekt, Retegrend } from './projekt.js';

const EPS = 0.01;

/** Előjeles terület [m²] (pozitív: az óramutatóval ellentétes körüljárás). */
export function elojelesTerulet(p: readonly Pont[]): number {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i]!;
    const b = p[(i + 1) % p.length]!;
    s += a.x * b.y - b.x * a.y;
  }
  return s / 2;
}

export interface El {
  i: number;
  a: Pont;
  b: Pont;
  hossz: number;
  /** A kifelé mutató normális iránya északtól az óramutató járásával [°], az északi iránnyal korrigálva. */
  azimut: number;
}

export function elek(pontok: readonly Pont[], eszakSzog = 0): El[] {
  const ccw = elojelesTerulet(pontok) > 0;
  return pontok.map((a, i) => {
    const b = pontok[(i + 1) % pontok.length]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    // Kifelé mutató normális: CCW körüljárásnál az él jobb oldala.
    const nx = ccw ? dy : -dy;
    const ny = ccw ? -dx : dx;
    const rajzAzimut = (Math.atan2(nx, ny) * 180) / Math.PI;
    return { i, a, b, hossz: Math.hypot(dx, dy), azimut: (((rajzAzimut - eszakSzog) % 360) + 360) % 360 };
  });
}

const TAJOLAS_8: readonly Tajolas[] = ['É', 'ÉK', 'K', 'DK', 'D', 'DNy', 'Ny', 'ÉNy'];

/** A legközelebbi 8 fő égtáj (45°-os szektorok, a határon az óramutató szerinti következő). */
export function tajolasAzimutbol(az: number): Tajolas {
  return TAJOLAS_8[Math.floor(((((az + 22.5) % 360) + 360) % 360) / 45)]!;
}

/** Két él közös (egy egyenesbe eső, egymásra fekvő) szakaszának hossza [m]. */
export function kozosHossz(e: El, f: El): number {
  const ux = (e.b.x - e.a.x) / e.hossz;
  const uy = (e.b.y - e.a.y) / e.hossz;
  const tav = (q: Pont): number => Math.abs((q.x - e.a.x) * uy - (q.y - e.a.y) * ux);
  // Az irány nem számít: a helyiségek körüljárása eltérhet (téglalap és kézzel rajzolt sokszög).
  if (tav(f.a) > EPS || tav(f.b) > EPS) return 0;
  const t = (q: Pont): number => (q.x - e.a.x) * ux + (q.y - e.a.y) * uy;
  const lo = Math.max(0, Math.min(t(f.a), t(f.b)));
  const hi = Math.min(e.hossz, Math.max(t(f.a), t(f.b)));
  return Math.max(0, hi - lo);
}

export interface ElAllapot extends El {
  /** Más fűtött helyiséggel közös hossz [m]. */
  kozos: number;
  /** Szabad hossz [m]: hossz − közös. */
  szabad: number;
}

/** A helyiség élei a szomszédos (azonos szintű, rajzolt) helyiségekkel közös hosszal. */
export function helyisegElek(p: Projekt, h: Helyiseg): ElAllapot[] {
  if (!h.alaprajz || h.alaprajz.pontok.length < 3) return [];
  const sz = p.epulet.eszakSzog ?? 0;
  const sajat = elek(h.alaprajz.pontok, sz);
  const masok = p.helyisegek.filter((x) => x !== h && x.szint === h.szint && x.alaprajz && x.alaprajz.pontok.length >= 3).flatMap((x) => elek(x.alaprajz!.pontok, sz));
  return sajat.map((e) => {
    const kozos = Math.min(e.hossz, masok.reduce((s, f) => s + kozosHossz(e, f), 0));
    return { ...e, kozos, szabad: Math.max(0, e.hossz - kozos) };
  });
}

const kerek = (x: number): number => Math.round(x * 1e4) / 1e4;

const ALATTI_TIPUSOK = new Set(['talajon_fekvo_padlo', 'also_zarofodem_futetlen_felett', 'arkad_athajto_feletti_fodem']);

/** Az alaprajzi szerkezetrész oldala; a régi (`true`) jelölésnél a szerkezettípusból. */
export function alapOldal(b: Hatarolo, r: Retegrend | undefined): 'alatta' | 'felette' | null {
  if (!b.rajzAlap) return null;
  if (b.rajzAlap !== true) return b.rajzAlap;
  return r && ALATTI_TIPUSOK.has(r.szerkezet) ? 'alatta' : 'felette';
}

export interface AlapReszek {
  /** A megadott alaprajzi területek összege [m²]. */
  megadott: number;
  /** A terület nélküli részek közt egyenlően elosztott maradék [m²] (egy részre). */
  maradekResz: number;
  /** A területet nem fedi le teljesen (nincs maradékot átvevő rész, és a megadott összeg kisebb). */
  hiany: number;
  /** A megadott területek összege nagyobb az alapterületnél. */
  tobblet: number;
}

/** Az alatta vagy felette lévő részek területmérlege. */
export function alapReszek(h: Helyiseg, reszek: readonly Hatarolo[]): AlapReszek {
  const megadott = reszek.reduce((s, b) => s + (b.alaprajziTerulet ?? 0), 0);
  const szabadok = reszek.filter((b) => b.alaprajziTerulet === undefined).length;
  const maradek = Math.max(0, h.alapterulet - megadott);
  return {
    megadott,
    maradekResz: szabadok ? maradek / szabadok : 0,
    hiany: szabadok || reszek.length === 0 ? 0 : maradek,
    tobblet: Math.max(0, megadott - h.alapterulet),
  };
}

/**
 * A rajzból származó értékek beírása (helyben): alapterület; élhez kötött határoló felülete, tájolása, hajlásszöge;
 * alaprajzi padló / födém felülete; padlónál a kitett kerület = a helyiség külső levegővel vagy fűtetlen térrel
 * határos éleinek szabad hossza (4.20: a szomszédos fűtetlen tér felé eső csatlakozással együtt).
 */
export function rajzSzinkron(p: Projekt): void {
  for (const h of p.helyisegek) {
    if (!h.alaprajz || h.alaprajz.pontok.length < 3) continue;
    const el = helyisegElek(p, h);
    h.alapterulet = kerek(Math.abs(elojelesTerulet(h.alaprajz.pontok)));
    const kitett = h.hatarolok
      .filter((b) => b.rajzEl !== undefined && (b.tuloldal.fajta === 'külső' || b.tuloldal.fajta === 'fűtetlen'))
      .reduce((s, b) => s + (el[b.rajzEl!]?.szabad ?? 0), 0);
    const rr = new Map(p.retegrendek.map((r) => [r.azon, r]));
    const oldal = { alatta: [] as Hatarolo[], felette: [] as Hatarolo[] };
    for (const b of h.hatarolok) {
      const o = alapOldal(b, rr.get(b.retegrendAzon));
      if (o) {
        b.rajzAlap = o;
        oldal[o].push(b);
      }
    }
    const resz = { alatta: alapReszek(h, oldal.alatta), felette: alapReszek(h, oldal.felette) };
    for (const b of h.hatarolok) {
      if (b.rajzEl !== undefined) {
        const e = el[b.rajzEl];
        if (!e) continue;
        b.felulet = kerek(e.szabad * h.belmagassag);
        b.hajlasszog = 90;
        b.tajolas = tajolasAzimutbol(e.azimut);
      } else if (b.rajzAlap === 'alatta' || b.rajzAlap === 'felette') {
        // Ferde tető: a felület a vízszintes vetület / cos α.
        const vetulet = b.alaprajziTerulet ?? resz[b.rajzAlap].maradekResz;
        const a = b.rajzAlap === 'felette' ? (b.hajlasszog ?? 0) : 0;
        b.felulet = kerek(a > 0 && a < 90 ? vetulet / Math.cos((a * Math.PI) / 180) : vetulet);
        // Kitett kerület csak akkor a rajzból, ha a padló egyetlen, talajon fekvő rész; vegyes padlónál kézzel adandó.
        if (b.rajzAlap === 'alatta' && b.tuloldal.fajta === 'talaj' && oldal.alatta.length === 1) b.kitettKerulet = kerek(kitett);
      }
    }
    // Törölt élre mutató határoló nem maradhat.
    h.hatarolok = h.hatarolok.filter((b) => b.rajzEl === undefined || b.rajzEl < el.length);
  }
}
