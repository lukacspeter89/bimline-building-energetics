// A bemutató egyszerűsített épületmodellje: egyetlen téglatest alakú, egy zónás lakóépület.
// Ez nem a végleges adatmodell; csak a számítási mag kipróbálására szolgál.

export interface Reteg {
  nev: string;
  /** Vastagság [cm]. */
  d: number;
  /** Hővezetési tényező [W/mK]. */
  lambda: number;
}

export type Oldal = 'É' | 'K' | 'D' | 'Ny';
export const OLDALAK: readonly Oldal[] = ['É', 'K', 'D', 'Ny'];

export interface Nyilas {
  oldal: Oldal;
  /** Szélesség és magasság [m], darabszám. */
  x: number;
  y: number;
  db: number;
}

export interface Projekt {
  nev: string;
  funkcio: 'Családi ház*' | 'Egyéb lakóépület*';
  /** Hossz (É–D homlokzat) és szélesség (K–Ny homlokzat) [m], szintszám, belmagasság [m]. */
  hossz: number;
  szelesseg: number;
  szintek: number;
  belmagassag: number;
  /** Melyik homlokzat határos fűtetlen garázzsal (a többi külső fal). */
  garazsOldal: Oldal | 'nincs';
  teto: 'lapostető' | 'padlásfödém';
  padlo: 'talajon fekvő' | 'pince felett';
  falRetegek: Reteg[];
  tetoRetegek: Reteg[];
  padloRetegek: Reteg[];
  garazsfalRetegek: Reteg[];
  ablak: { Ug: number; Uf: number; keretMm: number; g: number };
  nyilasok: Nyilas[];
  ajto: { oldal: Oldal; x: number; y: number; U: number };
  cmKategoria: 1 | 2 | 3 | 4;
  nFilt: number;
  szellozes: { tipus: 'természetes' } | { tipus: 'hővisszanyerős'; n: number; eta: number; dp: number; etaVent: number; uzemido: number };
  futes: {
    hotermelo: 'kondenzációs gázkazán' | 'levegő-víz hőszivattyú';
    hotermeloHelye: 'fűtött térben' | 'fűtött téren kívül';
    hoelado: 'radiátor 55/45' | 'padlófűtés 35/28';
    elosztasHelye: 'fűtött térben' | 'fűtött téren kívül';
    puffer: boolean;
  };
  hmv: { hotermelo: 'a fűtési gázkazán' | 'levegős HMV-hőszivattyú'; cirkulacio: boolean };
  hutes: 'nincs' | 'split klíma';
  napelem: { kWp: number; tajolas: 'D' | 'DK' | 'DNy' | 'K' | 'Ny'; dolesszog: number };
  /** A referenciaépület hőhidassága (a csatlakozási élhosszak nélkül feltevés). */
  refHohidassag: 'gyengén hőhidas' | 'közepesen hőhidas' | 'erősen hőhidas';
}

const FAL: Reteg[] = [
  { nev: 'Vékonyvakolat', d: 0.5, lambda: 0.7 },
  { nev: 'EPS homlokzati hőszigetelés', d: 15, lambda: 0.039 },
  { nev: 'Kerámia falazóblokk 30', d: 30, lambda: 0.184 },
  { nev: 'Mészcementvakolat', d: 1.5, lambda: 0.87 },
];
const LAPOSTETO: Reteg[] = [
  { nev: 'Bitumenes lemez', d: 1, lambda: 0.17 },
  { nev: 'EPS 100 lapostető', d: 25, lambda: 0.035 },
  { nev: 'Vasbeton', d: 20, lambda: 1.55 },
  { nev: 'Mészcementvakolat', d: 1.5, lambda: 0.87 },
];
const PADLAS: Reteg[] = [
  { nev: 'Ásványgyapot', d: 25, lambda: 0.037 },
  { nev: 'Vasbeton', d: 18, lambda: 1.55 },
  { nev: 'Mészcementvakolat', d: 1.5, lambda: 0.87 },
];
const PADLO: Reteg[] = [
  { nev: 'Kerámia burkolat', d: 1, lambda: 1.05 },
  { nev: 'Cementesztrich', d: 6, lambda: 1.4 },
  { nev: 'XPS', d: 15, lambda: 0.035 },
  { nev: 'Vasbeton', d: 10, lambda: 1.55 },
];
const PINCEFODEM: Reteg[] = [
  { nev: 'Kerámia burkolat', d: 1, lambda: 1.05 },
  { nev: 'Cementesztrich', d: 6, lambda: 1.4 },
  { nev: 'Vasbeton', d: 20, lambda: 1.55 },
  { nev: 'Kőzetgyapot lamella', d: 15, lambda: 0.04 },
];
const GARAZSFAL: Reteg[] = [
  { nev: 'Mészcementvakolat', d: 1.5, lambda: 0.87 },
  { nev: 'Kerámia falazóblokk 30', d: 30, lambda: 0.184 },
  { nev: 'EPS homlokzati hőszigetelés', d: 8, lambda: 0.039 },
  { nev: 'Vékonyvakolat', d: 0.5, lambda: 0.7 },
];
const ABLAK = { Ug: 0.6, Uf: 1.0, keretMm: 110, g: 0.5 };
const masol = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

/** A WinWatt golden esetek eredménye (tests/golden/expected, WinWatt fecske 9.58). */
export interface WinWattEredmeny {
  Ep: number;
  CO2: number;
  besorolasEp: string;
  QFnet: number;
  futesMinosites: string | null;
  hmvMinosites: string | null;
}

export interface Minta {
  azon: string;
  cim: string;
  projekt: Projekt;
  winwatt: WinWattEredmeny;
}

const alap = (): Omit<Projekt, 'nev' | 'hossz' | 'szelesseg' | 'szintek' | 'nyilasok' | 'futes' | 'hmv'> => ({
  funkcio: 'Családi ház*',
  belmagassag: 2.7,
  garazsOldal: 'nincs',
  teto: 'lapostető',
  padlo: 'talajon fekvő',
  falRetegek: masol(FAL),
  tetoRetegek: masol(LAPOSTETO),
  padloRetegek: masol(PADLO),
  garazsfalRetegek: masol(GARAZSFAL),
  ablak: { ...ABLAK },
  ajto: { oldal: 'É', x: 1, y: 2.1, U: 1.4 },
  cmKategoria: 3,
  nFilt: 0.06,
  szellozes: { tipus: 'természetes' },
  hutes: 'nincs',
  napelem: { kWp: 0, tajolas: 'D', dolesszog: 30 },
  refHohidassag: 'erősen hőhidas',
});

export const MINTAK: readonly Minta[] = [
  {
    azon: 'G1',
    cim: 'G1 · földszintes lapostetős ház, gázkazán',
    projekt: {
      ...alap(),
      nev: 'G1 – földszintes lapostetős ház',
      hossz: 12,
      szelesseg: 8,
      szintek: 1,
      nyilasok: [
        { oldal: 'D', x: 1.5, y: 1.5, db: 4 },
        { oldal: 'K', x: 1.2, y: 1.2, db: 1 },
        { oldal: 'Ny', x: 1.2, y: 1.2, db: 1 },
        { oldal: 'É', x: 0.9, y: 1.2, db: 1 },
      ],
      futes: { hotermelo: 'kondenzációs gázkazán', hotermeloHelye: 'fűtött térben', hoelado: 'radiátor 55/45', elosztasHelye: 'fűtött térben', puffer: false },
      hmv: { hotermelo: 'a fűtési gázkazán', cirkulacio: false },
    },
    winwatt: { Ep: 88.2, CO2: 23.39, besorolasEp: 'B', QFnet: 3912, futesMinosites: 'jó', hmvMinosites: 'jó' },
  },
  {
    azon: 'G2',
    cim: 'G2 · kétszintes ház, hőszivattyú, napelem',
    projekt: {
      ...alap(),
      nev: 'G2 – kétszintes ház hideg padlással',
      hossz: 10,
      szelesseg: 8,
      szintek: 2,
      teto: 'padlásfödém',
      tetoRetegek: masol(PADLAS),
      nyilasok: [
        { oldal: 'D', x: 2.0, y: 2.2, db: 2 },
        { oldal: 'D', x: 1.2, y: 1.5, db: 1 },
        { oldal: 'D', x: 1.5, y: 1.5, db: 3 },
        { oldal: 'K', x: 1.2, y: 1.5, db: 2 },
        { oldal: 'Ny', x: 1.2, y: 1.5, db: 2 },
        { oldal: 'É', x: 0.9, y: 1.2, db: 3 },
      ],
      futes: { hotermelo: 'levegő-víz hőszivattyú', hotermeloHelye: 'fűtött térben', hoelado: 'padlófűtés 35/28', elosztasHelye: 'fűtött térben', puffer: true },
      hmv: { hotermelo: 'levegős HMV-hőszivattyú', cirkulacio: false },
      napelem: { kWp: 4, tajolas: 'D', dolesszog: 30 },
    },
    winwatt: { Ep: -5.79, CO2: 1.42, besorolasEp: 'A+++', QFnet: 4608, futesMinosites: 'kiváló', hmvMinosites: 'jó' },
  },
  {
    azon: 'G3',
    cim: 'G3 · pince és garázs mellett, hővisszanyerő, split',
    projekt: {
      ...alap(),
      nev: 'G3 – fűtetlen pince és garázs mellett',
      hossz: 12,
      szelesseg: 8,
      szintek: 1,
      garazsOldal: 'Ny',
      padlo: 'pince felett',
      padloRetegek: masol(PINCEFODEM),
      nyilasok: [
        { oldal: 'D', x: 2.4, y: 2.2, db: 2 },
        { oldal: 'D', x: 1.2, y: 1.5, db: 1 },
        { oldal: 'K', x: 1.2, y: 1.5, db: 1 },
        { oldal: 'É', x: 0.9, y: 1.2, db: 1 },
      ],
      szellozes: { tipus: 'hővisszanyerős', n: 0.5, eta: 0.85, dp: 150, etaVent: 0.5, uzemido: 5088 },
      futes: { hotermelo: 'levegő-víz hőszivattyú', hotermeloHelye: 'fűtött térben', hoelado: 'padlófűtés 35/28', elosztasHelye: 'fűtött térben', puffer: false },
      hmv: { hotermelo: 'levegős HMV-hőszivattyú', cirkulacio: false },
      hutes: 'split klíma',
    },
    winwatt: { Ep: 52.19, CO2: 10.55, besorolasEp: 'A+', QFnet: 1068, futesMinosites: null, hmvMinosites: 'jó' },
  },
];

export const mintaMasolat = (m: Minta): Projekt => masol(m.projekt);
