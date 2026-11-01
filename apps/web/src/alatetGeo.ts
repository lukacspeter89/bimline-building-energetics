// Az alátét tiszta geometriai része (pdf.js nélkül, tesztelhető): elhelyezés, lépték, igazítás, tervi feliratok.
import type { Pont } from '@bimline/model';

/** A tervi helyiségfelirat: terület és a közelében lévő szavak (szám, név, burkolat), a kép pixeleiben. */
export interface TerviCimke {
  u: number;
  v: number;
  A: number;
  szam: string;
  nev: string;
}

/** Egy szint alátétje. A kép (u, v) pixelje a világban: (x0, y0) + R(φ)·(u·s, −v·s). */
export interface Alatet {
  kep: string;
  w: number;
  h: number;
  /** m / px */
  s: number;
  /** forgatás a világban, az óramutatóval ellentétesen [°] */
  fi: number;
  x0: number;
  y0: number;
  atlatszo: number;
  cimkek: TerviCimke[];
  /** a 1:50-es lépték feltételezésével számolt m/px (a PDF pont-mértékéből) */
  s50?: number;
  /** Az északi irány a terven: a lap tetejétől az óramutató járásával [°]. */
  eszakLapon?: number;
}

export function vilagba(a: Alatet, u: number, v: number): Pont {
  const f = (a.fi * Math.PI) / 180;
  const dx = u * a.s;
  const dy = -v * a.s;
  return { x: a.x0 + Math.cos(f) * dx - Math.sin(f) * dy, y: a.y0 + Math.sin(f) * dx + Math.cos(f) * dy };
}

/** Lépték két ponttal: a valós távolság szerint, az A pont helyben marad. */
export function leptekezes(a: Alatet, A: Pont, B: Pont, valos: number): Alatet {
  const most = Math.hypot(B.x - A.x, B.y - A.y);
  if (!(most > 0) || !(valos > 0)) return a;
  const k = valos / most;
  return { ...a, s: a.s * k, x0: A.x + k * (a.x0 - A.x), y0: A.y + k * (a.y0 - A.y) };
}

/** Igazítás egy falra: a két pont egyenese a legközelebbi vízszintes vagy függőleges irányba fordul, A körül. */
export function igazitas(a: Alatet, A: Pont, B: Pont): Alatet {
  const alfa = (Math.atan2(B.y - A.y, B.x - A.x) * 180) / Math.PI;
  const delta = Math.round(alfa / 90) * 90 - alfa;
  const d = (delta * Math.PI) / 180;
  const ox = a.x0 - A.x;
  const oy = a.y0 - A.y;
  return { ...a, fi: a.fi + delta, x0: A.x + Math.cos(d) * ox - Math.sin(d) * oy, y0: A.y + Math.sin(d) * ox + Math.cos(d) * oy };
}

/** Pont a sokszögben (páros-páratlan szabály). */
const benne = (q: Pont, p: readonly Pont[]): boolean => {
  let b = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const a = p[i]!;
    const c = p[j]!;
    if (a.y > q.y !== c.y > q.y && q.x < ((c.x - a.x) * (q.y - a.y)) / (c.y - a.y) + a.x) b = !b;
  }
  return b;
};

/** A rajzolt helyiségbe eső tervi felirat (a legközelebbi a súlyponthoz, ha több van). */
export function cimkeABen(a: Alatet, pontok: readonly Pont[]): TerviCimke | undefined {
  const belul = a.cimkek.filter((c) => benne(vilagba(a, c.u, c.v), pontok));
  if (belul.length <= 1) return belul[0];
  const sx = pontok.reduce((s, q) => s + q.x, 0) / pontok.length;
  const sy = pontok.reduce((s, q) => s + q.y, 0) / pontok.length;
  return belul.reduce((m, c) => {
    const w = vilagba(a, c.u, c.v);
    const v = vilagba(a, m.u, m.v);
    return Math.hypot(w.x - sx, w.y - sy) < Math.hypot(v.x - sx, v.y - sy) ? c : m;
  });
}

const BURKOLAT = /^(laminált|padló|csm\.?|ker\.?|kerámia|beton|térkő|sim\.?|műgyanta|lamináltpadló|csm\.ker\.)$/i;

/** Helyiségfeliratok egy szövegelem-listából: „20,01 m2” (vagy „20,01” + „m” + „2”) és a 2,5 m-en belüli szavak. */
export function cimkekSzovegbol(elemek: readonly { str: string; x: number; y: number }[], pxPerM50: number): TerviCimke[] {
  const ki: TerviCimke[] = [];
  const sugar = 1.1 * pxPerM50;
  elemek.forEach((e, i) => {
    const m = /^(\d+,\d\d)\s*(m2|m²|m)?$/.exec(e.str.trim());
    if (!m) return;
    const kov = elemek[i + 1]?.str.trim() ?? '';
    if (!m[2] && kov !== 'm' && kov !== 'm2' && kov !== 'm²') return;
    // A közeli szövegelemek szavai, távolság szerint; a burkolat szavai és a 2. számjel utáni (szomszéd) nevek nélkül.
    const kozel = elemek
      .filter((x) => x !== e && Math.hypot(x.x - e.x, x.y - e.y) < sugar)
      .sort((x, y) => Math.hypot(x.x - e.x, x.y - e.y) - Math.hypot(y.x - e.x, y.y - e.y))
      .flatMap((x) => x.str.trim().split(/\s+/));
    const szam = kozel.find((t) => /^\d\d\/\d+(\/\d+)?$/.test(t)) ?? '';
    const szavak = kozel.filter((t) => /[a-záéíóöőúüű]{3,}/i.test(t) && !BURKOLAT.test(t));
    const nev = szavak.slice(0, 2).join(' ');
    ki.push({ u: e.x, v: e.y, A: Number(m[1]!.replace(',', '.')), szam, nev });
  });
  return ki;
}

