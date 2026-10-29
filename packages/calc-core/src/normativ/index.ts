import { NormativAdatHiba } from '../hibak.js';
import { NORMATIV_FAJLOK, type NormativFajl } from './fajlok.js';
import type { NormativSor, NormativTabla } from './tipusok.js';

export type { NormativFajl } from './fajlok.js';
export type { NormativForras, NormativSor, NormativTabla } from './tipusok.js';
export { NORMATIV_FAJLOK } from './fajlok.js';

/** Hivatkozás egy normatív táblázatra: `"<mappa>/<fájl>#<táblázat-id>"`, ahogy a követelménymátrix írja. */
export type TablaHivatkozas = `${NormativFajl}#${string}`;

/** A hivatkozott táblázat; ha nincs ilyen, NormativAdatHiba. */
export function tabla(hivatkozas: TablaHivatkozas): NormativTabla {
  const [fajl, id] = hivatkozas.split('#') as [NormativFajl, string];
  const tartalom = NORMATIV_FAJLOK[fajl];
  const t = tartalom?.tablazatok.find((x) => x.id === id);
  if (!t) throw new NormativAdatHiba(`Hiányzó normatív táblázat: ${hivatkozas}`, hivatkozas);
  return t;
}

/** Egy sor számértékű mezője; ha a mező hiányzik vagy nem szám, NormativAdatHiba. */
export function szamMezo(sor: NormativSor, kulcs: string, hivatkozas: string): number {
  const v = sor[kulcs];
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw new NormativAdatHiba(`A(z) ${hivatkozas} táblázat „${kulcs}” mezője nem szám: ${String(v)}`, hivatkozas);
  }
  return v;
}

/** Az első sor, amelyre a feltétel teljesül; ha nincs, NormativAdatHiba. */
export function sorKeres(hivatkozas: TablaHivatkozas, feltetel: (sor: NormativSor) => boolean): NormativSor {
  const sor = tabla(hivatkozas).sorok.find(feltetel);
  if (!sor) throw new NormativAdatHiba(`Nincs a feltételnek megfelelő sor: ${hivatkozas}`, hivatkozas);
  return sor;
}

/**
 * Kulcs–érték jellegű táblázat (`alapertekek_*`, `kulcs` + `ertek` oszlop) egy értéke.
 * A számítási kód a módszer szövegében megadott konstansokat ezen keresztül olvassa.
 */
export function alapertek(hivatkozas: TablaHivatkozas, kulcs: string): number {
  const sor = sorKeres(hivatkozas, (s) => s['kulcs'] === kulcs);
  return szamMezo(sor, 'ertek', `${hivatkozas}/${kulcs}`);
}

/** Kulcs–érték táblázat lista típusú értéke (pl. hónapok listája). */
export function alapertekLista(hivatkozas: TablaHivatkozas, kulcs: string): readonly number[] {
  const sor = sorKeres(hivatkozas, (s) => s['kulcs'] === kulcs);
  const v = sor['ertek'];
  if (!Array.isArray(v) || !v.every((x) => typeof x === 'number')) {
    throw new NormativAdatHiba(`A(z) ${hivatkozas}/${kulcs} érték nem számlista.`, hivatkozas);
  }
  return v as number[];
}
