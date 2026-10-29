import { ErvenytelenBemenet, ReszletesModszerSzukseges } from '../hibak.js';
import { linearisInterpolacio } from '../kozos/interpolacio.js';
import { alapertek, szamMezo, tabla, type TablaHivatkozas } from '../normativ/index.js';
import type { Tajolas } from '../netto/eghajlat.js';

const T = (id: string): TablaHivatkozas => `modszer/megujulok#${id}`;

/**
 * Napelemek éves energiatermelése, egyszerűsített módszer: W_PV = w_PV·P_PV,össz, (13.1) (1. függ. 13.2.1, 87. o.).
 * Legfeljebb 20 kWp mono- és polikristályos rendszerre; északi tájolásra a 13.1. táblázat nem ad értéket.
 * Köztes hajlásszögnél lineáris interpoláció (D-133). Egyszerűsített módszernél a teljes termelés exportáltként
 * számolandó, az épület villamosenergia-igénye hálózatról vételezett (13.1).
 */
export function napelemTermeles(PkWp: number, tajolas: Tajolas, hajlasszog: number): number {
  if (!(PkWp > 0)) throw new ErvenytelenBemenet('Érvénytelen beépített teljesítmény.', 'MEG-004');
  if (!(hajlasszog >= 0 && hajlasszog <= 90)) throw new ErvenytelenBemenet('A hajlásszög 0 és 90° között adható meg.', 'MEG-004');
  if (PkWp > alapertek(T('alapertekek_13'), 'P_PV_ossz_max_egyszerusitett')) {
    throw new ReszletesModszerSzukseges('20 kWp felett a (13.1) egyszerűsített képlet nem alkalmazható.', 'MEG-004');
  }
  const oszlop = { K: 'K_Ny', Ny: 'K_Ny', DK: 'DK_DNy', DNy: 'DK_DNy', D: 'D' }[tajolas as 'K' | 'Ny' | 'DK' | 'DNy' | 'D'];
  if (!oszlop) throw new ReszletesModszerSzukseges('Északi tájolású napelemre a 13.1. táblázat nem ad értéket.', 'MEG-004');
  const hiv = T('tabla_13_1');
  const pontok = tabla(hiv).sorok.map((s) => [szamMezo(s, 'hajlasszog', hiv), szamMezo(s, oszlop, hiv)] as const);
  return linearisInterpolacio(pontok, hajlasszog) * PkWp;
}
