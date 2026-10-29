import { ErvenytelenBemenet, NormativAdatHiba } from '../hibak.js';
import { linearisInterpolacio } from '../kozos/interpolacio.js';
import { szamMezo, tabla, type NormativSor, type TablaHivatkozas } from '../normativ/index.js';

/** Eredmény jelzőkkel: a felületen és a dokumentációban látszik, ha forráshiány miatt helyettesítő érték került be. */
export interface Jelolt<T> {
  ertek: T;
  /** Megjegyzések (pl. „D-020: forráshiány – helyettesítő érték”). */
  jelzesek: string[];
}

/**
 * Alapterület szerinti táblázat egy oszlopának értéke a rendszer-alapterületnél (RA-021, RA-022; 1. függ. 7. fej., 55. o.):
 * - a számszerű A_rszr sorok között lineáris interpoláció, a tartományon kívül a szélső érték (D-021);
 * - a „> X” sor (A_rszr = null, A_rszr_min = X) X felett állandó érték (D-118);
 * - üres (null) cellánál az oszlop legközelebbi kitöltött értéke, jelöléssel (D-020).
 */
export function alapteruletTablaErtek(hiv: TablaHivatkozas, oszlop: string, aRszr: number): Jelolt<number> {
  if (!(aRszr > 0)) throw new ErvenytelenBemenet(`Érvénytelen rendszer-alapterület: ${aRszr}`, 'RA-021');
  const sorok = tabla(hiv).sorok;
  // A táblázatok az alapterületet „A_rszr” vagy („Alapterületig” fejlécnél) „A_rszr_max” kulccsal adják meg (D-122).
  const pont = (s: NormativSor): number | null =>
    typeof s['A_rszr'] === 'number' ? s['A_rszr'] : typeof s['A_rszr_max'] === 'number' ? s['A_rszr_max'] : null;
  const nyitottHatar = (s: NormativSor): number | null =>
    pont(s) !== null ? null : typeof s['A_rszr_min'] === 'number' ? s['A_rszr_min'] : typeof s['A_rszr_min_kizart'] === 'number' ? s['A_rszr_min_kizart'] : null;
  const nyitott = sorok.find((s) => nyitottHatar(s) !== null);
  if (nyitott && aRszr > nyitottHatar(nyitott)!) {
    const v = nyitott[oszlop];
    if (typeof v === 'number') return { ertek: v, jelzesek: [] };
  }
  const szamos = sorok.filter((s) => pont(s) !== null);
  const kitoltott = szamos.filter((s) => typeof s[oszlop] === 'number');
  if (kitoltott.length === 0) throw new NormativAdatHiba(`A(z) ${hiv} „${oszlop}” oszlopa üres.`, hiv);
  const a = (s: NormativSor): number => pont(s)!;
  // A keresett alapterületet közrefogó sorok (a tartományon kívül a szélső sor).
  const also = [...szamos].reverse().find((s) => a(s) <= aRszr) ?? szamos[0]!;
  const felso = szamos.find((s) => a(s) >= aRszr) ?? szamos[szamos.length - 1]!;
  if (typeof also[oszlop] !== 'number' || typeof felso[oszlop] !== 'number') {
    const legkozelebbi = [...kitoltott].sort((x, y) => Math.abs(a(x) - aRszr) - Math.abs(a(y) - aRszr))[0]!;
    return {
      ertek: szamMezo(legkozelebbi, oszlop, hiv),
      jelzesek: [
        `D-020: a ${hiv} táblázat „${oszlop}” oszlopa ${aRszr} m²-nél üres; helyettesítő érték a ${a(legkozelebbi)} m²-es sorból.`,
      ],
    };
  }
  const pontok = szamos.map((s) => [a(s), s[oszlop]] as const).filter((p): p is readonly [number, number] => typeof p[1] === 'number');
  return { ertek: linearisInterpolacio(pontok, aRszr), jelzesek: [] };
}

/** Hőfoklépcső (előremenő / visszatérő hőmérséklet) [°C]. */
export interface Hofoklepcso {
  elore: number;
  vissza: number;
}

/** A hőfoklépcső számtani középhőmérséklete – az interpoláció változója (DONTESEK.md D-119). */
export function kozepHomerseklet(h: Hofoklepcso): number {
  if (!(h.elore >= h.vissza) || !Number.isFinite(h.elore) || !Number.isFinite(h.vissza)) {
    throw new ErvenytelenBemenet('Érvénytelen hőfoklépcső (előremenő ≥ visszatérő kell).', 'RA-024');
  }
  return (h.elore + h.vissza) / 2;
}

/**
 * Hőfoklépcső szerinti lineáris interpoláció a táblázati hőfoklépcsők között (RA-024, FUT-031, FUT-048):
 * a változó a közepes hőmérséklet (D-119), a tartományon kívül a szélső érték (D-021).
 */
export function hofoklepcsoInterpolacio(pontok: readonly { h: Hofoklepcso; ertek: number }[], h: Hofoklepcso): number {
  const xy = pontok
    .map((p) => [kozepHomerseklet(p.h), p.ertek] as const)
    .sort((a, b) => a[0] - b[0]);
  return linearisInterpolacio(xy, kozepHomerseklet(h));
}
