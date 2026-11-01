import { ErvenytelenBemenet } from '../hibak.js';
import { linearisInterpolacio } from '../kozos/interpolacio.js';
import { szamMezo, sorKeres, tabla, type TablaHivatkozas } from '../normativ/index.js';

const TABLA_1_1: TablaHivatkozas = 'modszer/eghajlat#tabla_f2_1_1';
const TABLA_1_6: TablaHivatkozas = 'modszer/eghajlat#tabla_f2_1_6';

export type Honap = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export const HONAPOK: readonly Honap[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const mKulcs = (m: Honap): string => `m${String(m).padStart(2, '0')}`;

/**
 * A hónap hossza órában, nem szökőévre (a havi számítási időszak, Δt). A november–március összeg 3624 h,
 * ami egyezik a (6.53) képlet Δt értékével (1. függ. 6.11, 52. o.) – ezt teszt ellenőrzi.
 */
export function honapOrak(m: Honap): number {
  return new Date(Date.UTC(2023, m, 0)).getUTCDate() * 24;
}

/** Havi külső átlaghőmérséklet θ_e,átlag [°C] (KLI-003; 2. függ. 1.1. táblázat, 1. o.). */
export function kulsoHomerseklet(m: Honap): number {
  return szamMezo(tabla(TABLA_1_1).sorok[0]!, mKulcs(m), TABLA_1_1);
}

/** Éves külső átlaghőmérséklet θ_e,év [°C] (KLI-004; 2. függ. 1.1. táblázat „Éves” oszlop). */
export function evesKulsoHomerseklet(): number {
  return szamMezo(tabla(TABLA_1_1).sorok[0]!, 'eves', TABLA_1_1);
}

/** A 2. függ. 1.6. táblázat tájolásai. */
export type Tajolas = 'É' | 'ÉK' | 'K' | 'DK' | 'D' | 'DNy' | 'Ny' | 'ÉNy';

const HAJLASSZOGEK = [30, 45, 60, 90] as const;

/**
 * Havi sugárzási energiahozam G_s,i [kWh/m²] tájolás és hajlásszög szerint (KLI-023, KLI-024; 2. függ. 1.6. táblázat, 4. o.).
 * 0° hajlásszögnél a „vízszintes” sor. 0° és 90° között a táblázati hajlásszögek (0, 30, 45, 60, 90)
 * között lineárisan interpolál (DONTESEK.md D-109).
 */
export function sugarzas(tajolas: Tajolas, hajlasszog: number, m: Honap): number {
  if (!(hajlasszog >= 0 && hajlasszog <= 90)) {
    throw new ErvenytelenBemenet(`A hajlásszög 0° és 90° között adható meg: ${hajlasszog}`, 'KLI-025');
  }
  const k = mKulcs(m);
  const vizszintes = szamMezo(sorKeres(TABLA_1_6, (s) => s['tajolas'] === 'vízszintes'), k, TABLA_1_6);
  const pontok: [number, number][] = [[0, vizszintes]];
  for (const h of HAJLASSZOGEK) {
    pontok.push([h, szamMezo(sorKeres(TABLA_1_6, (s) => s['tajolas'] === tajolas && s['hajlasszog'] === h), k, TABLA_1_6)]);
  }
  return linearisInterpolacio(pontok, hajlasszog);
}
